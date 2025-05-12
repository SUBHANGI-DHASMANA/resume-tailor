# AI Resume Tailor

An AI-powered web application that helps job seekers optimize their resumes for specific job descriptions.

## Features

- Upload your resume (PDF format)
- Paste a job description
- Get an analysis of how well your resume matches the job description
- Receive a skills match analysis with score
- Get keyword optimization suggestions
- View improvement recommendations

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Flask (Python)
- **AI Model**: Hugging Face Transformers (sentence-transformers/all-MiniLM-L6-v2)

## Project Structure

```
resume-tailor/
├── frontend/            # Next.js frontend
├── backend/             # Flask backend
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/resume-tailor.git
   cd resume-tailor
   ```

2. Set up the frontend:
   ```
   cd frontend
   npm install
   ```

3. Set up the backend:
   ```
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## How It Works

1. The user uploads their resume (PDF) and pastes a job description
2. The backend extracts text from the resume and processes both the resume and job description
3. The AI model analyzes the similarity between the resume and job description
4. The application identifies matching and missing skills
5. The system provides keyword optimization suggestions
6. The results are displayed in an easy-to-understand format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Hugging Face for providing the transformer models
- Next.js and Flask for the web frameworks
