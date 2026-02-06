import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { Trash2, Edit2, Paperclip, GripVertical } from 'lucide-react';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const categoryColors = {
  bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  enhancement: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

function TaskCard({ task, onEdit, isDragging }) {
  const { deleteTask } = useTasks();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    deleteTask(task.id);
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 transition-all ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500' : 'hover:shadow-lg'
      }`}
      data-testid={`task-card-${task.id}`}
    >
      {/* Drag Handle */}
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0 cursor-grab" />
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="font-medium text-gray-800 dark:text-white truncate"
            data-testid={`task-title-${task.id}`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}
              data-testid={`task-priority-${task.id}`}
            >
              {task.priority}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[task.category]}`}
              data-testid={`task-category-${task.id}`}
            >
              {task.category}
            </span>
          </div>

          {/* Attachments indicator */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-gray-400 dark:text-gray-500">
              <Paperclip className="w-3 h-3" />
              <span className="text-xs">{task.attachments.length} attachment(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
          title="Edit task"
          data-testid={`edit-task-${task.id}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        {showConfirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              data-testid={`confirm-delete-${task.id}`}
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmDelete(false);
              }}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Delete task"
            data-testid={`delete-task-${task.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
