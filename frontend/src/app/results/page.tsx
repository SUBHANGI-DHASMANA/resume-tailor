"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnalysisResult {
  similarity_score: number;
  skills_match: {
    matching_skills: string[];
    missing_skills: string[];
    match_percentage: number;
  };
  keyword_optimization: {
    matching_keywords: string[];
    missing_keywords: string[];
    match_percentage: number;
  };
  improvement_suggestions: string[];
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the analysis result from localStorage
    const storedResult = localStorage.getItem("analysisResult");
    
    if (!storedResult) {
      // If no result is found, redirect back to the home page
      router.push("/");
      return;
    }
    
    try {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult);
    } catch (error) {
      console.error("Failed to parse analysis result:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">No Results Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find any analysis results. Please try again.
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format the scores for display
  const overallScore = Math.round(result.similarity_score);
  const skillsScore = Math.round(result.skills_match.match_percentage);
  const keywordScore = Math.round(result.keyword_optimization.match_percentage);

  // Determine score color classes
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Resume Analysis Results
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            See how well your resume matches the job description
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {/* Overall Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Overall Match Score
            </h2>
            <div className="flex items-center justify-center">
              <div className={`text-7xl font-bold ${getScoreColorClass(overallScore)}`}>
                {overallScore}%
              </div>
            </div>
          </div>

          {/* Skills Match Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Skills Match
              </h2>
              <div className={`text-3xl font-bold ${getScoreColorClass(skillsScore)}`}>
                {skillsScore}%
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Matching Skills
                </h3>
                {result.skills_match.matching_skills.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {result.skills_match.matching_skills.map((skill, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No matching skills found
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Missing Skills
                </h3>
                {result.skills_match.missing_skills.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {result.skills_match.missing_skills.map((skill, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No missing skills found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Keyword Optimization Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Keyword Optimization
              </h2>
              <div className={`text-3xl font-bold ${getScoreColorClass(keywordScore)}`}>
                {keywordScore}%
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Matching Keywords
                </h3>
                {result.keyword_optimization.matching_keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_optimization.matching_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No matching keywords found
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Missing Keywords
                </h3>
                {result.keyword_optimization.missing_keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_optimization.missing_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No missing keywords found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Improvement Suggestions
            </h2>
            
            {result.improvement_suggestions.length > 0 ? (
              <ul className="space-y-3">
                {result.improvement_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No improvement suggestions found
              </p>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Analyze Another Resume
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
