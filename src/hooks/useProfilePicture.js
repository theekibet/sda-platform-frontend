import { useState } from 'react';
import { uploadProfilePicture, removeProfilePicture } from '../services/api';

export const useProfilePicture = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const response = await uploadProfilePicture(file);
      return { success: true, avatarUrl: response.data.avatarUrl };
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    setUploading(true);
    setError(null);
    try {
      await removeProfilePicture();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Remove failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setUploading(false);
    }
  };

  return { upload, remove, uploading, error };
};