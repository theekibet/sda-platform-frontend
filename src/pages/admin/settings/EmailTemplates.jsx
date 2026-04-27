// src/pages/admin/settings/EmailTemplates.jsx
import React, { useState, useEffect } from 'react';
import { getEmailTemplates, updateEmailTemplate, sendTestEmail } from '../../../services/api';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEmailTemplates();
      setTemplates(response.data || []);
      
      // Select first template by default
      if (response.data && response.data.length > 0) {
        handleSelectTemplate(response.data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load email templates');
      console.error('Error fetching email templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject || '');
    setEditedContent(template.content || '');
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateEmailTemplate(selectedTemplate.name, {
        subject: editedSubject,
        content: editedContent,
      });
      
      // Update local state
      setTemplates(prev => 
        prev.map(t => 
          t.name === selectedTemplate.name 
            ? { ...t, subject: editedSubject, content: editedContent }
            : t
        )
      );
      
      setSuccess('Template saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) return;
    
    setSending(true);
    setError(null);
    
    try {
      await sendTestEmail(selectedTemplate.name, testEmail);
      setShowTestModal(false);
      setTestEmail('');
      alert('Test email sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const insertVariable = (variable) => {
    setEditedContent(prev => prev + ` {{${variable}}}`);
  };

  const getTemplateDescription = (name) => {
    const descriptions = {
      'welcome': 'Sent to new users after registration',
      'password-reset': 'Sent when users request a password reset',
      'report-confirmation': 'Confirmation when a user submits a report',
      'moderation-action': 'Notification when moderation action is taken',
      'suspension-notice': 'Notice when a user is suspended',
      'announcement': 'Broadcast announcements to users',
    };
    
    return descriptions[name] || 'Email template';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading email templates...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📧 Email Templates</h3>
      <p style={styles.description}>
        Customize the emails sent to users. Use variables like {'{{name}}'}, {'{{email}}'}, etc.
      </p>

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

      <div style={styles.templateSelector}>
        <label style={styles.label}>Select Template:</label>
        <select
          value={selectedTemplate?.name || ''}
          onChange={(e) => {
            const template = templates.find(t => t.name === e.target.value);
            if (template) handleSelectTemplate(template);
          }}
          style={styles.select}
        >
          {templates.map(template => (
            <option key={template.name} value={template.name}>
              {template.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div style={styles.editor}>
          <div style={styles.templateInfo}>
            <p style={styles.templateDescription}>
              {getTemplateDescription(selectedTemplate.name)}
            </p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Subject</label>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              style={styles.input}
              placeholder="Email subject line"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Content (HTML supported)</label>
            <div style={styles.variableBar}>
              <span style={styles.variableLabel}>Insert variable:</span>
              {['name', 'email', 'siteName', 'year'].map(varName => (
                <button
                  key={varName}
                  onClick={() => insertVariable(varName)}
                  style={styles.variableButton}
                >
                  {'{{'}{varName}{'}}'}
                </button>
              ))}
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={styles.textarea}
              rows="12"
            />
          </div>

          <div style={styles.preview}>
            <h4 style={styles.previewTitle}>Preview</h4>
            <div style={styles.previewBox}>
              <strong>Subject:</strong> {editedSubject}
              <hr style={styles.previewDivider} />
              <div dangerouslySetInnerHTML={{ __html: editedContent }} />
            </div>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => setShowTestModal(true)}
              style={styles.testButton}
            >
              Send Test Email
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(saving ? styles.saveButtonDisabled : {}),
              }}
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTestModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Send Test Email</h3>
            <p style={styles.modalText}>
              Enter an email address to receive a test of the "{selectedTemplate?.name}" template.
            </p>
            
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              style={styles.modalInput}
              autoFocus
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowTestModal(false)}
                style={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={!testEmail || sending}
                style={{
                  ...styles.modalSendButton,
                  ...((!testEmail || sending) ? styles.modalButtonDisabled : {}),
                }}
              >
                {sending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px 0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#666',
  },
  loadingSpinner: {
    width: '30px',
    height: '30px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '20px',
  },
  description: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '14px',
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
  templateSelector: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
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
  editor: {
    marginTop: '20px',
  },
  templateInfo: {
    marginBottom: '20px',
  },
  templateDescription: {
    margin: 0,
    padding: '10px',
    backgroundColor: '#f0f4ff',
    borderRadius: '5px',
    fontSize: '14px',
    color: '#667eea',
  },
  formGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
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
    fontFamily: 'monospace',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
    },
  },
  variableBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px',
    flexWrap: 'wrap',
  },
  variableLabel: {
    fontSize: '13px',
    color: '#666',
    marginRight: '5px',
  },
  variableButton: {
    padding: '4px 8px',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '3px',
    fontSize: '12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#d0d0d0',
    },
  },
  preview: {
    marginBottom: '20px',
  },
  previewTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#333',
  },
  previewBox: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  previewDivider: {
    margin: '10px 0',
    border: 'none',
    borderTop: '1px solid #e0e0e0',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  testButton: {
    padding: '10px 20px',
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
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#219a52',
    },
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '400px',
    width: '90%',
  },
  modalTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px',
  },
  modalText: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    marginBottom: '20px',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
    },
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalSendButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

export default EmailTemplates;