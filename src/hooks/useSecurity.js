import { useState, useCallback, useEffect } from 'react';
import { 
  getBlockedIPs, 
  blockIP, 
  unblockIP,
  getActiveSessions,
  terminateSession,
  terminateAllUserSessions,
  getLoginAttempts,
  getFailedLoginAttempts
} from '../services/api';

export const useSecurity = (options = {}) => {
  const { autoFetch = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [failedGrouped, setFailedGrouped] = useState([]);
  const [ipPagination, setIpPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });
  const [sessionPagination, setSessionPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });
  const [attemptPagination, setAttemptPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });

  // Fetch blocked IPs
  const fetchBlockedIPs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBlockedIPs({
        page: ipPagination.page,
        limit: ipPagination.limit,
        ...params
      });
      
      setBlockedIPs(response.data.ips || []);
      setIpPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch blocked IPs';
      setError(errorMessage);
      console.error('Error fetching blocked IPs:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [ipPagination.page, ipPagination.limit]);

  // Fetch active sessions
  const fetchSessions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getActiveSessions({
        page: sessionPagination.page,
        limit: sessionPagination.limit,
        ...params
      });
      
      setSessions(response.data.sessions || []);
      setSessionPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [sessionPagination.page, sessionPagination.limit]);

  // Fetch login attempts
  const fetchLoginAttempts = useCallback(async (days = 7, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLoginAttempts(days, {
        page: attemptPagination.page,
        limit: attemptPagination.limit,
        ...params
      });
      
      setLoginAttempts(response.data.attempts || []);
      setAttemptPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch login attempts';
      setError(errorMessage);
      console.error('Error fetching login attempts:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [attemptPagination.page, attemptPagination.limit]);

  // Fetch failed login attempts grouped by email
  const fetchFailedGrouped = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFailedLoginAttempts(days);
      setFailedGrouped(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch failed login attempts';
      setError(errorMessage);
      console.error('Error fetching failed login attempts:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Block an IP address
  const blockIPAddress = useCallback(async (ipAddress, data = {}) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await blockIP(ipAddress, data);
      
      // Refresh IP list
      await fetchBlockedIPs();
      
      return { 
        success: true, 
        data: response.data,
        message: `IP ${ipAddress} blocked successfully`
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to block IP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBlockedIPs]);

  // Unblock an IP address
  const unblockIPAddress = useCallback(async (ipAddress) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await unblockIP(ipAddress);
      
      // Refresh IP list
      await fetchBlockedIPs();
      
      return { 
        success: true, 
        message: `IP ${ipAddress} unblocked successfully`
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unblock IP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchBlockedIPs]);

  // Terminate a session
  const terminateUserSession = useCallback(async (sessionId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await terminateSession(sessionId);
      
      // Refresh sessions
      await fetchSessions();
      
      return { 
        success: true, 
        message: 'Session terminated successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to terminate session';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchSessions]);

  // Terminate all sessions for a user
  const terminateUserAllSessions = useCallback(async (userId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await terminateAllUserSessions(userId);
      
      // Refresh sessions
      await fetchSessions();
      
      return { 
        success: true, 
        message: 'All user sessions terminated successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to terminate user sessions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchSessions]);

  // Get statistics
  const getStats = useCallback(() => {
    return {
      ips: {
        total: ipPagination.total,
        active: blockedIPs.filter(ip => !ip.expiresAt || new Date(ip.expiresAt) > new Date()).length,
      },
      sessions: {
        total: sessionPagination.total,
      },
      attempts: {
        total: attemptPagination.total,
        failed: loginAttempts.filter(a => !a.success).length,
      },
    };
  }, [blockedIPs, loginAttempts, ipPagination.total, sessionPagination.total, attemptPagination.total]);

  // Change IP page
  const setIPPage = useCallback((page) => {
    setIpPagination(prev => ({ ...prev, page }));
  }, []);

  // Change sessions page
  const setSessionsPage = useCallback((page) => {
    setSessionPagination(prev => ({ ...prev, page }));
  }, []);

  // Change attempts page
  const setAttemptsPage = useCallback((page) => {
    setAttemptPagination(prev => ({ ...prev, page }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      Promise.all([
        fetchBlockedIPs(),
        fetchSessions(),
        fetchLoginAttempts(7),
        fetchFailedGrouped(7),
      ]);
    }
  }, [autoFetch, fetchBlockedIPs, fetchSessions, fetchLoginAttempts, fetchFailedGrouped]);

  return {
    loading,
    actionLoading,
    error,
    blockedIPs,
    sessions,
    loginAttempts,
    failedGrouped,
    ipPagination,
    sessionPagination,
    attemptPagination,
    fetchBlockedIPs,
    fetchSessions,
    fetchLoginAttempts,
    fetchFailedGrouped,
    blockIP: blockIPAddress,
    unblockIP: unblockIPAddress,
    terminateSession: terminateUserSession,
    terminateAllUserSessions: terminateUserAllSessions,
    getStats,
    setIPPage,
    setSessionsPage,
    setAttemptsPage,
  };
};