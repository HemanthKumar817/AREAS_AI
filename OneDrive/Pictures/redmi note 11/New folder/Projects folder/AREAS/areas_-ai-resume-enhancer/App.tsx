import React, { useState, useEffect, useRef, useContext } from 'react';
import type { AnalysisResult, UserProfile, ScoreResult, HistoryEntry } from './types';
import { analyzeResumeWithGemini, scoreResumeWithGemini } from './services/geminiService';
import { fetchGithubProjects } from './services/githubService';
import ScoreGauge from './components/ScoreGauge';
import { ClipboardIcon, CheckIcon, SparklesIcon, DownloadIcon, UserIcon, LogoutIcon, XCircleIcon, GithubIcon, LinkedInIcon, LinkIcon, PencilIcon, EyeIcon, SunIcon, MoonIcon } from './components/icons';

// --- Theme Context ---
interface ThemeContextType {
    theme: string;
    toggleTheme: () => void;
}
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);


// --- Sample Data ---

const sampleJDs: Record<string, { title: string, description: string }> = {
  'swe-ml': {
    title: 'Software Engineer, AI/ML',
    description: `Job Title: Software Engineer, AI/ML
Company: Tech Solutions Inc.
Location: Remote
Job Description:
We are seeking a motivated Software Engineer with a passion for Artificial Intelligence and Machine Learning to join our dynamic team. The ideal candidate will have experience in building and deploying scalable, data-driven applications. You will work on developing cutting-edge AI solutions that solve real-world problems.
Responsibilities:
- Design, develop, and deploy machine learning models.
- Collaborate with data scientists and product managers to build new features.
- Write clean, efficient, and well-documented code in Python.
- Work with technologies like TensorFlow, scikit-learn, and Pandas.
Qualifications:
- Bachelor's degree in Computer Science, AIML, or a related field.
- Strong programming skills in Python.
- Hands-on experience with ML frameworks (e.g., TensorFlow, PyTorch, scikit-learn).`
  },
  'data-scientist': {
    title: 'Data Scientist',
    description: `Job Title: Data Scientist
Company: Data Insights Corp.
Location: Hybrid
Job Description:
We are looking for a Data Scientist to analyze large amounts of raw information to find patterns that will help improve our company. We will rely on you to build data products to extract valuable business insights.
Responsibilities:
- Undertake preprocessing of structured and unstructured data.
- Analyze large amounts of information to discover trends and patterns.
- Build predictive models and machine-learning algorithms.
Qualifications:
- Proven experience as a Data Scientist or Data Analyst.
- Experience in data mining and using business intelligence tools (e.g., Tableau).
- Knowledge of SQL and Python.`
  },
   'frontend-dev': {
    title: 'Frontend Developer',
    description: `Job Title: Frontend Developer
Company: Web Innovators
Location: New York, NY
Job Description:
We are looking for a skilled Frontend Developer to join our team. You will be responsible for building the client-side of our web applications. You should be able to translate our company and customer needs into functional and appealing interactive applications.
Responsibilities:
- Use markup languages like HTML to create user-friendly web pages.
- Maintain and improve website.
- Optimize applications for maximum speed.
- Design mobile-based features.
Qualifications:
- Proven work experience as a Frontend Developer.
- Hands on experience with markup languages.
- Experience with JavaScript, CSS, and jQuery.
- Familiarity with browser testing and debugging.`
  },
  'backend-dev': {
    title: 'Backend Developer',
    description: `Job Title: Backend Developer
Company: Secure Systems Ltd.
Location: Remote
Job Description:
We are looking for a Backend Developer to join our team. You will be responsible for the server-side web application logic as well as for the integration of the front-end part.
Responsibilities:
- Participate in the entire application lifecycle, focusing on coding and debugging.
- Write clean code to develop functional web applications.
- Troubleshoot and debug applications.
- Gather and address technical and design requirements.
Qualifications:
- Proven experience as a Backend Developer.
- In-depth understanding of the entire web development process (design, development and deployment).
- Hands on experience with programming languages like Java, Ruby, Python, PHP and .Net.
- Familiarity with front-end languages (e.g. HTML, JavaScript and CSS).`
  },
  'full-stack-dev': {
    title: 'Full Stack Developer',
    description: `Job Title: Full Stack Developer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'devops-eng': {
    title: 'DevOps Engineer',
    description: `Job Title: DevOps Engineer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'cloud-eng': {
    title: 'Cloud Engineer',
    description: `Job Title: Cloud Engineer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'cybersec-analyst': {
    title: 'Cybersecurity Analyst',
    description: `Job Title: Cybersecurity Analyst\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'db-admin': {
    title: 'Database Administrator',
    description: `Job Title: Database Administrator\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'qa-test-eng': {
    title: 'QA/Test Engineer',
    description: `Job Title: QA/Test Engineer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'mobile-dev': {
    title: 'Mobile App Developer (Android/iOS)',
    description: `Job Title: Mobile App Developer (Android/iOS)\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'ui-ux-designer': {
    title: 'UI/UX Designer',
    description: `Job Title: UI/UX Designer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'bi-dev': {
    title: 'Business Intelligence Developer',
    description: `Job Title: Business Intelligence Developer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'ml-eng': {
    title: 'Machine Learning Engineer',
    description: `Job Title: Machine Learning Engineer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'pm-tech': {
    title: 'Product Manager (Tech)',
    description: `Job Title: Product Manager (Tech)\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'tech-recruiter': {
    title: 'Technical Recruiter',
    description: `Job Title: Technical Recruiter\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'hr-manager': {
    title: 'HR Manager/HRBP',
    description: `Job Title: HR Manager/HRBP\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'project-manager': {
    title: 'Project Manager',
    description: `Job Title: Project Manager\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'business-analyst': {
    title: 'Business Analyst',
    description: `Job Title: Business Analyst\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'customer-success': {
    title: 'Customer Success Manager',
    description: `Job Title: Customer Success Manager\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'it-sales': {
    title: 'Sales/Account Executive (IT Sales)',
    description: `Job Title: Sales/Account Executive (IT Sales)\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'it-marketing': {
    title: 'Marketing Specialist (IT/Tech)',
    description: `Job Title: Marketing Specialist (IT/Tech)\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'it-support': {
    title: 'IT Support Specialist',
    description: `Job Title: IT Support Specialist\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'ops-manager': {
    title: 'Operations Manager',
    description: `Job Title: Operations Manager\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
  'tech-writer': {
    title: 'Content Writer/Technical Writer',
    description: `Job Title: Content Writer/Technical Writer\nCompany: [Enter Company Name]\nLocation: [Enter Location]\nJob Description:\n[Paste the full job description here to begin your analysis.]`
  },
};

const defaultProfile: UserProfile = {
  firstName: "Tangudu",
  lastName: "Hemanth Kumar",
  email: "tanguduhemanthkumar@gmail.com",
  phone: "+91-8125850430",
  github: "HemanthKumar817",
  linkedin: "tangudu-hemanth-kumar-25855229a",
  codeforces: "themanth",
  executiveSummary: "Motivated and detail-oriented B.Tech AIML student with strong skills in Python, Machine Learning, and Data Science. Experienced in statistical modeling, predictive modeling, and natural language processing (NLP), with hands-on projects in LLMs and Generative AI. Proficient in building and deploying data-driven applications.",
  skills: ["Python", "JavaScript", "TypeScript", "TensorFlow", "scikit-learn", "NumPy", "Pandas", "TCP/IP", "DNS", "Git", "GitHub", "Figma", "LangChain"],
  projects: [], // Projects are fetched from GitHub on login
  experiences: [
    { id: 'e1', role: "Student Intern", company: "YBI Foundation (Remote)", duration: "Jul 2024 - Aug 2024", points: ["Worked on machine learning projects with real-world datasets.", "Gained hands-on experience in supervised learning and model deployment."] },
    { id: 'e2', role: "Student Intern", company: "Next24tech Technology & Services (Remote)", duration: "Jun 2024 – Aug 2024", points: ["Contributed to AI/ML projects involving automation and intelligent systems.", "Enhanced skills in Python, data preprocessing, and AI frameworks."] }
  ],
  education: [
      {id: 'edu1', degree: "B.Tech in AIML", institution: "Aditya Engineering College", duration: "Aug 2023 - Apr 2026", gpa: "7.33/10"},
      {id: 'edu2', degree: "Diploma in CME", institution: "Mrs A.V.N Polytechnic College", duration: "Aug 2020 - Apr 2023", gpa: "8.61/10"}
  ],
  certificates: ["Deloitte Cybersecurity Job Simulation (Sept 2025)", "ICIMA 2025 Conference – Neural Style Transfer using Telegram Bot"],
  profileImage: "",
  history: [],
};

// --- App Component ---

const App: React.FC = () => {
    const [page, setPage] = useState<'login' | 'dashboard' | 'profile'>('login');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const savedProfile = localStorage.getItem('userProfile');
                if (savedProfile) {
                    setProfile(JSON.parse(savedProfile));
                    setPage('dashboard');
                }
            } catch (error) {
                console.error("Failed to parse user profile from localStorage", error);
                localStorage.removeItem('userProfile');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadProfile();
    }, []);

    const handleLogin = async (profileData: UserProfile) => {
        setIsLoadingProfile(true);
        try {
            const projects = await fetchGithubProjects(profileData.github);
            const fullProfile = { ...profileData, projects, history: profileData.history || [] };
            localStorage.setItem('userProfile', JSON.stringify(fullProfile));
            setProfile(fullProfile);
            setPage('dashboard');
        } catch (error) {
            console.error("Failed to fetch GitHub projects on login:", error);
            // Log in even if GitHub fetch fails
            const profileWithHistory = { ...profileData, history: profileData.history || [] };
            localStorage.setItem('userProfile', JSON.stringify(profileWithHistory));
            setProfile(profileWithHistory);
            setPage('dashboard');
        } finally {
            setIsLoadingProfile(false);
        }
    };
    
    const handleUpdateProfile = (updatedProfile: UserProfile) => {
        // preserve projects and history, as they are not editable in the form
        const finalProfile = { ...updatedProfile, projects: profile?.projects || [], history: profile?.history || [] }; 
        localStorage.setItem('userProfile', JSON.stringify(finalProfile));
        setProfile(finalProfile);
    };

    const handleAddHistoryEntry = (entry: HistoryEntry) => {
        if (profile) {
            const updatedProfile = {
                ...profile,
                history: [entry, ...(profile.history || [])],
            };
            setProfile(updatedProfile);
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userProfile');
        setProfile(null);
        setPage('login');
    };
    
    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <Spinner />
            </div>
        );
    }

    if (!profile) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <Navbar profile={profile} setPage={setPage} onLogout={handleLogout} />
            <main className="p-4 sm:p-6 lg:p-8">
                {page === 'dashboard' && <DashboardPage profile={profile} onAnalysisComplete={handleAddHistoryEntry} />}
                {page === 'profile' && <ProfilePage profile={profile} onUpdateProfile={handleUpdateProfile} />}
            </main>
        </div>
    );
};


// --- Page Components ---

const LoginPage: React.FC<{ onLogin: (profile: UserProfile) => void }> = ({ onLogin }) => {
    const [formData, setFormData] = useState(defaultProfile);
    const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData(prev => ({ ...prev, profileImage: result }));
                if (errors.profileImage) {
                    setErrors(prev => ({ ...prev, profileImage: undefined }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UserProfile, string>> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid.";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
        if (!formData.github.trim()) newErrors.github = "GitHub username is required.";
        if (!formData.linkedin.trim()) newErrors.linkedin = "LinkedIn username is required.";
        if (!formData.profileImage) newErrors.profileImage = "Profile photo is required.";


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onLogin(formData);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="max-w-md w-full bg-white/50 dark:bg-slate-800/50 p-8 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome to AREAS</h1>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Create your profile to get started.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                            Profile Photo
                            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                        </label>
                        <div className="relative group">
                            <div className={`w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center ring-4 overflow-hidden ${errors.profileImage ? 'ring-red-500' : 'ring-slate-300 dark:ring-slate-600'}`}>
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                )}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="w-6 h-6" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        {errors.profileImage && <p className="text-red-500 text-xs mt-1">{errors.profileImage}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="First Name" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required error={errors.firstName} />
                        <InputField label="Last Name" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required error={errors.lastName} />
                    </div>
                    <InputField label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required error={errors.email} />
                    <InputField label="Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required error={errors.phone} />
                    <InputField label="GitHub Username" value={formData.github} onChange={e => handleChange('github', e.target.value)} required error={errors.github} />
                    <InputField label="LinkedIn Username" value={formData.linkedin} onChange={e => handleChange('linkedin', e.target.value)} required error={errors.linkedin} />
                    <InputField label="Codeforces Handle" value={formData.codeforces} onChange={e => handleChange('codeforces', e.target.value)} />
                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">Create Profile & Login</button>
                </form>
            </div>
        </div>
    );
};

const DashboardPage: React.FC<{ profile: UserProfile; onAnalysisComplete: (entry: HistoryEntry) => void; }> = ({ profile, onAnalysisComplete }) => {
  const [jdKey, setJdKey] = useState(Object.keys(sampleJDs)[0]);
  const [jdText, setJdText] = useState(sampleJDs[jdKey].description);
  const [currentResume, setCurrentResume] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThanks, setShowThanks] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const handleJdChange = (key: string) => {
    setJdKey(key);
    setJdText(sampleJDs[key].description);
    setAnalysisResult(null);
  }

  const handleAnalyze = async () => {
    if (!jdText || !currentResume) {
      setError('Please provide a job description and your current resume.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setShowThanks(false);

    try {
      setAnalysisStatus('AI is analyzing your profile...');
      const result = await analyzeResumeWithGemini(profile, jdText, currentResume);
      setAnalysisResult(result);

      // Create and save history entry
      const date = new Date().toISOString();
      const newHistoryEntry: HistoryEntry = {
        id: date,
        jobTitle: sampleJDs[jdKey].title,
        date: date,
        score: result.totalScore,
        enhancedResume: result.enhancedResume,
      };
      onAnalysisComplete(newHistoryEntry);

      setShowThanks(true);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setAnalysisStatus(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Resume Dashboard
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Optimize your resume against a job description to beat the ATS.
        </p>
      </header>
       {showThanks && analysisResult && (
            <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
                <strong className="font-bold">Enhancement Complete! </strong>
                <span className="block sm:inline">Your AI-enhanced resume is ready below.</span>
                <button onClick={() => setShowThanks(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <span className="text-2xl">×</span>
                </button>
            </div>
        )}

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
            <label htmlFor="job-role" className="block text-lg font-semibold mb-2 text-slate-900 dark:text-white">Select a Job Role</label>
            <select
              id="job-role"
              value={jdKey}
              onChange={(e) => handleJdChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 border rounded-md p-3 text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            >
              {Object.entries(sampleJDs).map(([key, { title }]) => (
                <option key={key} value={key}>{title}</option>
              ))}
            </select>
          </div>
          <TextAreaCard title="Job Description" value={jdText} onChange={setJdText} placeholder="Paste the job description here..." />
          <TextAreaCard title="Your Current Resume" value={currentResume} onChange={setCurrentResume} placeholder="Paste your resume text here..." />
          
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !jdText || !currentResume}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-600 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg"
          >
            {isLoading ? (<><Spinner /><span>{analysisStatus || 'Analyzing...'}</span></>) : (<><SparklesIcon className="w-5 h-5"/><span>Analyze & Enhance</span></>)}
          </button>
          {error && <p className="text-red-500 dark:text-red-400 text-center mt-4">{error}</p>}
        </div>

        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Analysis & Results</h2>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Spinner />
              <p className="mt-4 text-slate-500 dark:text-slate-400">{analysisStatus || 'AI is tailoring your profile...'}</p>
            </div>
          )}
          {!isLoading && !analysisResult && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <p className="text-slate-500 dark:text-slate-400">Your results will appear here.</p>
            </div>
          )}
          {analysisResult && (
            <div className="space-y-8">
               <p className="text-slate-600 dark:text-slate-400 text-center bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                   The AI has analyzed your resume and automatically generated an enhanced version. Below is a summary of the improvements and the final document.
               </p>
              <ScoreSection title="Original Resume ATS Score" result={{totalScore: analysisResult.totalScore, scoreBreakdown: analysisResult.scoreBreakdown}} />
              <SuggestionsSection suggestions={analysisResult.suggestions} />
              <ResumePreviewSection enhanced={analysisResult.enhancedResume} />
              <VerificationSection jdText={jdText} enhancedResume={analysisResult.enhancedResume} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProfilePage: React.FC<{ profile: UserProfile; onUpdateProfile: (p: UserProfile) => void; }> = ({ profile, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedProfile: UserProfile) => {
        onUpdateProfile(updatedProfile);
        setIsEditing(false);
    };

    return (
        <div className="max-w-7xl mx-auto">
             <header className="mb-8 flex flex-col items-center gap-4 sm:relative sm:flex-row sm:justify-center sm:items-center">
                <div className="text-center w-full">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Hi, {profile.firstName}</h1>
                    <p className="mt-2 text-md sm:text-lg text-slate-600 dark:text-slate-400">
                        Welcome to <span className="font-semibold text-cyan-600 dark:text-cyan-400">AREAS</span>: Automated Resume Enhancer and Application System.
                    </p>
                </div>
                {!isEditing && (
                     <div className="w-full sm:w-auto sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-0">
                        <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 rounded-md text-sm transition" title="Edit Profile">
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    </div>
                )}
            </header>
            
            {isEditing ? (
                <ProfileEditForm profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
            ) : (
                <ProfileDisplay profile={profile} />
            )}
        </div>
    );
};

const ProfileDisplay: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-center flex flex-col items-center backdrop-blur-md">
                        <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-300 dark:ring-slate-600 overflow-hidden">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-20 h-20 text-slate-400 dark:text-slate-500"/>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.firstName} {profile.lastName}</h2>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Social Media</h3>
                        <div className="space-y-3">
                            <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                                <GithubIcon className="w-6 h-6"/>
                                <span>{profile.github}</span>
                            </a>
                            <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                                <LinkedInIcon className="w-6 h-6"/>
                                <span>{profile.linkedin}</span>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Right Column */}
                <main className="lg:col-span-2 space-y-8">
                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bio & other details</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm text-slate-500 dark:text-slate-400">Email</h4>
                                <p className="text-slate-800 dark:text-slate-200">{profile.email}</p>
                            </div>
                            <div>
                                <h4 className="text-sm text-slate-500 dark:text-slate-400">Phone</h4>
                                <p className="text-slate-800 dark:text-slate-200">{profile.phone}</p>
                            </div>
                            <div>
                                <h4 className="text-sm text-slate-500 dark:text-slate-400 mb-2">Executive Summary</h4>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.executiveSummary}</p>
                            </div>
                            <div>
                                <h4 className="text-sm text-slate-500 dark:text-slate-400 mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map(skill => (
                                        <span key={skill} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        
            {/* Bottom Row - History */}
            <section className="mt-8">
                <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">History</h3>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {profile.history && profile.history.length > 0 ? (
                            profile.history.map(entry => (
                                <div key={entry.id} className="py-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.jobTitle}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">ATS Score: <span className="font-bold text-slate-800 dark:text-slate-200">{entry.score}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <button onClick={() => setSelectedHistory(entry)} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-sm transition" title="View Enhanced Resume">
                                           <EyeIcon className="w-4 h-4" /> View
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Your resume enhancement history will appear here.</p>
                        )}
                    </div>
                </div>
            </section>
            {selectedHistory && <ResumeHistoryModal entry={selectedHistory} onClose={() => setSelectedHistory(null)} />}
        </>
    );
};


const ProfileEditForm: React.FC<{ profile: UserProfile; onSave: (p: UserProfile) => void; onCancel: () => void; }> = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
         <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 space-y-6 backdrop-blur-md">
            <div className="flex items-center gap-6">
                 <div className="relative group">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center ring-4 ring-slate-300 dark:ring-slate-600 overflow-hidden">
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                        )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilIcon className="w-6 h-6" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <InputField label="First Name" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                    <InputField label="Last Name" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
              <InputField label="Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
              <InputField label="GitHub Username" value={formData.github} onChange={e => handleChange('github', e.target.value)} required />
              <InputField label="LinkedIn Username" value={formData.linkedin} onChange={e => handleChange('linkedin', e.target.value)} required />
            </div>

             <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Changes</button>
            </div>
        </div>
    );
};

// --- Shared Components ---

const Navbar: React.FC<{profile: UserProfile, setPage: (page: 'dashboard' | 'profile') => void, onLogout: () => void}> = ({ profile, setPage, onLogout }) => {
    const themeContext = useContext(ThemeContext);
    if (!themeContext) {
        throw new Error("Navbar must be used within a ThemeProvider");
    }
    const { theme, toggleTheme } = themeContext;

    return (
    <nav className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md ring-1 ring-slate-200 dark:ring-slate-700 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={() => setPage('dashboard')} className="text-xl font-bold text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition">
                AREAS
            </button>
            <div className="flex items-center gap-4">
                <button onClick={() => setPage('profile')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition">
                    {profile.profileImage ? (
                        <img src={profile.profileImage} alt={profile.firstName} className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600" />
                    ) : (
                        <UserIcon className="w-5 h-5" />
                    )}
                    <span>{profile.firstName}</span>
                </button>
                <button onClick={onLogout} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-md text-sm transition">
                    <LogoutIcon className="w-5 h-5" /> Logout
                </button>
                <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition" title="Toggle theme">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                </button>
            </div>
        </div>
    </nav>
)};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, required, error, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
        <input {...props} className={`w-full bg-slate-100 dark:bg-slate-900/70 border rounded-md p-2 text-slate-900 dark:text-slate-300 focus:ring-1 transition ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500 focus:border-cyan-500'}`} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const TextAreaCard: React.FC<{title: string; value: string; onChange: (v: string) => void; placeholder: string;}> = ({title, value, onChange, placeholder}) => (
    <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-200 dark:ring-slate-700 backdrop-blur-md">
        <label className="block text-lg font-semibold mb-2 text-slate-900 dark:text-white">{title}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-48 bg-white dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 border rounded-md p-3 text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
        />
    </div>
);

const scoreBreakdownLabels: Record<string, string> = {
    keywordAlignment: 'Keyword Alignment',
    experienceRelevance: 'Experience Relevance',
    quantifiableImpact: 'Quantifiable Impact',
    skillCoverage: 'Skill Coverage',
    clarityAndReadability: 'Clarity & Readability',
};

const ScoreSection: React.FC<{title: string, result: ScoreResult}> = ({ title, result }) => (
  <div>
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
      <ScoreGauge score={result.totalScore} />
      <div className="flex-1 space-y-2 w-full">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Score Breakdown</h4>
        {Object.entries(result.scoreBreakdown).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400 capitalize">{scoreBreakdownLabels[key] || key}</span>
            <span className="font-semibold text-slate-800 dark:text-white">{value}/100</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SuggestionsSection: React.FC<{suggestions: string[]}> = ({suggestions}) => (
    <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Summary of AI Enhancements</h3>
        <ul className="space-y-2">
            {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                    <span className="text-green-500 dark:text-green-400 mt-1 flex-shrink-0"><CheckIcon className="w-5 h-5" /></span>
                    <span className="text-slate-700 dark:text-slate-300">{s}</span>
                </li>
            ))}
        </ul>
    </div>
);

const ResumePreviewSection: React.FC<{ enhanced: string }> = ({ enhanced }) => (
    <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI-Enhanced Resume (.tex)</h3>
        <div className="relative">
             <CopyButton textToCopy={enhanced} />
             <DownloadButton latexContent={enhanced} />
             <pre className="w-full h-96 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-md text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-y-auto text-sm font-mono ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                {enhanced}
            </pre>
        </div>
    </div>
);

const VerificationSection: React.FC<{ jdText: string, enhancedResume: string }> = ({ jdText, enhancedResume }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<ScoreResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);
        setVerificationResult(null);
        try {
            const result = await scoreResumeWithGemini(jdText, enhancedResume);
            setVerificationResult(result);
        } catch (e: any) {
            setError(e.message || "Failed to verify score.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">ATS Score Verification</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Check the ATS score of the new AI-enhanced resume against the job description.</p>
            
            {!verificationResult && (
                 <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-600 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg"
                >
                    {isVerifying ? (<><Spinner /><span>Verifying...</span></>) : 'Verify Enhanced Resume Score'}
                </button>
            )}

            {error && <p className="text-red-500 dark:text-red-400 text-center mt-4">{error}</p>}
            
            {verificationResult && (
                <ScoreSection title="Enhanced Resume ATS Score" result={verificationResult} />
            )}
        </div>
    );
};


const DownloadButton: React.FC<{ latexContent: string }> = ({ latexContent }) => {
  const handleDownload = () => {
    const blob = new Blob([latexContent], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownload} className="absolute top-2 right-12 p-2 bg-white/50 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition" title="Download .tex file">
      <DownloadIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
    </button>
  );
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-white/50 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition" title="Copy to clipboard">
      {copied ? <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-400" /> : <ClipboardIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
    </button>
  );
};

const ResumeHistoryModal: React.FC<{ entry: HistoryEntry | null, onClose: () => void }> = ({ entry, onClose }) => {
    if (!entry) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enhanced Resume for: {entry.jobTitle}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Generated on {new Date(entry.date).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </header>
                <div className="p-4 overflow-y-auto">
                   <ResumePreviewSection enhanced={entry.enhancedResume} />
                </div>
            </div>
        </div>
    );
};

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-slate-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default App;