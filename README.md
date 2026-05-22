# Weather Intelligence Platform

An advanced full-stack weather analysis platform built with React, Node.js, Express, PostgreSQL, Prisma, and Redis. Features interactive maps, Wikipedia insights, YouTube embedding, secure JWT authentication, and historical search data exporting.

## Tech Stack
* **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Leaflet (Maps)
* **Backend**: Node.js, Express, Prisma ORM, Axios
* **Database**: PostgreSQL (via Supabase), Redis
* **Security**: JWT Authentication, bcryptjs

## Running Locally

1. **Clone & Install Dependencies**
```bash
# Terminal 1: Backend
cd server
npm install

# Terminal 2: Frontend
cd client
npm install
```

2. **Environment Variables**
Create `.env` in the `server` folder:
```env
PORT=5000
WEATHER_API_KEY=your_weatherapi_key
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

3. **Start the Apps**
```bash
# Terminal 1: Backend
cd server
npx prisma db push
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## Deployment Guide (Vercel & Render)

This application is configured for seamless deployment to Vercel (Frontend) and Render (Backend).

### 1. Deploying the Backend (Render)
Render is an excellent platform for hosting Node.js servers and PostgreSQL databases.
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. Set the Root Directory to `server`.
3. Render should auto-detect the following (verify them):
   * **Environment**: Node
   * **Build Command**: `npm install` (The `postinstall` script in package.json will automatically run `prisma generate`)
   * **Start Command**: `npm start` (Runs `node src/server.js`)
4. **Environment Variables**: Add your `DATABASE_URL`, `WEATHER_API_KEY`, and `JWT_SECRET`.
5. Deploy! Once deployed, copy your new backend URL (e.g. `https://weather-backend.onrender.com`).

### 2. Deploying the Frontend (Vercel)
Vercel is the easiest way to deploy Vite React apps.
1. Connect your GitHub repository to Vercel and import the project.
2. Set the Root Directory to `client`.
3. Vercel will auto-detect the Vite framework.
4. **Environment Variables**: Add a new environment variable:
   * `VITE_API_URL` = `https://weather-backend.onrender.com` (Your Render URL)
5. Deploy! The `vercel.json` file is already configured to handle React Router client-side routing.

---
*Developed by Youssef Ayman*
