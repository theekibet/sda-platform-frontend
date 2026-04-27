import { useState, useCallback, useEffect } from 'react';
import { 
  createDatabaseBackup,
  getBackupList,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  getSystemHealth,
  clearCache,
  getDatabaseStats,
  optimizeDatabase
} from '../services/api';

export const useMaintenance = (options = {}) => {
  const { autoFetch = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([]);
  const [health, setHealth] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [backupPagination, setBackupPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBackupList();
      setBackups(response.data.backups || []);
      setBackupPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch backups';
      setError(errorMessage);
      console.error('Error fetching backups:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch system health
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSystemHealth();
      setHealth(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch system health';
      setError(errorMessage);
      console.error('Error fetching system health:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch database stats
  const fetchDatabaseStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDatabaseStats();
      setDbStats(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch database stats';
      setError(errorMessage);
      console.error('Error fetching database stats:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create backup
  const createBackup = useCallback(async (backupData = {}) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await createDatabaseBackup(backupData);
      
      // Refresh backups
      await fetchBackups();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Backup created successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBackups]);

  // Download backup
  const downloadBackupFile = useCallback(async (backupId, filename) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await downloadBackup(backupId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { 
        success: true, 
        message: 'Backup downloaded successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to download backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Restore backup
  const restoreBackupFile = useCallback(async (backupId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await restoreBackup(backupId);
      
      // Refresh data
      await Promise.all([
        fetchBackups(),
        fetchHealth(),
        fetchDatabaseStats(),
      ]);
      
      return { 
        success: true, 
        message: 'Database restored successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to restore backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBackups, fetchHealth, fetchDatabaseStats]);

  // Delete backup
  const deleteBackupFile = useCallback(async (backupId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await deleteBackup(backupId);
      
      // Refresh backups
      await fetchBackups();
      
      return { 
        success: true, 
        message: 'Backup deleted successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBackups]);

  // Clear cache
  const clearSystemCache = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    
    try {
      await clearCache();
      
      // Refresh health
      await fetchHealth();
      
      return { 
        success: true, 
        message: 'Cache cleared successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cache';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchHealth]);

  // Optimize database
  const optimizeDatabaseSystem = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    
    try {
      await optimizeDatabase();
      
      // Refresh database stats
      await fetchDatabaseStats();
      
      return { 
        success: true, 
        message: 'Database optimized successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to optimize database';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchDatabaseStats]);

  // Get backup statistics
  const getBackupStats = useCallback(() => {
    const totalSize = backups.reduce((acc, b) => acc + (b.size || 0), 0);
    const manualBackups = backups.filter(b => b.type === 'manual').length;
    const scheduledBackups = backups.filter(b => b.type === 'scheduled').length;
    
    return {
      total: backups.length,
      totalSize,
      manualBackups,
      scheduledBackups,
      latestBackup: backups[0]?.createdAt,
    };
  }, [backups]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      Promise.all([
        fetchBackups(),
        fetchHealth(),
        fetchDatabaseStats(),
      ]);
    }
  }, [autoFetch, fetchBackups, fetchHealth, fetchDatabaseStats]);

  return {
    loading,
    actionLoading,
    error,
    backups,
    health,
    dbStats,
    backupPagination,
    fetchBackups,
    fetchHealth,
    fetchDatabaseStats,
    createBackup,
    downloadBackup: downloadBackupFile,
    restoreBackup: restoreBackupFile,
    deleteBackup: deleteBackupFile,
    clearCache: clearSystemCache,
    optimizeDatabase: optimizeDatabaseSystem,
    getBackupStats,
  };
};