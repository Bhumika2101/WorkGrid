import React, { useState, useRef } from 'react';
import Select from 'react-select';
import { useTasks } from '../context/TaskContext.jsx';
import { X, Upload, Trash2, FileText, Image } from 'lucide-react';

const priorityOptions = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const categoryOptions = [
  { value: 'bug', label: 'Bug', color: '#ef4444' },
  { value: 'feature', label: 'Feature', color: '#3b82f6' },
  { value: 'enhancement', label: 'Enhancement', color: '#8b5cf6' },
];

const columnOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

// Custom styles for react-select
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--select-bg)',
    borderColor: state.isFocused ? '#3b82f6' : 'var(--select-border)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--select-bg)',
    border: '1px solid var(--select-border)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? 'var(--select-hover)'
      : 'transparent',
    color: state.isSelected ? 'white' : 'var(--select-text)',
    '&:active': {
      backgroundColor: '#2563eb',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--select-text)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--select-text)',
  }),
};

// Custom option with color dot
const CustomOption = ({ data, innerProps, isSelected, isFocused }) => (
  <div
    {...innerProps}
    className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
      isSelected ? 'bg-blue-500 text-white' : isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''
    }`}
  >
    {data.color && (
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: data.color }}
      />
    )}
    <span>{data.label}</span>
  </div>
);

// Custom single value with color dot
const CustomSingleValue = ({ data }) => (
  <div className="flex items-center gap-2">
    {data.color && (
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: data.color }}
      />
    )}
    <span>{data.label}</span>
  </div>
);

function TaskModal({ task, onClose }) {
  const { createTask, updateTask } = useTasks();
  const fileInputRef = useRef(null);
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    category: task?.category || 'feature',
    column: task?.column || 'todo',
    attachments: task?.attachments || [],
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing) {
      updateTask({
        id: task.id,
        ...formData,
      });
    } else {
      createTask(formData);
    }

    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Allowed: images, PDF, DOC, DOCX, TXT');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadedFile = await response.json();
      
      setFormData((prev) => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            filename: uploadedFile.filename,
            originalName: uploadedFile.originalName,
            url: uploadedFile.url,
            mimetype: uploadedFile.mimetype,
            size: uploadedFile.size,
          },
        ],
      }));
    } catch (error) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const isImageFile = (mimetype) => {
    return mimetype?.startsWith('image/');
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="task-modal"
    >
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            data-testid="close-modal-btn"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter task title"
              data-testid="task-title-input"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows="3"
              placeholder="Enter task description"
              data-testid="task-description-input"
            />
          </div>

          {/* Priority & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <Select
                value={priorityOptions.find((opt) => opt.value === formData.priority)}
                onChange={(option) => setFormData({ ...formData, priority: option.value })}
                options={priorityOptions}
                styles={customSelectStyles}
                components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                classNamePrefix="react-select"
                className="react-select-container"
                data-testid="task-priority-select"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={categoryOptions.find((opt) => opt.value === formData.category)}
                onChange={(option) => setFormData({ ...formData, category: option.value })}
                options={categoryOptions}
                styles={customSelectStyles}
                components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                classNamePrefix="react-select"
                className="react-select-container"
                data-testid="task-category-select"
              />
            </div>
          </div>

          {/* Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Column
            </label>
            <Select
              value={columnOptions.find((opt) => opt.value === formData.column)}
              onChange={(option) => setFormData({ ...formData, column: option.value })}
              options={columnOptions}
              styles={customSelectStyles}
              classNamePrefix="react-select"
              className="react-select-container"
              data-testid="task-column-select"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attachments
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                data-testid="file-upload-input"
              />
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    Images, PDF, DOC, DOCX, TXT (max 5MB)
                  </p>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-red-500 text-sm mt-2" data-testid="upload-error">
                {uploadError}
              </p>
            )}

            {/* Attachments List */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    data-testid={`attachment-${index}`}
                  >
                    {isImageFile(attachment.mimetype) ? (
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={attachment.url}
                          alt={attachment.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                      data-testid={`remove-attachment-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              data-testid="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              data-testid="submit-task-btn"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
