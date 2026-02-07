import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import ProgressChart from './components/ProgressChart.jsx';
import AuthPage from './components/AuthPage.jsx';
import { useTasks } from './context/TaskContext.jsx';
import { useSocket } from './context/SocketContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showChart, setShowChart] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { isLoading } = useTasks();
  const { isConnected, connectionStatus } = useSocket();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onAddTask={() => handleOpenModal()}
        connectionStatus={connectionStatus}
        isConnected={isConnected}
        showChart={showChart}
        onToggleChart={() => setShowChart(!showChart)}
        user={user}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-6">
        {isLoading && !isConnected ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <LoadingSpinner size="large" />
            <p className="text-gray-600 dark:text-gray-400">Connecting to server...</p>
          </div>
        ) : (
          <>
            {showChart && (
              <div className="mb-6">
                <ProgressChart />
              </div>
            )}
            
            <KanbanBoard onEditTask={handleOpenModal} />
          </>
        )}
      </main>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
