# Diamond E-commerce Project Requirements

## Core Tech Stack
*   **Frontend**: React (Vite-based), Redux Toolkit, Framer Motion, Axios.
*   **Backend**: Node.js, Express, MongoDB (Mongoose).
*   **Real-time**: Socket.IO for admin notifications.
*   **Authentication**: JWT (JSON Web Tokens) with Cookies.

## Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB instance (Local or Atlas)

## Local Development Configuration
Configure the following in `g:\Office-work\Diamonds\server\.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

Configure the following in `g:\Office-work\Diamonds\frontend\.env`:
```env
VITE_API_BASE_URL=https://buylgd-backend-ne5n.onrender.com/api
```

## Setup Instructions

### 1. Install Dependencies
Run from the root directory:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Run the Project
You can run both from the root using npm scripts:
```bash
# Run Backend (Server)
npm run dev:server

# Run Frontend (Development)
npm run dev:frontend
```

## Deployment Steps
1.  **Backend**: Host on a platform like Render or Heroku. Ensure `MONGO_URI` is set in the environment variables.
2.  **Frontend**:
    *   Update `VITE_API_BASE_URL` in `frontend/.env` to point to your live backend URL (e.g., `https://buylgd-backend-ne5n.onrender.com/api`).
    *   Run `npm run build` in the `frontend` directory.
    *   Deploy the generated `dist/` folder to your hosting provider (like Vercel, Netlify, or your domain `app.buylgd.in`).

## Key Dependencies (Frontend)
*   `axios`: for API communication.
*   `framer-motion`: for premium UI animations.
*   `js-cookie`: for managing auth state.
*   `socket.io-client`: for real-time updates.
*   `recharts`: for dashboard analytics.

## Key Dependencies (Backend)
*   `mongoose`: for MongoDB modeling.
*   `bcryptjs`: for password hashing.
*   `jsonwebtoken`: for session management.
*   `socket.io`: for real-time websocket connections.
