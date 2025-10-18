# Deploying AREAS to Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your GitHub repository: https://github.com/HemanthKumar817/AREAS-Ai-Resume-Enhancer
- A Google Gemini API Key from https://aistudio.google.com/

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Paste your repository URL: `https://github.com/HemanthKumar817/AREAS-Ai-Resume-Enhancer`
   - Click "Import"

3. **Configure Your Project**
   - Project Name: `areas-ai-resume-enhancer` (or your preferred name)
   - Framework Preset: Vercel should auto-detect "Vite"
   - Root Directory: `./` (keep default)
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     - Name: `GEMINI_API_KEY`
     - Value: Your actual Gemini API key
     - Environment: Select all (Production, Preview, Development)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Once done, you'll get a URL like: `https://areas-ai-resume-enhancer.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Navigate to your project**
   ```powershell
   cd "c:\Users\heman\OneDrive\Pictures\redmi note 11\New folder\Projects folder\AREAS\areas_-ai-resume-enhancer"
   ```

4. **Deploy**
   ```powershell
   vercel
   ```
   Follow the prompts and when asked about environment variables, add:
   - `GEMINI_API_KEY` with your API key

5. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

## Important Notes

✅ **Environment Variable**: Make sure `GEMINI_API_KEY` is set in Vercel's dashboard
✅ **Build Settings**: Vercel should auto-detect Vite configuration
✅ **Domain**: You'll get a free `.vercel.app` domain, or you can add a custom domain

## After Deployment

1. Visit your deployed URL
2. Test the application thoroughly
3. If you encounter any issues, check the Vercel deployment logs

## Troubleshooting

- **Build Fails**: Check the build logs in Vercel dashboard
- **API Key Error**: Verify the `GEMINI_API_KEY` is set correctly in Environment Variables
- **404 Errors**: Make sure the output directory is set to `dist`

## Continuous Deployment

Every time you push to your main branch on GitHub, Vercel will automatically deploy the changes!

---

Need help? Check Vercel's documentation: https://vercel.com/docs
