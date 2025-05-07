import { toast } from '@/components/ui/use-toast';
import { useForm, ValidationError } from '@formspree/react';

interface Feedback {
  id: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

const FEEDBACK_STORAGE_KEY = 'budget-wise-pending-feedback';
const FORMSPREE_FORM_ID = 'mkgrbnaq';

export const useFeedbackForm = () => {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  const submitFeedback = async (message: string): Promise<void> => {
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Store feedback locally
    const pendingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    pendingFeedback.push(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(pendingFeedback));

    // Try to send immediately if online
    if (navigator.onLine) {
      try {
        const formData = new FormData();
        formData.append('message', feedback.message);
        formData.append('timestamp', feedback.timestamp);
        
        await handleSubmit(formData);
        
        // Update status in local storage
        const updatedFeedback = pendingFeedback.map((f: Feedback) => 
          f.id === feedback.id ? { ...f, status: 'sent' } : f
        );
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
      } catch (error) {
        console.error('Failed to send feedback:', error);
        // Keep as pending for retry
      }
    }
  };

  // Process pending feedback when coming back online
  const processPendingFeedback = async (): Promise<void> => {
    if (!navigator.onLine) return;

    const pendingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    const pendingItems = pendingFeedback.filter((f: Feedback) => f.status === 'pending');

    for (const feedback of pendingItems) {
      try {
        const formData = new FormData();
        formData.append('message', feedback.message);
        formData.append('timestamp', feedback.timestamp);
        
        await handleSubmit(formData);
        
        // Update status in local storage
        const updatedFeedback = pendingFeedback.map((f: Feedback) => 
          f.id === feedback.id ? { ...f, status: 'sent' } : f
        );
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
      } catch (error) {
        console.error('Failed to send pending feedback:', error);
        // Keep as pending for next retry
      }
    }
  };

  // Initialize online/offline handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('online', processPendingFeedback);
  }

  return {
    submitFeedback,
    state,
    ValidationError
  };
}; 