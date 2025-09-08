'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailPreviewProps {
  template?: {
    name: string;
    subject: string;
    html: string;
    text?: string;
  };
  onSend?: (data: { to: string; subject: string; html: string; text?: string }) => void;
}

export function EmailPreview({ template, onSend }: EmailPreviewProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(template?.subject || '');
  const [html, setHtml] = useState(template?.html || '');
  const [text, setText] = useState(template?.text || '');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !html) return;
    
    setIsSending(true);
    try {
      if (onSend) {
        await onSend({ to, subject, html, text });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div>
            <Label htmlFor="html">HTML Content</Label>
            <Textarea
              id="html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={10}
              placeholder="HTML email content"
            />
          </div>
          <div>
            <Label htmlFor="text">Text Content (optional)</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Plain text email content"
            />
          </div>
          <Button 
            onClick={handleSend} 
            disabled={!to || !subject || !html || isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
