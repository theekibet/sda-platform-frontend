// src/pages/admin/maintenance/BackupManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  createDatabaseBackup, 
  getBackupList, 
  downloadBackup, 
  restoreBackup, 
  deleteBackup 
} from '../../../services/api';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBackupList();
      setBackups(response.data.backups || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backups');
      console.error('Error fetching backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await createDatabaseBackup({
        type: 'manual',
        filename: `backup-${new Date().toISOString().split('T')[0]}`,
      });
      
      setSuccess('Backup created successfully!');
      fetchBackups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId, filename) => {
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
      
      setSuccess(`Backup ${filename} downloaded`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download backup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await restoreBackup(backupId);
      setSuccess('Database restored successfully!');
      setRestoreConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore backup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await deleteBackup(backupId);
      setSuccess('Backup deleted successfully');
      setDeleteConfirm(null);
      fetchBackups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete backup');
    } finally {
      setActionLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getBackupTypeIcon = (type) => {
    switch (type) {
      case 'manual': return '👤';
      case 'scheduled': return '⏰';
      case 'pre-update': return '🔄';
      default: return '📦';
    }
  };

  if (loading && backups.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading backups...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>💾 Database Backups</h3>
        <button
          onClick={handleCreateBackup}
          disabled={creating || actionLoading}
          style={{
            ...styles.createButton,
            ...((creating || actionLoading) ? styles.buttonDisabled : {}),
          }}
        >
          {creating ? 'Creating...' : '+ Create Backup'}
        </button>
      </div>

      <p style={styles.description}>
        Create and manage database backups. Regularly backing up your data is essential for disaster recovery.
      </p>

      {/* Messages */}
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

      {/* Backup Stats */}
      {backups.length > 0 && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{backups.length}</span>
            <span style={styles.statLabel}>Total Backups</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>
              {formatBytes(backups.reduce((acc, b) => acc + (b.size || 0), 0))}
            </span>
            <span style={styles.statLabel}>Total Size</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>
              {backups.filter(b => b.type === 'manual').length}
            </span>
            <span style={styles.statLabel}>Manual</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>
              {new Date(backups[0]?.createdAt).toLocaleDateString()}
            </span>
            <span style={styles.statLabel}>Latest Backup</span>
          </div>
        </div>
      )}

      {/* Backups List */}
      {backups.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h4 style={styles.emptyTitle}>No Backups Found</h4>
          <p style={styles.emptyText}>
            Create your first database backup to protect your data.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            style={styles.emptyButton}
          >
            {creating ? 'Creating...' : 'Create First Backup'}
          </button>
        </div>
      ) : (
        <div style={styles.backupList}>
          {backups.map(backup => (
            <div key={backup.id} style={styles.backupCard}>
              <div style={styles.backupHeader}>
                <div style={styles.backupType}>
                  <span style={styles.typeIcon}>{getBackupTypeIcon(backup.type)}</span>
                  <span style={styles.typeLabel}>
                    {backup.type?.charAt(0).toUpperCase() + backup.type?.slice(1)}
                  </span>
                </div>
                <div style={styles.backupActions}>
                  <button
                    onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                    disabled={actionLoading}
                    style={styles.downloadButton}
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => setRestoreConfirm(backup.id)}
                    disabled={actionLoading}
                    style={styles.restoreButton}
                    title="Restore"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(backup.id)}
                    disabled={actionLoading}
                    style={styles.deleteButton}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={styles.backupInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Filename:</span>
                  <code style={styles.filename}>{backup.filename}</code>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Size:</span>
                  <span>{formatBytes(backup.size)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Created:</span>
                  <span>{formatDate(backup.createdAt)}</span>
                </div>
              </div>

              {/* Restore Confirmation */}
              {restoreConfirm === backup.id && (
                <div style={styles.confirmOverlay}>
                  <p style={styles.confirmText}>
                    ⚠️ Restoring will replace your current database. This action cannot be undone.
                  </p>
                  <div style={styles.confirmActions}>
                    <button
                      onClick={() => setRestoreConfirm(null)}
                      style={styles.confirmCancel}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={actionLoading}
                      style={styles.confirmRestore}
                    >
                      {actionLoading ? 'Restoring...' : 'Yes, Restore'}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === backup.id && (
                <div style={styles.confirmOverlay}>
                  <p style={styles.confirmText}>
                    ⚠️ Are you sure you want to delete this backup?
                  </p>
                  <div style={styles.confirmActions}>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={styles.confirmCancel}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      disabled={actionLoading}
                      style={styles.confirmDelete}
                    >
                      {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div style={styles.tips}>
        <h4 style={styles.tipsTitle}>💡 Backup Tips</h4>
        <ul style={styles.tipsList}>
          <li>Create backups before making major changes to your platform</li>
          <li>Regular scheduled backups help prevent data loss</li>
          <li>Download important backups for off-site storage</li>
          <li>Test your backups by occasionally restoring to a test environment</li>
        </ul>
      </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
  },
  createButton: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#219a52',
    },
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  emptyTitle: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '16px',
  },
  emptyText: {
    margin: '0 0 20px 0',
    color: '#999',
    fontSize: '14px',
  },
  emptyButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  backupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '25px',
  },
  backupCard: {
    position: 'relative',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  backupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  backupType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  typeIcon: {
    fontSize: '20px',
  },
  typeLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    textTransform: 'capitalize',
  },
  backupActions: {
    display: 'flex',
    gap: '8px',
  },
  downloadButton: {
    padding: '6px 10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  restoreButton: {
    padding: '6px 10px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e67e22',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#c0392b',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  backupInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
  },
  infoLabel: {
    width: '70px',
    color: '#999',
  },
  filename: {
    padding: '2px 4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  confirmOverlay: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#fff3cd',
    borderRadius: '5px',
    border: '1px solid #ffeeba',
  },
  confirmText: {
    margin: '0 0 15px 0',
    color: '#856404',
    fontSize: '14px',
  },
  confirmActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  confirmCancel: {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  confirmRestore: {
    padding: '6px 12px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  confirmDelete: {
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  tips: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#e8f4fd',
    borderRadius: '8px',
  },
  tipsTitle: {
    margin: '0 0 15px 0',
    color: '#0c5460',
    fontSize: '16px',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#0c5460',
    fontSize: '14px',
    lineHeight: '1.8',
  },
};

export default BackupManager;