# WebSocket-Powered Kanban Board

A real-time Kanban board application built with React, Node.js, and Socket.IO.

## 🚀 Features

- ✅ Create, update, delete, and move tasks between columns
- ✅ Drag and drop tasks using react-beautiful-dnd
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
│   └── package.json            # Backend dependencies
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── utils/              # Utility functions
│   │   └── tests/              # All test cases
│   │       ├── unit/           # Unit tests (Vitest)
│   │       ├── integration/    # Integration tests (Vitest)
│   │       └── e2e/            # End-to-end tests (Playwright)
│   └── package.json            # Frontend dependencies
│
└── README.md                   # Project guide
```

## 🛠 Installation

### Backend Setup

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
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

## 📡 WebSocket Events

| Event         | Description                          |
| ------------- | ------------------------------------ |
| `task:create` | Creates a new task                   |
| `task:update` | Updates an existing task             |
| `task:move`   | Moves a task between columns         |
| `task:delete` | Deletes a task                       |
| `sync:tasks`  | Syncs all tasks to connected clients |

## 🎨 Task Properties

- **Title**: Task name
- **Description**: Detailed description
- **Priority**: Low, Medium, High
- **Category**: Bug, Feature, Enhancement
- **Column**: To Do, In Progress, Done
- **Attachments**: File uploads

#

## 📚 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, react-beautiful-dnd, react-select, Recharts
- **Backend**: Node.js, Express, Socket.IO
- **Testing**: Vitest, React Testing Library, Playwright
- **State Management**: React Context + useReducer

## 📝 License

MIT
