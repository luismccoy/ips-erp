# Deployment Guide

This project is configured for seamless deployment on Vercel.

## Option 1: Vercel CLI (Recommended)

If you have the Vercel CLI installed:

1.  Open your terminal in this directory.
2.  Run the login command (if not logged in):
    ```bash
    npx vercel login
    ```
3.  Deploy to production:
    ```bash
    npx vercel --prod
    ```
4.  Follow the prompts. Use default settings for Vite (Output Directory: `dist`).

## Option 2: Git Integration

1.  Push this code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Go to the [Vercel Dashboard](https://vercel.com/new).
3.  Import your repository.
4.  Vercel will automatically detect the Vite config.
5.  Click **Deploy**.

## Environment Variables

Ensure you add the following environment variables in your Vercel Project Settings if using backend features:

- `VITE_API_URL`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`

(See `.env.example` for the full list)
