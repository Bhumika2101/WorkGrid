require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database and models
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');
const { generateToken, protect, socketAuth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['https://work-grid-five.vercel.app/', 'http://localhost:3000'],
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

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create new user
    const user = await User.create({ username, email, password });

    // Create default welcome tasks for new user
    const defaultTasks = [
      {
        userId: user._id,
        title: 'Welcome to Kanban!',
        description: 'Drag this task to another column to get started.',
        priority: 'medium',
        category: 'feature',
        column: 'todo',
        attachments: [],
        order: 0
      },
      {
        userId: user._id,
        title: 'Create your first task',
        description: 'Click the "Add Task" button to create a new task.',
        priority: 'high',
        category: 'feature',
        column: 'todo',
        attachments: [],
        order: 1
      }
    ];

    await Task.insertMany(defaultTasks);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: 'Server error during registration: ' + error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
app.get('/api/auth/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  });
});

// ==================== TASK ROUTES (Protected) ====================

// Get all tasks for authenticated user
app.get('/api/tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ column: 1, order: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Upload file (protected)
app.post('/api/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
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
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  return res.status(400).json({ error: err.message });
});

// ==================== SOCKET.IO WITH AUTHENTICATION ====================

// Apply authentication middleware to all socket connections
io.use(socketAuth);

// Track connected users by room (userId)
const userSockets = new Map();

io.on('connection', async (socket) => {
  const userId = socket.userId;
  console.log(`Client connected: ${socket.id} (User: ${socket.user.username})`);
  
  // Join user's personal room
  socket.join(userId);
  
  // Track socket for this user
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);
  
  // Send user's tasks on connection
  try {
    const tasks = await Task.find({ userId }).sort({ column: 1, order: 1 });
    socket.emit('sync:tasks', tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    socket.emit('error', { message: 'Error loading tasks' });
  }
  
  // Handle task creation
  socket.on('task:create', async (taskData) => {
    try {
      const newTask = await Task.create({
        userId,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'feature',
        column: taskData.column || 'todo',
        attachments: taskData.attachments || [],
        order: taskData.order || 0
      });
      
      // Broadcast to all user's connected devices
      io.to(userId).emit('task:created', newTask);
      
      // Also sync all tasks
      const tasks = await Task.find({ userId }).sort({ column: 1, order: 1 });
      io.to(userId).emit('sync:tasks', tasks);
      
      console.log(`Task created: ${newTask.id} by user ${socket.user.username}`);
    } catch (error) {
      console.error('Task create error:', error);
      socket.emit('error', { message: 'Error creating task' });
    }
  });
  
  // Handle task update
  socket.on('task:update', async (taskData) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: taskData.id, userId },
        {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          column: taskData.column,
          attachments: taskData.attachments
        },
        { new: true }
      );
      
      if (!task) {
        socket.emit('error', { message: 'Task not found' });
        return;
      }
      
      // Broadcast to all user's devices
      io.to(userId).emit('task:updated', task);
      
      const tasks = await Task.find({ userId }).sort({ column: 1, order: 1 });
      io.to(userId).emit('sync:tasks', tasks);
      
      console.log(`Task updated: ${taskData.id}`);
    } catch (error) {
      console.error('Task update error:', error);
      socket.emit('error', { message: 'Error updating task' });
    }
  });
  
  // Handle task move between columns
  socket.on('task:move', async ({ taskId, sourceColumn, destinationColumn, sourceIndex, destinationIndex }) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { column: destinationColumn, order: destinationIndex },
        { new: true }
      );
      
      if (!task) {
        socket.emit('error', { message: 'Task not found' });
        return;
      }
      
      // Broadcast to all user's devices
      io.to(userId).emit('task:moved', {
        task,
        sourceColumn,
        destinationColumn,
        sourceIndex,
        destinationIndex
      });
      
      const tasks = await Task.find({ userId }).sort({ column: 1, order: 1 });
      io.to(userId).emit('sync:tasks', tasks);
      
      console.log(`Task ${taskId} moved from ${sourceColumn} to ${destinationColumn}`);
    } catch (error) {
      console.error('Task move error:', error);
      socket.emit('error', { message: 'Error moving task' });
    }
  });
  
  // Handle task deletion
  socket.on('task:delete', async (taskId) => {
    try {
      const task = await Task.findOneAndDelete({ _id: taskId, userId });
      
      if (!task) {
        socket.emit('error', { message: 'Task not found' });
        return;
      }
      
      // Broadcast to all user's devices
      io.to(userId).emit('task:deleted', { id: taskId });
      
      const tasks = await Task.find({ userId }).sort({ column: 1, order: 1 });
      io.to(userId).emit('sync:tasks', tasks);
      
      console.log(`Task deleted: ${taskId}`);
    } catch (error) {
      console.error('Task delete error:', error);
      socket.emit('error', { message: 'Error deleting task' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove socket from tracking
    if (userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);
      }
    }
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

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 3002;

// Connect to MongoDB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = { app, server, io };
