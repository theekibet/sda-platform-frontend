// src/hooks/useBible.js
import { useState, useCallback } from 'react';
import { bibleService } from '../services/bibleService';

export const useBible = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todaysVerse, setTodaysVerse] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [queueStats, setQueueStats] = useState(null);

  // Fetch today's verse
  const fetchTodaysVerse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.getTodaysVerse();
      setTodaysVerse(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch verse';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queue status
  const fetchQueueStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.getQueueStatus();
      setQueueStatus(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch queue status';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Share a verse
  const shareVerse = useCallback(async (verseId, comment) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.shareVerse(verseId, comment);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to share verse';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's submissions
  const fetchMySubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.getMySubmissions();
      setMySubmissions(response.data.data || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch submissions';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ NEW METHODS FOR ENHANCED SUBMISSIONS ============

  // Get single submission details
  const getSubmissionDetails = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.getSubmissionDetails(id);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch submission details';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel submission (delete)
  const cancelSubmission = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.cancelSubmission(id);
      // Remove from local state
      setMySubmissions(prev => prev.filter(sub => sub.id !== id));
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel submission';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get queue stats
  const getMyQueueStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bibleService.getMyQueueStats();
      setQueueStats(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch queue stats';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    todaysVerse,
    queueStatus,
    mySubmissions,
    queueStats,
    fetchTodaysVerse,
    fetchQueueStatus,
    shareVerse,
    fetchMySubmissions,
    // New methods
    getSubmissionDetails,
    cancelSubmission,
    getMyQueueStats,
  };
};