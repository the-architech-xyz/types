'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { UserFeedbackHandler, UserFeedback } from '@/lib/sentry/user-feedback';

interface UserFeedbackProps {
  eventId?: string;
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
}

export function UserFeedbackComponent({ eventId, onSuccess, onError }: UserFeedbackProps) {
  const [feedback, setFeedback] = useState<Partial<UserFeedback>>({
    name: '',
    email: '',
    comments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.name || !feedback.email || !feedback.comments) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await UserFeedbackHandler.submitFeedback({
        ...feedback as UserFeedback,
        eventId,
      });

      if (result.success) {
        setIsSuccess(true);
        setFeedback({ name: '', email: '', comments: '' });
        onSuccess?.(result.eventId || '');
      } else {
        setError('Failed to submit feedback. Please try again.');
        onError?.('Failed to submit feedback');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
            <p className="text-muted-foreground">
              We've received your message and will review it shortly.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={feedback.name || ''}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={feedback.email || ''}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="comments">Comments *</Label>
            <Textarea
              id="comments"
              value={feedback.comments || ''}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              placeholder="Tell us what happened or how we can help..."
              rows={4}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
