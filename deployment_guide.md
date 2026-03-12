# Deploying to Firebase with CI/CD

To deploy this Next.js application to Firebase with a fully automated CI/CD pipeline, follow these steps.

## 1. Prerequisites
- **Firebase Project**: Create one at [console.firebase.google.com](https://console.firebase.google.com/).
- **Firebase CLI**: Install globally:
  ```bash
  npm install -g firebase-tools
  ```
- **Blaze Plan**: Firebase Hosting for Next.js requires the "Blaze" (Pay-as-you-go) plan because it uses Cloud Functions for the backend logic.

## 2. Initialize Firebase
The Firebase CLI now has built-in support for Next.js.

1. **Login to Firebase**:
   ```bash
   firebase login
   ```
2. **Enable Web Frameworks (Experimental)**:
   ```bash
   firebase experiments:enable webframeworks
   ```
3. **Initialize Hosting**:
   ```bash
   firebase init hosting
   ```
   - **Project Setup**: Select your existing project.
   - **Framework Detection**: It should automatically detect **Next.js**.
   - **Deployment Settings**: 
     - "Set up automatic builds and deploys with GitHub?" -> **Yes**.
     - Follow the prompts to authorize GitHub and select your repository `praveenjoshi01/Competitive-Matrix-Generator`.
     - This will automatically create the `.github/workflows` files for you.

## 3. Configure Environment Variables
Since your app requires an `OPENAI_API_KEY`, you must provide it to both the CI build and the production runtime.

### For GitHub Actions (Build Time)
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add a **New repository secret**: `OPENAI_API_KEY`.

### For Firebase Functions (Runtime)
Next.js on Firebase uses Cloud Functions. You need to set the secret in GCP/Firebase:
```bash
firebase functions:secrets:set OPENAI_API_KEY
```

## 4. Playwright Scraper Consideration ⚠️
This application uses **Playwright** for deep browser scans. Running Playwright in a serverless environment (Firebase Functions) can be challenging due to OS-level dependencies.

### Recommendation:
If you encounter "Missing library" errors in production:
1. **Increase Memory**: Update your Firebase configuration (usually in your `next.config.js` or via Firebase Function settings) to at least 2GB of RAM.
2. **Browserless**: If the local Playwright install fails in the serverless environment, consider using a service like [browserless.io](https://www.browserless.io/) or [scrapingbee.com](https://www.scrapingbee.com/) to handle the browser execution via a remote WebSocket.

## 5. CI/CD Workflow
Once configured, every push to `main` will trigger the `firebase-hosting-merge.yml` workflow:
1. **Build**: Runs `npm run build`.
2. **Deploy**: Deploys the optimized Next.js bundle to Firebase Hosting and the API routes to Cloud Functions.

## 6. Local Testing for Firebase
Before pushing, you can test the production build locally using:
```bash
firebase emulators:start
```
