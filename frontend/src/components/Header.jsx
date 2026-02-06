import React from 'react';
import { Sun, Moon, Plus, BarChart3, Wifi, WifiOff } from 'lucide-react';

function Header({
  darkMode,
  onToggleDarkMode,
  onAddTask,
  connectionStatus,
  isConnected,
  showChart,
  onToggleChart,
}) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">WG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                WorkGrid
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time Task Management
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div
              className={`connection-status ${connectionStatus}`}
              title={`Status: ${connectionStatus}`}
              data-testid="connection-status"
            >
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Toggle Chart */}
            <button
              onClick={onToggleChart}
              className={`p-2 rounded-lg transition-colors ${
                showChart
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              } hover:bg-blue-200 dark:hover:bg-blue-800`}
              title={showChart ? 'Hide Chart' : 'Show Chart'}
              data-testid="toggle-chart-btn"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              data-testid="dark-mode-toggle"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Add Task Button */}
            <button
              onClick={onAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              data-testid="add-task-btn"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
