# CANW - Setup Guide

## Quick Start (5 Minutes)

### Step 1: Prerequisites

- Download and install Node.js from https://nodejs.org/ (v16 or higher)
- Download and install Python from https://www.python.org/ (v3.9 or higher)
- Download and install MongoDB Community Edition from https://www.mongodb.com/try/download/community

### Step 2: Get API Keys

1. Get Grok API key from https://console.x.ai/ (requires xAI account)

### Step 3: Clone and Setup

```bash
# Navigate to project
cd CANW

# Copy environment template
cp .env.example .env

# Edit .env with your values (use a text editor)
```

### Step 4: Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Step 5: Start Services (Open 3 terminals)

**Terminal 1 - Backend:**

```bash
cd backend
npm install
npm run dev
```

✅ Backend running on http://localhost:5000

**Terminal 2 - AI Server:**

```bash
cd ai-server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```

✅ AI Server running on http://localhost:8000

**Terminal 3 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on http://localhost:3000

### Step 6: Test the Application

1. Open http://localhost:3000 in browser
2. Register new account
3. Create a note
4. Click AI button to generate summary
5. Share the note and view shared link

## 📁 Important Files to Edit

### Root `.env` file

```env
# BACKEND
MONGODB_URI=mongodb://localhost:27017/canw
JWT_SECRET=your-secret-key-here-change-this
PORT=5000
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# AI SERVER
AI_SERVER_URL=http://localhost:8000
GROK_API_KEY=your-grok-api-key-here
AI_SERVER_PORT=8000

# FRONTEND
VITE_API_URL=http://localhost:5000
```

Both the backend and AI server read values from this root `CANW/.env` file.

## 🐛 Common Issues

| Issue                      | Solution                                               |
| -------------------------- | ------------------------------------------------------ |
| MongoDB connection refused | Start MongoDB: `brew services start mongodb-community` |
| Port 5000 already in use   | Change PORT in .env                                    |
| GROK_API_KEY not found     | Add real Grok API key to .env                          |
| CORS error                 | Check CORS_ORIGIN matches frontend URL                 |
| "Cannot find module"       | Run `npm install` in that directory                    |

## 📚 API Testing

### Test with curl or Postman

**Register User:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create Note:**

```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "title": "My First Note",
    "content": "This is my first note content",
    "tags": ["test", "first"],
    "category": "personal"
  }'
```

## 🎯 Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can create notes
- [ ] User can edit notes
- [ ] Note auto-save works while typing
- [ ] User can archive and unarchive notes
- [ ] User can search notes by title
- [ ] User can filter by tags
- [ ] User can filter active vs archived notes
- [ ] AI generates summary (with Grok API key)
- [ ] User can share note publicly
- [ ] User can revoke a public share link
- [ ] Public share link is accessible without login
- [ ] Dashboard shows insights
- [ ] User can logout

## 🚀 Production Deployment

### Environment Setup

1. Create `.env` file with production values
2. Set `NODE_ENV=production` in backend
3. Use strong JWT_SECRET
4. Enable HTTPS
5. Set secure CORS_ORIGIN

### Database

- Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
- Create backup strategy
- Enable authentication

### Hosting Options

- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, Render
- **AI Server**: Railway, Render, AWS Lambda
- **Database**: MongoDB Atlas

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section in README.md
2. Verify all environment variables
3. Ensure all services are running
4. Check console for error messages
