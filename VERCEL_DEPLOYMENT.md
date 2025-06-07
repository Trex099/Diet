# Vercel Deployment Instructions

This project has been set up for deployment on Vercel. Follow these steps to deploy:

## Prerequisites

1. You need a [Vercel account](https://vercel.com/signup)
2. You need a MongoDB database (Atlas or other provider)

## Environment Variables

Set up the following environment variables in your Vercel project:

- `MONGO_URL` - Your MongoDB connection string
- `DB_NAME` - Your MongoDB database name

## Deployment Steps

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

## Project Structure for Vercel

- Frontend: React app built with Create React App
- Backend: FastAPI Python app running as a serverless function
- API routes: All API routes are directed to `/api`

## Important Files

- `vercel.json` - Configures the build process and routes
- `api/index.py` - Entry point for the serverless backend
- `api/requirements.txt` - Python dependencies for the backend

## Development vs Production

During development, you can still run the frontend and backend separately:
- Frontend: `cd frontend && npm run start`
- Backend: `cd backend && uvicorn server:app --reload`

The production build on Vercel will handle both frontend and backend seamlessly.

## Connecting to MongoDB

Make sure your MongoDB instance allows connections from Vercel's IP addresses or is configured to allow connections from anywhere (with proper authentication).

## Troubleshooting

### 404 NOT_FOUND Errors
If you encounter 404 errors after deployment:

1. Check your Vercel deployment logs for specific error messages
2. Verify that environment variables are set correctly
3. Try accessing the API directly at `https://your-deployment-url.vercel.app/api`
4. Make sure your MongoDB connection is working properly

### Function Execution Error
If the function times out or fails to execute:

1. Check if your MongoDB connection string is correct
2. Ensure your MongoDB instance is accessible from Vercel's servers
3. Try simplifying your backend code to isolate the issue

### Redeployment
If you make changes to fix issues:

1. Run `vercel` to deploy to development
2. Test thoroughly
3. Run `vercel --prod` to update the production deployment 