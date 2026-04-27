// src/hooks/useVerseInteractions.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage verse interactions (likes, bookmarks, comments)
 * Reusable across any component that displays Bible verses
 */
export const useVerseInteractions = (verseId) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all interactions when verseId changes
  useEffect(() => {
    if (verseId) {
      fetchInteractions();
    }
  }, [verseId, user]);

  const fetchInteractions = async () => {
    if (!verseId) {
      console.error('No verse ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch likes count
      const likesResponse = await fetch(`http://localhost:3000/bible/verse/${verseId}/likes`);
      const likesData = await likesResponse.json();
      setLikeCount(likesData.count || 0);

      // Fetch comments
      const commentsResponse = await fetch(`http://localhost:3000/bible/verse/${verseId}/comments`);
      const commentsData = await commentsResponse.json();
      setComments(commentsData.comments || []);

      // Check if user has liked/bookmarked (only if logged in)
      if (user) {
        const userResponse = await fetch(
          `http://localhost:3000/bible/verse/${verseId}/user-interaction`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );
        const userData = await userResponse.json();
        setLiked(userData.liked || false);
        setBookmarked(userData.bookmarked || false);
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError('Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like verses');
      return;
    }

    if (!verseId) return;

    try {
      const response = await fetch(`http://localhost:3000/bible/verse/${verseId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      console.error('Error liking verse:', err);
      alert('Failed to like verse. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please login to bookmark verses');
      return;
    }

    if (!verseId) return;

    try {
      const response = await fetch(`http://localhost:3000/bible/verse/${verseId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBookmarked(!bookmarked);
      }
    } catch (err) {
      console.error('Error bookmarking verse:', err);
      alert('Failed to bookmark verse. Please try again.');
    }
  };

  const handleAddComment = async (commentContent) => {
    if (!user) {
      alert('Please login to comment');
      return false;
    }

    if (!commentContent.trim()) {
      return false;
    }

    if (!verseId) return false;

    try {
      const response = await fetch(`http://localhost:3000/bible/verse/${verseId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentContent })
      });
      const data = await response.json();
      
      if (data.success) {
        setComments([data.comment, ...comments]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to post comment. Please try again.');
      return false;
    }
  };

  return {
    // State
    liked,
    bookmarked,
    likeCount,
    comments,
    loading,
    error,
    
    // Actions
    handleLike,
    handleBookmark,
    handleAddComment,
    refreshInteractions: fetchInteractions,
  };
};