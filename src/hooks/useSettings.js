import { useState, useCallback, useEffect } from 'react';
import { 
  getSystemSettings, 
  updateSystemSettings,
  getFeatureFlags,
  updateFeatureFlag,
  getEmailTemplates,
  updateEmailTemplate,
  sendTestEmail
} from '../services/api';

export const useSettings = (options = {}) => {
  const { autoFetch = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSystemSettings();
      setSettings(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch feature flags
  const fetchFeatureFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFeatureFlags();
      setFeatureFlags(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch feature flags';
      setError(errorMessage);
      console.error('Error fetching feature flags:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch email templates
  const fetchEmailTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEmailTemplates();
      setEmailTemplates(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch email templates';
      setError(errorMessage);
      console.error('Error fetching email templates:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (settingsData) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await updateSystemSettings(settingsData);
      
      // Refresh settings
      await fetchSettings();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Settings updated successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  // Update feature flag
  const updateFeature = useCallback(async (flagName, enabled) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await updateFeatureFlag(flagName, enabled);
      
      // Update local state
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.name === flagName ? { ...flag, enabled } : flag
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: `Feature "${flagName}" ${enabled ? 'enabled' : 'disabled'}`
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update feature flag';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, []);

  // Update email template
  const updateTemplate = useCallback(async (templateName, templateData) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await updateEmailTemplate(templateName, templateData);
      
      // Update local state
      setEmailTemplates(prev => 
        prev.map(t => 
          t.name === templateName ? { ...t, ...templateData } : t
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Email template updated successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update email template';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, []);

  // Send test email
  const sendTest = useCallback(async (templateName, testEmail) => {
    setSaving(true);
    setError(null);
    
    try {
      await sendTestEmail(templateName, testEmail);
      
      return { 
        success: true, 
        message: 'Test email sent successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send test email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, []);

  // Get setting value by key
  const getSetting = useCallback((key, defaultValue = null) => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  }, [settings]);

  // Select email template
  const selectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
  }, []);

  // Clear selected template
  const clearSelectedTemplate = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      Promise.all([
        fetchSettings(),
        fetchFeatureFlags(),
        fetchEmailTemplates(),
      ]);
    }
  }, [autoFetch, fetchSettings, fetchFeatureFlags, fetchEmailTemplates]);

  return {
    loading,
    saving,
    error,
    settings,
    featureFlags,
    emailTemplates,
    selectedTemplate,
    fetchSettings,
    fetchFeatureFlags,
    fetchEmailTemplates,
    updateSettings,
    updateFeature,
    updateTemplate,
    sendTest,
    getSetting,
    selectTemplate,
    clearSelectedTemplate,
  };
};