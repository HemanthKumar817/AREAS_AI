# AREAS: AI-Powered Resume Enhancement System

![AREAS Dashboard Screenshot](https://storage.googleapis.com/aistudio-project-images/2e90f209-2479-4d8b-9e41-69f6e1f021c3)

**AREAS (Automated Resume Enhancer and Application System)** is a modern web application that leverages Google's Gemini AI to intelligently analyze your resume against any job description. It provides a detailed ATS score, automatically generates an optimized resume in professional LaTeX format, and helps you track your application materials to significantly improve your chances of landing an interview.

---

## ✨ Key Features

- **Dynamic Profile Creation:** Onboard with a comprehensive profile including social links, skills, experience, education, and a profile photo.
- **GitHub Integration:** Automatically fetches and displays your public GitHub repositories on your profile page.
- **Advanced AI Analysis:** Leverages the `gemini-2.5-pro` model to perform a deep analysis of your resume against a specific job description.
- **Instant ATS Scoring:** Get an immediate, detailed ATS score for your original resume, broken down into five key metrics:
    -   Keyword & Skills Alignment
    -   Experience Relevance
    -   Quantifiable Impact
    -   Skill Coverage
    -   Clarity & Readability
- **Automated Resume Enhancement:** The AI doesn't just give suggestions—it automatically writes a new, optimized resume in professional LaTeX format, tailored to the target job.
- **Score Verification:** Instantly check the ATS score of your newly generated resume using the `gemini-2.5-flash` model to see the tangible improvement.
- **Enhancement History:** Keep a log of every resume you've enhanced, with the ability to view the generated LaTeX code and score for each job application.
- **Modern & Responsive UI:** A beautiful, clean interface built with React and Tailwind CSS that looks great on any device.
- **Light & Dark Mode:** Seamlessly switch between light and dark themes to suit your preference, with your choice saved locally.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Model:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Setup:** No build step required; runs directly in the browser using ES Modules and an Import Map.

---

## 🚀 Getting Started

This project is configured to run directly in a browser without a build step.

### Prerequisites

- A modern web browser (like Chrome, Firefox, or Edge).
- A **Google Gemini API Key**. You can obtain one from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[YOUR_GITHUB_USERNAME]/[YOUR_REPOSITORY_NAME].git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd [YOUR_REPOSITORY_NAME]
    ```

3.  **Configure API Key for Local Development:**
    The application code expects the API key in `process.env.API_KEY`. To run it locally, you need to temporarily modify `services/geminiService.ts`.

    Open `services/geminiService.ts`, find the `getGemini` function, and change it as follows:

    ```typescript
    // IMPORTANT: FOR LOCAL DEVELOPMENT ONLY
    // Remember to remove the hardcoded key before committing to a public repository.
    const getGemini = () => {
      const apiKey = "YOUR_GEMINI_API_KEY_HERE"; // <--- PASTE YOUR KEY HERE
      if (!apiKey) {
        throw new Error("API_KEY not set");
      }
      return new GoogleGenAI({ apiKey });
    };
    ```

4.  **Run the application:**
    Since there is no build server, you just need to serve the files with a simple local web server. The **Live Server** extension in VS Code is perfect for this.
    -   Install the "Live Server" extension from the VS Code marketplace.
    -   Right-click on `index.html` in your VS Code explorer.
    -   Select "Open with Live Server".

    Your browser will open to the correct address, and the application will be running.

---

## ☁️ Deployment

To deploy this project to a platform like Vercel, you **must** configure your Gemini API Key as an environment variable.

### Deploying to Vercel

1.  **Push your code to a GitHub repository.** Make sure you have **removed any hardcoded API keys** from `services/geminiService.ts` before you push. The `getGemini` function should look like this:
    ```typescript
    const getGemini = () => {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
    };
    ```

2.  **Import your project in Vercel.** Log in to your Vercel account and create a new project, importing the repository from GitHub.

3.  **Configure the Environment Variable.**
    -   In your Vercel project dashboard, go to the **Settings** tab.
    -   Click on **Environment Variables** in the left-hand menu.
    -   Create a new variable:
        -   **Name:** `API_KEY`
        -   **Value:** `YOUR_GEMINI_API_KEY_HERE` (Paste your actual key here)
    -   Click **Save**.

4.  **Redeploy.** Trigger a new deployment from your Vercel project dashboard to apply the environment variable. Your site should now be live and fully functional.

---

## 🔮 Future Enhancements

This project has a strong foundation with many possibilities for future growth:

- **AI-Powered Cover Letter Generation:** Automatically write a tailored cover letter based on the job description and the enhanced resume.
- **Direct PDF Download:** Implement a serverless function to compile the generated `.tex` file into a PDF on the fly.
- **Interactive Resume Editor:** Allow users to make final edits to the generated LaTeX resume directly in the browser.
- **AI-Powered Interview Prep:** Generate a list of likely interview questions and suggested talking points based on the user's resume and the job role.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.