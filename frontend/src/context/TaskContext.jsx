import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';

const TaskContext = createContext(null);

// Task action types
const ACTIONS = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Initial state
const initialState = {
  tasks: [],
  isLoading: true,
  error: null,
};

// Reducer function
function taskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TASKS:
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null,
      };

    case ACTIONS.ADD_TASK:
      // Check if task already exists to prevent duplicates
      if (state.tasks.some(t => t.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      };

    case ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case ACTIONS.MOVE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, column: action.payload.destinationColumn }
            : task
        ),
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { socket, emit, on, isConnected } = useSocket();

  // Listen to WebSocket events
  useEffect(() => {
    if (!socket) return;

    const unsubscribeSyncTasks = on('sync:tasks', (tasks) => {
      dispatch({ type: ACTIONS.SET_TASKS, payload: tasks });
    });

    const unsubscribeCreated = on('task:created', (task) => {
      dispatch({ type: ACTIONS.ADD_TASK, payload: task });
    });

    const unsubscribeUpdated = on('task:updated', (task) => {
      dispatch({ type: ACTIONS.UPDATE_TASK, payload: task });
    });

    const unsubscribeDeleted = on('task:deleted', ({ id }) => {
      dispatch({ type: ACTIONS.DELETE_TASK, payload: id });
    });

    const unsubscribeMoved = on('task:moved', ({ task }) => {
      dispatch({ type: ACTIONS.UPDATE_TASK, payload: task });
    });

    const unsubscribeError = on('error', (error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    });

    return () => {
      unsubscribeSyncTasks();
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeMoved();
      unsubscribeError();
    };
  }, [socket, on]);

  // Task actions
  const createTask = useCallback((taskData) => {
    emit('task:create', taskData);
  }, [emit]);

  const updateTask = useCallback((taskData) => {
    emit('task:update', taskData);
  }, [emit]);

  const deleteTask = useCallback((taskId) => {
    emit('task:delete', taskId);
  }, [emit]);

  const moveTask = useCallback((taskId, sourceColumn, destinationColumn, sourceIndex, destinationIndex) => {
    // Optimistic update
    dispatch({
      type: ACTIONS.MOVE_TASK,
      payload: { taskId, destinationColumn },
    });

    emit('task:move', {
      taskId,
      sourceColumn,
      destinationColumn,
      sourceIndex,
      destinationIndex,
    });
  }, [emit]);

  // Get tasks by column
  const getTasksByColumn = useCallback((column) => {
    return state.tasks.filter(task => task.column === column);
  }, [state.tasks]);

  // Get task counts for chart
  const getTaskCounts = useCallback(() => {
    const counts = {
      todo: 0,
      inprogress: 0,
      done: 0,
      total: state.tasks.length,
    };

    state.tasks.forEach(task => {
      if (counts.hasOwnProperty(task.column)) {
        counts[task.column]++;
      }
    });

    return counts;
  }, [state.tasks]);

  const value = {
    tasks: state.tasks,
    isLoading: state.isLoading,
    error: state.error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByColumn,
    getTaskCounts,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;
