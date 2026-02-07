# SPARKYHACKY

Basic MERN stack starter with Vite frontend.

## Structure

- `client/` - React + Vite frontend
- `server/` - Express backend with optional MongoDB connection

## Quick start

1. Install frontend dependencies:

```bash
cd client
npm install
```

2. Install backend dependencies:

```bash
cd ../server
npm install
```

3. (Optional) Configure backend env:

```bash
cp .env.example .env
```

4. Run backend:

```bash
npm run dev
```

5. In a new terminal, run frontend:

```bash
cd ../client
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`
