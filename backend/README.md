# Excel Analytics Backend

This is the backend server for the Excel Analytics platform.

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel-analytics
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email configuration (optional)
EMAIL_SERVICE=
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@excelanalytics.com

# OpenAI API Key (if used)
OPENAI_API_KEY=
```

4. Run the server with `npm run dev`

## Google OAuth Setup

1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Go to "Credentials" and create OAuth 2.0 Client ID
4. Set the authorized redirect URI to `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/logout` - Logout user 