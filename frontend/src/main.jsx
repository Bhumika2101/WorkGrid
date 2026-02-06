import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TaskProvider } from './context/TaskContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </SocketProvider>
  </React.StrictMode>
);
