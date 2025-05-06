import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const FeedbackForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a placeholder - in a real app, this would send to a backend
    console.log('Feedback submitted:', { name, email, message });
    
    // Show success message
    toast({
      title: t('feedback_success_title'),
      description: t('feedback_success_description'),
    });
    
    // Reset form and close dialog
    setName('');
    setEmail('');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        {t('feedback')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('feedback_title')}</DialogTitle>
            <DialogDescription>
              {t('feedback_description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t('name')}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('name_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                {t('message')}
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('message_placeholder')}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">
                {t('submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackForm; 