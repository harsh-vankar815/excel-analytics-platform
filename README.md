# Excel Analytics Platform

A comprehensive platform for Excel data analytics with a modern React frontend and Node.js backend.

## Project Structure

- `/frontend` - React application built with Vite
- `/backend` - Node.js API server

## Frontend

The frontend is built with:
- React 19
- Vite
- TailwindCSS
- Chart.js for data visualization
- Redux for state management

### Running the Frontend

Development mode:
```bash
cd frontend
npm install
npm run dev
```

Production mode:
```bash
cd frontend
npm run build
npx serve dist
```

## Backend

The backend provides API endpoints for:
- Data processing
- Excel file handling
- Analytics functionality

### Running the Backend

```bash
cd backend
npm install
npm start
```

## Setting Up MongoDB Atlas for Production

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
2. Create a new project
3. Build a new cluster (free tier is available)
4. Create a database user with read/write permissions
5. Add your IP address to the IP access list (or use 0.0.0.0/0 for all IPs)
6. Get your connection string by clicking "Connect" > "Connect your application"
7. Replace the placeholder values in the connection string with your actual values:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
8. Add this connection string to your backend `.env` file as `MONGO_URI`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d
SESSION_SECRET=your_secure_session_secret
FRONTEND_URL=https://your-production-frontend-url.com
BACKEND_URL=https://your-production-backend-url.com
```

## Getting Started

1. Clone this repository
2. Set up environment variables (see above)
3. Install dependencies in both frontend and backend directories
4. Run the development servers # Main-Excel-Analytics
# Main-Excel-Analytics
