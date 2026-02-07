# WebSocket-Powered Kanban Board

A real-time Kanban board application built with React, Node.js, Socket.IO, and MongoDB with user authentication.

## 🚀 Features

- ✅ **User Authentication** - Register/Login with JWT tokens
- ✅ **Persistent Storage** - User data and tasks stored in MongoDB
- ✅ **Multi-device Sync** - Login from any device and see your tasks
- ✅ Create, update, delete, and move tasks between columns
- ✅ Drag and drop tasks using @hello-pangea/dnd
- ✅ Real-time synchronization via WebSockets (Socket.IO)
- ✅ File attachments for tasks
- ✅ Priority levels (Low, Medium, High)
- ✅ Task categories (Bug, Feature, Enhancement)
- ✅ Task progress visualization with charts
- ✅ Responsive design with dark mode support
- ✅ Comprehensive testing (Unit, Integration, E2E)

## 📂 Project Structure

```
websocket-kanban-vitest-playwright/
├── backend/                    # Node.js WebSocket server
│   ├── server.js               # Express + Socket.IO setup
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User model
│   │   └── Task.js             # Task model
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── .env                    # Environment variables
│   └── package.json            # Backend dependencies
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   └── AuthPage.jsx    # Login/Register page
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   ├── SocketContext.jsx # WebSocket connection
│   │   │   └── TaskContext.jsx # Task state management
│   │   ├── utils/              # Utility functions
│   │   └── tests/              # All test cases
│   │       ├── unit/           # Unit tests (Vitest)
│   │       ├── integration/    # Integration tests (Vitest)
│   │       └── e2e/            # End-to-end tests (Playwright)
│   ├── .env                    # Frontend environment variables
│   └── package.json            # Frontend dependencies
│
└── README.md                   # Project guide
```

## 🛠 Installation

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
npm install
```

2. Create `.env` file:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/kanban_db
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban_db

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# JWT token expiration
JWT_EXPIRES_IN=7d

# Server port
PORT=3002
```

3. Start the server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:3002`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
npm install
```

2. Create `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3002

# WebSocket URL
VITE_SOCKET_URL=http://localhost:3002
```

3. Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## 🧪 Running Tests

### Unit & Integration Tests (Vitest)

```bash
cd frontend
npm run test           # Run all tests
npm run test:unit      # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage  # Run tests with coverage
```

### E2E Tests (Playwright)

```bash
cd frontend
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Run E2E tests with UI
```

## � Authentication API

| Endpoint             | Method | Description              |
| -------------------- | ------ | ------------------------ |
| `/api/auth/register` | POST   | Register a new user      |
| `/api/auth/login`    | POST   | Login and get JWT token  |
| `/api/auth/me`       | GET    | Get current user profile |

### Register Request

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 📡 WebSocket Events

| Event         | Description                          |
| ------------- | ------------------------------------ |
| `task:create` | Creates a new task                   |
| `task:update` | Updates an existing task             |
| `task:move`   | Moves a task between columns         |
| `task:delete` | Deletes a task                       |
| `sync:tasks`  | Syncs all tasks to connected clients |

**Note:** WebSocket connections require authentication. Pass the JWT token in the `auth` object when connecting.

## 🎨 Task Properties

- **Title**: Task name
- **Description**: Detailed description
- **Priority**: Low, Medium, High
- **Category**: Bug, Feature, Enhancement
- **Column**: To Do, In Progress, Done
- **Attachments**: File uploads

#

## 📚 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, @hello-pangea/dnd, react-select, Recharts, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Testing**: Vitest, React Testing Library, Playwright
- **State Management**: React Context + useReducer

## 🔄 How Multi-Device Sync Works

1. User registers/logs in and receives a JWT token
2. Token is stored in localStorage and sent with WebSocket connection
3. Server authenticates the socket connection using the token
4. User joins a personal "room" based on their user ID
5. All task changes are broadcast to all sockets in that user's room
6. Login from another device = instant sync of all tasks
