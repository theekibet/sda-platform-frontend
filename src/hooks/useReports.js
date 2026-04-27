import { useState, useCallback } from 'react';
import { createReport, getMyReports, getReportById } from '../services/api';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Submit a new report
  const submitReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createReport(reportData);
      setLoading(false);
      return { 
        success: true, 
        data: response.data,
        message: 'Report submitted successfully. Thank you for helping keep our community safe!'
      };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to submit report. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch user's own reports
  const fetchMyReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyReports(params);
      setReports(response.data.reports || []);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch reports';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch single report by ID
  const fetchReportById = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getReportById(reportId);
      setSelectedReport(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch report';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear selected report
  const clearSelectedReport = useCallback(() => {
    setSelectedReport(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    reports,
    selectedReport,
    submitReport,
    fetchMyReports,
    fetchReportById,
    clearSelectedReport,
    clearError,
  };
};