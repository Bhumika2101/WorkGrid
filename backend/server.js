const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDF, DOC, DOCX, TXT'), false);
    }
  }
});

// In-memory task storage (can be replaced with MongoDB)
let tasks = [
  {
    id: uuidv4(),
    title: 'Welcome to Kanban!',
    description: 'Drag this task to another column to get started.',
    priority: 'medium',
    category: 'feature',
    column: 'todo',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Setup WebSocket Connection',
    description: 'Implement real-time updates using Socket.IO',
    priority: 'high',
    category: 'feature',
    column: 'inprogress',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Initial Project Setup',
    description: 'Created React + Vite project with all dependencies',
    priority: 'low',
    category: 'enhancement',
    column: 'done',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// REST API endpoints
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: fileUrl,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send all tasks to newly connected client
  socket.emit('sync:tasks', tasks);
  
  // Handle task creation
  socket.on('task:create', (taskData) => {
    const newTask = {
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'feature',
      column: taskData.column || 'todo',
      attachments: taskData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    // Broadcast to all clients including sender
    io.emit('task:created', newTask);
    io.emit('sync:tasks', tasks);
    
    console.log(`Task created: ${newTask.id}`);
  });
  
  // Handle task update
  socket.on('task:update', (taskData) => {
    const taskIndex = tasks.findIndex(t => t.id === taskData.id);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      // Broadcast to all clients
      io.emit('task:updated', tasks[taskIndex]);
      io.emit('sync:tasks', tasks);
      
      console.log(`Task updated: ${taskData.id}`);
    } else {
      socket.emit('error', { message: 'Task not found' });
    }
  });
  
  // Handle task move between columns
  socket.on('task:move', ({ taskId, sourceColumn, destinationColumn, sourceIndex, destinationIndex }) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        column: destinationColumn,
        updatedAt: new Date().toISOString()
      };
      
      // Broadcast to all clients
      io.emit('task:moved', {
        task: tasks[taskIndex],
        sourceColumn,
        destinationColumn,
        sourceIndex,
        destinationIndex
      });
      io.emit('sync:tasks', tasks);
      
      console.log(`Task ${taskId} moved from ${sourceColumn} to ${destinationColumn}`);
    } else {
      socket.emit('error', { message: 'Task not found' });
    }
  });
  
  // Handle task deletion
  socket.on('task:delete', (taskId) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      const deletedTask = tasks.splice(taskIndex, 1)[0];
      
      // Broadcast to all clients
      io.emit('task:deleted', { id: taskId });
      io.emit('sync:tasks', tasks);
      
      console.log(`Task deleted: ${taskId}`);
    } else {
      socket.emit('error', { message: 'Task not found' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error: ${error.message}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connectedClients: io.engine.clientsCount });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

module.exports = { app, server, io };
