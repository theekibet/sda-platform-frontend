import { useState, useCallback, useEffect } from 'react';
import { 
  getContentModerationQueue, 
  moderateContent,
  getModerationLogs
} from '../services/api';

export const useModeration = (options = {}) => {
  const { autoFetch = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });
  const [logPagination, setLogPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });

  // Fetch moderation queue
  const fetchQueue = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getContentModerationQueue({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setQueue(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch moderation queue';
      setError(errorMessage);
      console.error('Error fetching moderation queue:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Fetch moderation logs
  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getModerationLogs({
        page: logPagination.page,
        limit: logPagination.limit,
        ...params
      });
      
      setLogs(response.data.logs || []);
      setLogPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch moderation logs';
      setError(errorMessage);
      console.error('Error fetching moderation logs:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [logPagination.page, logPagination.limit]);

  // Moderate content
  const moderateContentItem = useCallback(async (contentId, contentType, actionData) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await moderateContent(contentId, {
        contentType,
        ...actionData
      });
      
      // Remove from queue or update status
      setQueue(prev => prev.filter(item => item.id !== contentId));
      
      return { 
        success: true, 
        data: response.data,
        message: `Content ${actionData.action}ed successfully`
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to moderate content';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Select item for moderation
  const selectItem = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  // Clear selected item
  const clearSelectedItem = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Get statistics
  const getStats = useCallback(() => {
    const pending = queue.filter(item => item.status === 'pending').length;
    const highPriority = queue.filter(item => item.priority === 'high' || item.priority === 'critical').length;
    const byType = queue.reduce((acc, item) => {
      acc[item.contentType] = (acc[item.contentType] || 0) + 1;
      return acc;
    }, {});

    return {
      total: queue.length,
      pending,
      highPriority,
      byType,
    };
  }, [queue]);

  // Change queue page
  const setQueuePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Change logs page
  const setLogsPage = useCallback((page) => {
    setLogPagination(prev => ({ ...prev, page }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchQueue();
    }
  }, [autoFetch, fetchQueue]);

  return {
    loading,
    actionLoading,
    error,
    queue,
    logs,
    selectedItem,
    pagination,
    logPagination,
    fetchQueue,
    fetchLogs,
    moderateContent: moderateContentItem,
    selectItem,
    clearSelectedItem,
    getStats,
    setQueuePage,
    setLogsPage,
  };
};