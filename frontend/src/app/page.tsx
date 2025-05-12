"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setError("");
    } else {
      setResumeFile(null);
      setError("Please upload a PDF file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("http://localhost:5002/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();

      // Store the result in localStorage to pass to the results page
      localStorage.setItem("analysisResult", JSON.stringify(data));

      // Navigate to results page
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            AI Resume Tailor
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            Optimize your resume for job applications with AI
          </p>
        </header>

        <main className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Upload Your Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {resumeFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  File selected: {resumeFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                placeholder="Paste the job description here..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>
              Upload your resume and paste a job description to get personalized recommendations
              on how to tailor your resume for better results.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
