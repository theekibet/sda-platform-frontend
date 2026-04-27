// src/pages/admin/settings/SettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '../../../services/api';
import FeatureFlags from './FeatureFlags';
import EmailTemplates from './EmailTemplates';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSystemSettings();
      const settingsData = response.data || {};
      setSettings(settingsData);
      
      // Initialize form data with current values
      const initialData = {};
      settingsData.forEach(setting => {
        initialData[setting.key] = setting.value;
      });
      setFormData(initialData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare settings for update
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }));
      
      await updateSystemSettings(updates);
      setSuccess('Settings saved successfully!');
      
      // Refresh settings
      await fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset form to current settings
    if (settings) {
      const resetData = {};
      settings.forEach(setting => {
        resetData[setting.key] = setting.value;
      });
      setFormData(resetData);
    }
    setError(null);
    setSuccess(null);
  };

  const renderGeneralSettings = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>General Settings</h3>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Site Name</label>
        <input
          type="text"
          value={formData.siteName || 'SDA Youth Connect'}
          onChange={(e) => handleInputChange('siteName', e.target.value)}
          style={styles.input}
        />
        <p style={styles.helpText}>The name of your platform displayed to users</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Site Description</label>
        <textarea
          value={formData.siteDescription || 'Connecting SDA youth across Kenya'}
          onChange={(e) => handleInputChange('siteDescription', e.target.value)}
          style={styles.textarea}
          rows="3"
        />
        <p style={styles.helpText}>Brief description for SEO and meta tags</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Contact Email</label>
        <input
          type="email"
          value={formData.contactEmail || 'support@sdaconnect.com'}
          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          style={styles.input}
        />
        <p style={styles.helpText}>Email address for support inquiries</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.maintenanceMode || false}
            onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
          />
          <span>Maintenance Mode</span>
        </label>
        <p style={styles.helpText}>When enabled, only admins can access the site</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Maintenance Message</label>
        <textarea
          value={formData.maintenanceMessage || 'Site is under maintenance. Please check back later.'}
          onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
          style={styles.textarea}
          rows="2"
          disabled={!formData.maintenanceMode}
        />
        <p style={styles.helpText}>Message shown to users during maintenance</p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Security Settings</h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Session Timeout (minutes)</label>
        <input
          type="number"
          value={formData.sessionTimeout || 30}
          onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
          style={styles.input}
          min="5"
          max="1440"
        />
        <p style={styles.helpText}>Automatically log out inactive users after this many minutes</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Max Login Attempts</label>
        <input
          type="number"
          value={formData.maxLoginAttempts || 5}
          onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
          style={styles.input}
          min="3"
          max="20"
        />
        <p style={styles.helpText}>Number of failed attempts before temporary lockout</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Lockout Duration (minutes)</label>
        <input
          type="number"
          value={formData.lockoutDuration || 15}
          onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
          style={styles.input}
          min="5"
          max="120"
        />
        <p style={styles.helpText}>How long to lock out users after max failed attempts</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.twoFactorAuth || false}
            onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
          />
          <span>Require Two-Factor Authentication for Admins</span>
        </label>
        <p style={styles.helpText}>Admins must set up 2FA to access the dashboard</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.httpsOnly || true}
            onChange={(e) => handleInputChange('httpsOnly', e.target.checked)}
          />
          <span>HTTPS Only</span>
        </label>
        <p style={styles.helpText}>Redirect all HTTP traffic to HTTPS</p>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Email Settings</h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>SMTP Host</label>
        <input
          type="text"
          value={formData.smtpHost || 'smtp.gmail.com'}
          onChange={(e) => handleInputChange('smtpHost', e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>SMTP Port</label>
        <input
          type="number"
          value={formData.smtpPort || 587}
          onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
          style={styles.input}
          min="1"
          max="65535"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>SMTP Username</label>
        <input
          type="text"
          value={formData.smtpUsername || ''}
          onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>SMTP Password</label>
        <input
          type="password"
          value={formData.smtpPassword || ''}
          onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>From Email</label>
        <input
          type="email"
          value={formData.fromEmail || 'noreply@sdaconnect.com'}
          onChange={(e) => handleInputChange('fromEmail', e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>From Name</label>
        <input
          type="text"
          value={formData.fromName || 'SDA Youth Connect'}
          onChange={(e) => handleInputChange('fromName', e.target.value)}
          style={styles.input}
        />
      </div>

      <button style={styles.testButton} onClick={() => alert('Test email sent!')}>
        Send Test Email
      </button>
    </div>
  );

  const renderModerationSettings = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Moderation Settings</h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Auto-moderation Level</label>
        <select
          value={formData.autoModLevel || 'moderate'}
          onChange={(e) => handleInputChange('autoModLevel', e.target.value)}
          style={styles.select}
        >
          <option value="strict">Strict - Flag all potential issues</option>
          <option value="moderate">Moderate - Balance safety and freedom</option>
          <option value="lenient">Lenient - Only flag severe violations</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Report Threshold for Auto-action</label>
        <input
          type="number"
          value={formData.reportThreshold || 5}
          onChange={(e) => handleInputChange('reportThreshold', parseInt(e.target.value))}
          style={styles.input}
          min="1"
          max="20"
        />
        <p style={styles.helpText}>Number of reports before auto-flagging content</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Flagged Words</label>
        <textarea
          value={formData.flaggedWords || ''}
          onChange={(e) => handleInputChange('flaggedWords', e.target.value)}
          style={styles.textarea}
          rows="4"
          placeholder="Enter words separated by commas"
        />
        <p style={styles.helpText}>Words that will automatically flag content for review</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.autoRemoveSpam || false}
            onChange={(e) => handleInputChange('autoRemoveSpam', e.target.checked)}
          />
          <span>Auto-remove spam content</span>
        </label>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.notifyModerators || true}
            onChange={(e) => handleInputChange('notifyModerators', e.target.checked)}
          />
          <span>Notify moderators of new reports</span>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ System Settings</h2>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            ...styles.tab,
            ...(activeTab === 'general' ? styles.activeTab : {}),
          }}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            ...styles.tab,
            ...(activeTab === 'security' ? styles.activeTab : {}),
          }}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('email')}
          style={{
            ...styles.tab,
            ...(activeTab === 'email' ? styles.activeTab : {}),
          }}
        >
          Email
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          style={{
            ...styles.tab,
            ...(activeTab === 'moderation' ? styles.activeTab : {}),
          }}
        >
          Moderation
        </button>
        <button
          onClick={() => setActiveTab('features')}
          style={{
            ...styles.tab,
            ...(activeTab === 'features' ? styles.activeTab : {}),
          }}
        >
          Features
        </button>
        <button
          onClick={() => setActiveTab('emailTemplates')}
          style={{
            ...styles.tab,
            ...(activeTab === 'emailTemplates' ? styles.activeTab : {}),
          }}
        >
          Email Templates
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'email' && renderEmailSettings()}
        {activeTab === 'moderation' && renderModerationSettings()}
        {activeTab === 'features' && <FeatureFlags />}
        {activeTab === 'emailTemplates' && <EmailTemplates />}
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={styles.success}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}
        <div style={styles.buttonGroup}>
          <button onClick={handleReset} style={styles.resetButton}>
            Reset Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.saveButton,
              ...(saving ? styles.saveButtonDisabled : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: '#666',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 30px 0',
    color: '#333',
    fontSize: '28px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  activeTab: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  tabContent: {
    minHeight: '400px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
    },
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
    },
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
    },
  },
  helpText: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
  },
  testButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  actions: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#219a52',
    },
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default SettingsPanel;