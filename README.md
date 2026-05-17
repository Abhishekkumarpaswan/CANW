# CANW - Collaborative AI Notes Workspace

A full-stack application that enables users to create, manage, and share AI-enhanced notes with AI-powered features like summaries, action items extraction, and title suggestions.

## 🎯 Project Overview

CANW is a modern notes application built with:

- **Frontend**: React.js with Vite, Tailwind CSS, Zustand for state management
- **Backend**: Express.js with MongoDB
- **AI Server**: Python FastAPI with Grok API integration
- **Database**: MongoDB

## ✨ Features

### 1. Authentication

- User signup and login with JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and persistent sessions
- Logout functionality

### 2. Notes Workspace

- Create, read, update, and delete notes
- Auto-save functionality
- Organize notes with tags and categories
- Archive notes for later reference
- Full-text search capabilities

### 3. AI Integration (Grok API)

- **AI Summaries**: Automatically generate concise summaries from note content
- **Action Items**: Extract key action items from notes
- **Suggested Titles**: Generate better titles for your notes
- Track AI usage statistics

### 4. Search & Filtering

- Keyword search across all notes
- Filter by tags and categories
- Sort by recent, oldest, or alphabetical order
- Responsive and intuitive search UI

### 5. Public Sharing

- Generate shareable links for notes
- Share notes without authentication
- Revoke sharing access anytime
- Clean public-facing note display

### 6. Productivity Insights Dashboard

- Total notes count
- Recently edited notes
- Most-used tags
- AI usage statistics
- Weekly activity summary

## 📁 Project Structure

```
CANW/
├── frontend/                    # React.js Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── SharedNote.jsx
│   │   ├── utils/
│   │   │   ├── api.js           # API calls
│   │   │   └── store.js         # Zustand stores
│   │   ├── styles/              # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── backend/                     # Express.js Backend
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   ├── middlewares/         # Custom middlewares
│   │   ├── utils/               # Utility functions
│   │   ├── db/                  # Database connection
│   │   ├── app.js               # Express app setup
│   │   └── index.js             # Entry point
│   └── package.json
├── ai-server/                   # Python FastAPI AI Server
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt          # Python dependencies
│   └── .env.example
├── .env.example                 # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.9+ and pip
- MongoDB running locally or MongoDB Atlas URI
- Grok API key from xAI

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd CANW
```

#### 2. Set Up Environment Variables

Create `.env` file in root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
# Backend
MONGODB_URI=mongodb://localhost:27017/canw
JWT_SECRET=your-secret-key-here-change-in-production
PORT=5000
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# AI Server
AI_SERVER_URL=http://localhost:8000
GROK_API_KEY=your-grok-api-key-here
AI_SERVER_PORT=8000

# Frontend
VITE_API_URL=http://localhost:5000
```

The backend and AI server both load configuration from the root `CANW/.env` file.

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

Server will run on `http://localhost:5000`

#### 4. AI Server Setup

```bash
cd ai-server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python3 main.py
```

AI server will run on `http://localhost:8000`

#### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Manual Verification

- Register and log in successfully
- Create a note and confirm it auto-saves while typing
- Edit a note and clear its content to confirm empty content persists
- Filter active vs archived notes and archive/unarchive a note
- Generate an AI summary for a note
- Share a note publicly, open the shared page, then revoke the share link
- Confirm dashboard metrics load for the signed-in user

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Notes

