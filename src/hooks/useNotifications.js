import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch applicant feedback
      const { data: applicantFeedback, error: applicantError } = await supabase
        .from("applicant_feedback")
        .select("*")
        .order("submitted_at", { ascending: false });

      // Fetch market intel feedback
      const { data: marketIntelFeedback, error: marketIntelError } = await supabase
        .from("market_intel_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch offer feedback
      const { data: offerFeedback, error: offerError } = await supabase
        .from("offer_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (applicantError) throw applicantError;
      if (marketIntelError) throw marketIntelError;
      if (offerError) throw offerError;

      // Transform and combine all notifications
      const allNotifications = [
        ...(applicantFeedback || []).map(feedback => ({
          id: feedback.id,
          type: 'applicant',
          title: 'New Applicant Feedback',
          message: feedback.feedback,
          rating: feedback.overall_rating,
          timestamp: feedback.submitted_at,
          metadata: {
            name: feedback.name,
            email: feedback.email,
            jobType: feedback.job_type,
            referenceNumber: feedback.reference_number,
            emoji: feedback.emoji_reaction
          }
        })),
        ...(marketIntelFeedback || []).map(feedback => ({
          id: feedback.id,
          type: 'market_intel',
          title: 'New Market Intel Feedback',
          message: feedback.comment,
          rating: feedback.rating,
          timestamp: feedback.created_at,
          metadata: {
            marketIntelId: feedback.market_intel_id,
            userId: feedback.user_id
          }
        })),
        ...(offerFeedback || []).map(feedback => ({
          id: feedback.id,
          type: 'offer',
          title: 'New Offer Feedback',
          message: feedback.comment,
          rating: feedback.rating,
          timestamp: feedback.created_at,
          metadata: {
            offerId: feedback.offer_id,
            userId: feedback.user_id
          }
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.length);
    } catch (error) {
      console.error("[useNotifications] Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const applicantSubscription = supabase
      .channel('applicant_feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applicant_feedback' }, () => {
        fetchNotifications();
      })
      .subscribe();

    const marketIntelSubscription = supabase
      .channel('market_intel_feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_intel_feedback' }, () => {
        fetchNotifications();
      })
      .subscribe();

    const offerSubscription = supabase
      .channel('offer_feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offer_feedback' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      applicantSubscription.unsubscribe();
      marketIntelSubscription.unsubscribe();
      offerSubscription.unsubscribe();
    };
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};

export default useNotifications; 