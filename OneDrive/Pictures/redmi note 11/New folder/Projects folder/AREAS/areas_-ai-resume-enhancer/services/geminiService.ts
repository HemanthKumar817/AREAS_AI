import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserProfile, ScoreResult } from '../types';

const getGemini = () => {
  // This is the secure, production-ready way to access the API key.
  // Vercel will provide this value from your project's environment variables.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please configure it in your deployment settings.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Main Analysis and Enhancement Service ---

const analysisPrompt = `
You are an automated resume enhancement engine with a professional-grade ATS scoring module. Your task is to analyze an applicant's current resume against a target job description, provide a highly accurate "before" ATS score, and then automatically generate a new, optimized resume in LaTeX format.

You will be given the applicant's complete professional profile (JSON), their current resume (text), and a specific job description.

Follow these steps precisely:

1.  **Analyze Inputs**: Carefully review the user's current resume, their full professional profile, and the target job description.

2.  **Perform a Mock ATS Analysis (Original Resume)**: Provide a highly accurate mock ATS score for the *original* resume to show the "before" state. Evaluate it against the following weighted criteria, providing a score from 0-100 for each:
    *   **Keyword & Skills Alignment (35%)**: How well do the skills and keywords in the resume match the job description?
    *   **Experience Relevance (30%)**: Does the work history align with the required experience and responsibilities?
    *   **Quantifiable Impact (15%)**: Is there effective use of metrics, data, and specific results?
    *   **Skill Coverage (10%)**: How comprehensively are the required skills demonstrated?
    *   **Clarity & Readability (10%)**: How clear, professional, and well-structured is the content?

3.  **Identify Gaps and Strengths**: Compare the current resume to the job description to identify what relevant content from the user's full profile should be included in the enhanced version.

4.  **Summarize Automated Changes**: Provide a list of clear summaries explaining the improvements you automatically implemented in the enhanced resume.

5.  **Construct the Enhanced Resume**: Automatically create a new, complete, compilable LaTeX resume document, strategically selecting and tailoring content from the user's full profile to be maximally relevant to the job description.

6.  **Return JSON Output**: You MUST return your complete analysis in a single, valid JSON object that adheres to the provided schema. Do not include any text, markdown, or explanations outside of the JSON structure.
`;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER, description: "The final weighted ATS score of the *original* resume, from 0 to 100." },
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        keywordAlignment: { type: Type.NUMBER, description: "Score for matching JD keywords and skills." },
        experienceRelevance: { type: Type.NUMBER, description: "Score for alignment of work history to the JD." },
        quantifiableImpact: { type: Type.NUMBER, description: "Score for use of metrics and quantifiable results." },
        skillCoverage: { type: Type.NUMBER, description: "Score for the breadth and depth of relevant skills." },
        clarityAndReadability: { type: Type.NUMBER, description: "Score for professional language and structure." },
      },
      required: ["keywordAlignment", "experienceRelevance", "quantifiableImpact", "skillCoverage", "clarityAndReadability"],
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of specific, actionable improvements you implemented in the enhanced resume.",
    },
    enhancedResume: {
      type: Type.STRING,
      description: "The full LaTeX source code of the rewritten and optimized resume.",
    },
  },
  required: ["totalScore", "scoreBreakdown", "suggestions", "enhancedResume"],
};

export const analyzeResumeWithGemini = async (profile: UserProfile, jdText: string, resumeText: string): Promise<AnalysisResult> => {
  const ai = getGemini();
  
  const userContent = `
---
## USER PROFILE (JSON)
---
${JSON.stringify(profile, null, 2)}

---
## CURRENT RESUME (TEXT)
---
${resumeText}

---
## JOB DESCRIPTION
---
${jdText}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ parts: [{ text: userContent }] }],
      config: {
        systemInstruction: analysisPrompt,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    throw new Error("Failed to analyze resume. The AI model may be temporarily unavailable.");
  }
};


// --- ATS Score Verification Service ---

const scoringPrompt = `
You are a highly advanced and accurate Applicant Tracking System (ATS) simulation model. Your sole task is to analyze a provided resume (in LaTeX format) against a specific job description and return a detailed, trustworthy score. Your analysis must be rigorous and reflect the standards of modern recruitment technology.

**Analysis and Scoring Protocol:**

1.  **Deconstruct the Job Description**: First, identify the core requirements from the JD. Extract key skills, technologies, experience level (e.g., "5+ years"), qualifications, and responsibilities.

2.  **Systematic Resume Evaluation**: Scan the resume and score it against the deconstructed JD requirements based on the five pillars below. Provide a score from 0 to 100 for each.

    *   **Keyword & Skills Alignment**: How many of the extracted keywords and skills from the JD are present in the resume? Consider synonyms and related technologies.
    *   **Experience Relevance**: Does the candidate's work history and project experience directly address the responsibilities and experience level mentioned in the JD?
    *   **Quantifiable Impact**: How effectively does the resume use numbers, percentages, or other metrics to demonstrate concrete achievements? (e.g., "Increased efficiency by 20%").
    *   **Skill Coverage**: Beyond simple keyword matching, does the resume demonstrate a comprehensive understanding and application of the required skills?
    *   **Clarity & Readability**: Is the resume well-organized, concise, and written in professional language that is easy for a recruiter to scan?

3.  **Calculate Weighted Total Score**: Compute a final weighted score based on the individual pillar scores with the following weights: Keyword Alignment (35%), Experience Relevance (30%), Quantifiable Impact (15%), Skill Coverage (10%), Clarity & Readability (10%).

4.  **Return JSON**: You MUST return a single, valid JSON object adhering to the provided schema. Do not include any other text or explanations.
`;

const scoringSchema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER, description: "The final weighted ATS score from 0 to 100." },
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        keywordAlignment: { type: Type.NUMBER, description: "Score for matching JD keywords and skills." },
        experienceRelevance: { type: Type.NUMBER, description: "Score for alignment of work history to the JD." },
        quantifiableImpact: { type: Type.NUMBER, description: "Score for use of metrics and quantifiable results." },
        skillCoverage: { type: Type.NUMBER, description: "Score for the breadth and depth of relevant skills." },
        clarityAndReadability: { type: Type.NUMBER, description: "Score for professional language and structure." },
      },
      required: ["keywordAlignment", "experienceRelevance", "quantifiableImpact", "skillCoverage", "clarityAndReadability"],
    },
  },
  required: ["totalScore", "scoreBreakdown"],
};


export const scoreResumeWithGemini = async (jdText: string, enhancedResumeLatex: string): Promise<ScoreResult> => {
  const ai = getGemini();

  const scoringContent = `
---
## RESUME (LATEX)
---
${enhancedResumeLatex}

---
## JOB DESCRIPTION
---
${jdText}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using a faster model for scoring
      contents: [{ parts: [{ text: scoringContent }] }],
      config: {
        systemInstruction: scoringPrompt,
        responseMimeType: "application/json",
        responseSchema: scoringSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ScoreResult;

  } catch (error) {
    console.error("Error calling Gemini API for scoring:", error);
    throw new Error("Failed to score the resume.");
  }
};