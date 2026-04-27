// src/services/bibleService.js
import { API } from './api';

export const bibleService = {
  // Get a specific verse
  getVerse: (reference, translation = 'kjv') => 
    API.get(`/bible/verse?reference=${encodeURIComponent(reference)}&translation=${translation}`),

  // Get a random verse
  getRandomVerse: (translation = 'kjv') => 
    API.get(`/bible/random?translation=${translation}`),

  // Get a chapter
  getChapter: (book, chapter, translation = 'kjv') => 
    API.get(`/bible/chapter?book=${book}&chapter=${chapter}&translation=${translation}`),

  // Get available translations
  getTranslations: () => 
    API.get('/bible/translations'),

  // Get today's verse
  getTodaysVerse: () => 
    API.get('/bible/today'),

  // Get queue status
  getQueueStatus: () => 
    API.get('/bible/queue'),

  // Share a verse (requires login)
  shareVerse: (verseId, comment = '') => 
    API.post('/bible/share', { verseId, comment }),

  // Get user's submissions (requires login)
  getMySubmissions: () => 
    API.get('/bible/my-submissions'),

  // ============ NEW METHODS FOR ENHANCED SUBMISSIONS ============

  // Get detailed submission by ID
  getSubmissionDetails: (id) => 
    API.get(`/bible/my-submissions/${id}`),

  // Cancel a pending submission (delete)
  cancelSubmission: (id) => 
    API.post(`/bible/my-submissions/${id}/cancel`),

  // Get queue statistics for current user
  getMyQueueStats: () => 
    API.get('/bible/my-submissions/queue/stats'),
};