- `GET /api/notes` - Get all user notes (with filters)
- `POST /api/notes` - Create new note
- `GET /api/notes/:noteId` - Get specific note
- `PATCH /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note
- `PATCH /api/notes/:noteId/archive` - Archive/unarchive note
- `POST /api/notes/:noteId/share` - Generate share link
- `DELETE /api/notes/:noteId/share` - Revoke share link

### AI Features

- `POST /api/ai/:noteId/summarize` - Generate summary, action items, and suggested title

### Dashboard

- `GET /api/dashboard` - Get productivity insights

### Public

- `GET /api/public/share/:shareToken` - View shared note (public, no auth required)

## 🔌 AI Server Endpoints

- `GET /health` - Health check
- `POST /api/ai/summarize` - Generate note summary and analysis

## 💾 Database Schema

### User Collection

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Note Collection

```javascript
{
  title: String,
  content: String,
  owner: ObjectId (User),
  tags: [String],
  category: String,
  summary: String,
  actionItems: [String],
  suggestedTitle: String,
  isArchived: Boolean,
  isPublic: Boolean,
  shareToken: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### AiUsageLog Collection

```javascript
{
  user: ObjectId (User),
  note: ObjectId (Note),
  type: String (summary|action_items|suggested_title),
  tokensUsed: Number,
  createdAt: Date
}
```

## 🛠️ Technologies Used

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### AI Server

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Grok API** - AI provider
- **Pydantic** - Data validation

## 📝 Usage Guide

### Creating a Note

1. Login to the application
2. Click "Create Note" button
3. Enter title, content, and optional tags
4. Select category
5. Click "Save Note"

### Generating AI Summary

1. Open a note
2. Click "AI" button to generate summary, action items, and suggested title
3. Review the generated content
4. The summary is automatically saved to the note

### Sharing a Note

1. Click "Share" button on a note card
2. A share link is automatically copied to clipboard
3. Share the link with anyone
4. Recipients can view the note without logging in

### Viewing Dashboard

1. Click "Dashboard" in navigation
2. View productivity insights including:
   - Total notes count
   - Recently edited notes
   - Most used tags
   - AI usage statistics
   - Weekly activity

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Secure HTTP-only cookies
- CORS protection
- Protected API routes
- Share token validation

## 📊 Sample Data

### Example API Response - Get Notes

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Project Planning",
      "content": "Meeting notes...",
      "tags": ["work", "meeting"],
      "category": "work",
      "summary": "Brief summary of the project...",
      "actionItems": ["Prepare UI mockups", "Review API"],
      "suggestedTitle": "Sprint Planning Notes",
      "isArchived": false,
      "isPublic": false,
      "updatedAt": "2024-05-14T12:00:00Z"
    }
  ],
  "message": "Notes fetched successfully"
}
```

### Example Dashboard Response

```json
{
  "statusCode": 200,
  "data": {
    "totalNotes": 15,
    "recentNotes": [...],
    "mostUsedTags": [
      { "tag": "work", "count": 8 },
      { "tag": "important", "count": 5 }
    ],
    "aiUsageStats": [
      { "type": "summary", "count": 12, "totalTokens": 3500 }
    ],
    "weeklyActivity": [
      { "_id": "2024-05-14", "count": 3 }
    ]
  },
  "message": "Dashboard insights fetched successfully"
}
```

## 🔄 Workflow

### Authentication Flow

1. User registers with email and password
2. Password is hashed and stored securely
3. JWT access token is generated
4. Token is stored in localStorage and sent in headers for subsequent requests
5. Backend validates token on protected routes

### Note Creation Flow

1. User fills note form
2. Frontend sends POST request to backend
3. Backend saves note to MongoDB
4. Frontend receives note object
5. Note appears in notes list immediately

### AI Summary Generation Flow

1. User clicks "AI" button on a note
2. Frontend sends note content to FastAPI server
3. FastAPI server calls Grok API
4. Grok API generates summary, action items, and title suggestions
5. Results are sent back to backend and saved
6. Frontend updates UI with new data

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway/Render)

- Set environment variables
- Connect MongoDB database
- Deploy from git repository

### AI Server (Heroku/Railway)

- Set GROK_API_KEY environment variable
- Deploy Python application
- Update AI_SERVER_URL in backend

## 📚 Optional Enhancements (Nice to Have)

- [ ] Real-time collaboration with WebSockets
- [ ] Markdown preview in note editor
- [ ] Optimistic UI updates
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Note export (PDF, Markdown)
- [ ] Collaborative editing
- [ ] Automated tests
- [ ] Note versioning/history
- [ ] Rich text editor

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `brew services start mongodb-community`
- Check MONGODB_URI in .env
- Verify connection string format

### AI Server Not Responding

- Check GROK_API_KEY is set correctly
- Ensure FastAPI server is running: `python main.py`
- Check firewall/port 8000 is accessible

### CORS Errors

- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check that frontend and backend are on different ports

### Token Invalid Error

- Clear localStorage: `localStorage.clear()`
- Re-login to get new token
- Check JWT_SECRET is same in backend

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Grok API Documentation](https://docs.x.ai/)

## 📄 License

This project is provided for educational purposes.

## 👨‍💻 Author

Built as the CANW full stack project assignment.

---

**Ready to run?** Follow the installation steps above and start building! 🚀
