import { useState, useCallback } from 'react';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom hook for handling file uploads
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    if (!file) {
      return 'No file selected';
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Allowed: images, PDF, DOC, DOCX, TXT';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 5MB.';
    }

    return null;
  }, []);

  const uploadFile = useCallback(async (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadedFile = await response.json();
      return uploadedFile;
    } catch (err) {
      setError(err.message || 'Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  }, [validateFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    uploading,
    error,
    clearError,
    validateFile,
  };
}

export default useFileUpload;
