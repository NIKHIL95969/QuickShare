# 🚀 ShareXYLab - Seamless Content Sharing

ShareXYLab is a web platform designed to solve the simple problem of sharing text, code snippets, and files between your devices without the hassle of logging into messaging apps. Share content publicly with a short, memorable code, or create an account to keep a permanent history of your shared items.

<img width="1900" height="922" alt="image" src="https://github.com/user-attachments/assets/58374a3b-0380-46ec-a088-857c156308ee" />

---

## 🎯 About The Project

Ever found yourself working on one computer and needing to send a quick link or code block to your phone or another device? The usual solution involves emailing yourself or logging into a messaging app. ShareXYLab simplifies this into a two-step process: paste your content to get a unique code, and use that code to retrieve it on any other device instantly.

---

## ✨ Features

*   **Instant Anonymous Sharing**: Quickly share text and code snippets without needing an account.
*   **Temporary Content**: Option to share content that is only listed for 24 hours.
*   **Code Syntax Highlighting**: Pasted code is automatically detected and highlighted for better readability, with support for multiple themes.
*   **Easy Content Interaction**:
    *   **Copy & Expand**: Easily copy code snippets or view them in a full-screen modal for detailed inspection.
    *   **Pagination**: Browse through shared content with easy-to-use pagination controls.
*   **User Experience**:
    *   **Dark/Light Mode**: Switch between dark and light themes for a comfortable viewing experience.
    *   **Responsive Design**: A clean and modern UI that works seamlessly across desktop, tablet, and mobile devices.
    *   **Optimistic UI Updates**: New content appears instantly in the list for a fluid user experience.
*   **Performance & Scalability**:
    *   **Performant Backend**: Built with a fast backend that uses Redis for caching and rate-limiting to ensure a smooth and reliable experience.

---

## 🚀 Deployment & CI/CD

This project is set up for continuous integration and deployment on Google Cloud Platform.
*   **Deployment**: Automatically deployed to **Cloud Run**.
*   **CI/CD**: Managed via **Cloud Build** triggers on every push to the main branch.
*   **Domain**: Accessible at [share.xylab.in](https://share.xylab.in).

---

## 🛠 Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

---

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/quickshare.git
cd quickshare

```

## Withou Docker

- Create .env file and add these variables
```bash
NODE_ENV=development
MONGO_URL=your_mongo_connection_string
REDIS_URL=your_redis_connection_string
TOKEN_SECRET=your_secret_key
```

```bash
npm install
# or
yarn install
# or
pnpm install


npm run dev
```

## With Docker
### Development Mode
- Setup docker locally
- add .env variables in docker-compose.dev.yml file
```bash
    environment:
      NODE_ENV: development
      MONGO_URL: mongo_url
      REDIS_URL: redis_url
      TOKEN_SECRET: local-secret
```
- Build and start the app with Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up --build
```

👉 App will be available at http://localhost:8080

----
### Production Mode
- Build the production-ready image:

```bash
docker build -t quickshare:prod --target runner .
```

- Run the container with environment variables:
```bash
docker run -p 8080:8080 \
  -e MONGO_URL=your_mongo_connection_string \
  -e REDIS_URL=your_redis_connection_string \
  -e TOKEN_SECRET=your_secret_key \
  quickshare:prod
```

👉 App will be available at http://localhost:8080

-------

## ☁️ Deploy to Google Cloud Run (CI/CD with Cloud Build)

You can deploy this project to Google Cloud Run with automated builds from GitHub using Cloud Build.

### 1. Setup GCP Project
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```


Enable required APIs:

```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com
```
### 2. Store Secrets in Secret Manager
```bash
echo "your-mongo-url" | gcloud secrets create MONGO_URL --data-file=-
echo "your-redis-url" | gcloud secrets create REDIS_URL --data-file=-
echo "your-token-secret" | gcloud secrets create TOKEN_SECRET --data-file=-
echo "your-domain" | gcloud secrets create DOMAIN --data-file=-
```

### 3. Connect GitHub Repo to Cloud Build
- Go to Cloud Build → Triggers in the GCP Console.
- Create a new trigger linked to your GitHub repo.
- Select cloudbuild.yaml as the build config file.

Now, whenever you push to the selected branch (e.g., main), Cloud Build will:

- ✅ Build your Docker image
- ✅ Push it to Google Container Registry 
- ✅ Deploy it to Cloud Run with secrets injected

--------------
### 👉 With this setup, you can
- Run locally with Next.js
- Run in Docker (dev/prod)
- Deploy automatically to Cloud Run with CI/CD