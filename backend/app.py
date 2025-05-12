from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import PyPDF2
import re
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load model
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def mean_pooling(model_output, attention_mask):
    """Mean pooling to get sentence embeddings."""
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_embeddings(text):
    """Get embeddings for a text using the model."""
    inputs = tokenizer(text, padding=True, truncation=True, return_tensors="pt", max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = mean_pooling(outputs, inputs["attention_mask"])
    return embeddings

def extract_skills_from_text(text):
    """Extract skills from text using a simple keyword approach."""
    # This is a simplified approach - in a real application, you might use NER or a more sophisticated method
    common_skills = [
        "python", "javascript", "java", "c++", "c#", "ruby", "php", "swift", "kotlin", "go",
        "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", "asp.net",
        "html", "css", "sql", "nosql", "mongodb", "postgresql", "mysql", "oracle", "aws", "azure",
        "gcp", "docker", "kubernetes", "jenkins", "git", "agile", "scrum", "jira", "machine learning",
        "data science", "ai", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
        "pandas", "numpy", "scikit-learn", "tableau", "power bi", "excel", "word", "powerpoint",
        "project management", "leadership", "communication", "teamwork", "problem solving"
    ]

    skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill in text_lower:
            skills.append(skill)

    return skills

def calculate_keyword_match(resume_text, job_text):
    """Calculate keyword match between resume and job description."""
    # Create a vocabulary of words from both texts
    vectorizer = CountVectorizer(stop_words='english')
    count_matrix = vectorizer.fit_transform([resume_text.lower(), job_text.lower()])

    # Get the feature names (words)
    feature_names = vectorizer.get_feature_names_out()

    # Get the word counts for resume and job description
    resume_word_counts = count_matrix[0].toarray()[0]
    job_word_counts = count_matrix[1].toarray()[0]

    # Find matching keywords
    matching_keywords = []
    missing_keywords = []

    for idx, word in enumerate(feature_names):
        if job_word_counts[idx] > 0:  # Word appears in job description
            if resume_word_counts[idx] > 0:  # Word also appears in resume
                matching_keywords.append(word)
            else:  # Word doesn't appear in resume
                missing_keywords.append(word)

    return {
        "matching_keywords": matching_keywords,
        "missing_keywords": missing_keywords,
        "match_percentage": len(matching_keywords) / (len(matching_keywords) + len(missing_keywords)) * 100 if (len(matching_keywords) + len(missing_keywords)) > 0 else 0
    }

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze resume and job description."""
    if 'resume' not in request.files or 'jobDescription' not in request.form:
        return jsonify({"error": "Missing resume file or job description"}), 400

    resume_file = request.files['resume']
    job_description = request.form['jobDescription']

    # Extract text from resume
    resume_text = extract_text_from_pdf(resume_file)

    # Get embeddings
    resume_embedding = get_embeddings(resume_text)
    job_embedding = get_embeddings(job_description)

    # Calculate similarity score
    similarity = cosine_similarity(
        resume_embedding.numpy().reshape(1, -1),
        job_embedding.numpy().reshape(1, -1)
    )[0][0]

    # Extract skills
    resume_skills = extract_skills_from_text(resume_text)
    job_skills = extract_skills_from_text(job_description)

    # Find matching and missing skills
    matching_skills = list(set(resume_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(resume_skills))

    # Calculate keyword match
    keyword_match = calculate_keyword_match(resume_text, job_description)

    # Calculate skills match percentage
    skills_match_percentage = len(matching_skills) / len(job_skills) * 100 if job_skills else 0

    # Generate improvement suggestions
    suggestions = []
    if missing_skills:
        suggestions.append(f"Consider adding these skills to your resume: {', '.join(missing_skills)}")
    if keyword_match['missing_keywords']:
        important_missing = keyword_match['missing_keywords'][:10]  # Limit to top 10
        suggestions.append(f"Add these keywords to your resume: {', '.join(important_missing)}")
    if skills_match_percentage < 70:
        suggestions.append("Your skills match is below 70%. Consider tailoring your resume more closely to the job requirements.")

    return jsonify({
        "similarity_score": float(similarity) * 100,
        "skills_match": {
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "match_percentage": skills_match_percentage
        },
        "keyword_optimization": {
            "matching_keywords": keyword_match["matching_keywords"][:20],  # Limit to top 20
            "missing_keywords": keyword_match["missing_keywords"][:20],  # Limit to top 20
            "match_percentage": keyword_match["match_percentage"]
        },
        "improvement_suggestions": suggestions
    })

if __name__ == '__main__':
    app.run(debug=True, port=5002)
