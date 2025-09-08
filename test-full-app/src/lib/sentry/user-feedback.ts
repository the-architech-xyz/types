import { SentryClient } from './client';

export interface UserFeedback {
  name: string;
  email: string;
  comments: string;
  eventId?: string;
}

export class UserFeedbackHandler {
  /**
   * Submit user feedback
   */
  static async submitFeedback(feedback: UserFeedback): Promise<{ success: boolean; eventId?: string }> {
    try {
      // Add breadcrumb for user feedback
      SentryClient.addBreadcrumb({
        message: 'User feedback submitted',
        category: 'user-feedback',
        level: 'info',
        data: {
          name: feedback.name,
          email: feedback.email,
          hasComments: !!feedback.comments,
        },
      });

      // Set user context
      SentryClient.setUser({
        email: feedback.email,
        username: feedback.name,
      });

      // Capture message with feedback
      const eventId = SentryClient.captureMessage('User Feedback', 'info');

      // Log feedback to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('User Feedback:', {
          ...feedback,
          eventId,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error('Failed to submit user feedback:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Submit error feedback
   */
  static async submitErrorFeedback(
    error: Error,
    feedback: Omit<UserFeedback, 'eventId'>
  ): Promise<{ success: boolean; eventId?: string }> {
    try {
      // Add breadcrumb for error feedback
      SentryClient.addBreadcrumb({
        message: 'Error feedback submitted',
        category: 'error-feedback',
        level: 'info',
        data: {
          name: feedback.name,
          email: feedback.email,
          errorMessage: error.message,
        },
      });

      // Set user context
      SentryClient.setUser({
        email: feedback.email,
        username: feedback.name,
      });

      // Capture exception with user feedback
      SentryClient.captureException(error, {
        userFeedback: {
          name: feedback.name,
          email: feedback.email,
          comments: feedback.comments,
        },
      });

      return {
        success: true,
      };
    } catch (err) {
      console.error('Failed to submit error feedback:', err);
      return {
        success: false,
      };
    }
  }

  /**
   * Get feedback form data
   */
  static getFeedbackFormData(): Partial<UserFeedback> {
    return {
      name: '',
      email: '',
      comments: '',
    };
  }
}
