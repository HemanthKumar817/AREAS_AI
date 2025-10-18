export interface ScoreBreakdown {
  keywordAlignment: number;
  experienceRelevance: number;
  quantifiableImpact: number;
  skillCoverage: number;
  clarityAndReadability: number;
}

export interface AnalysisResult {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: string[];
  enhancedResume: string;
}

export interface ScoreResult {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface HistoryEntry {
    id: string; // Using ISO string of the date for a unique ID
    jobTitle: string;
    date: string; // ISO string date
    score: number;
    enhancedResume: string;
}

// New Types for User Profile
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  points: string[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    duration: string;
    gpa: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  codeforces: string;
  executiveSummary: string;
  skills: string[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certificates: string[];
  profileImage?: string;
  history: HistoryEntry[];
}