import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useBudget } from '@/contexts/BudgetContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import Spinner from './ui/Spinner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onOpenChange }) => {
  const { currentAccount, accounts, updateAccount } = useBudget() as any;
  const [name, setName] = useState(currentAccount?.name || '');
  const [email, setEmail] = useState(currentAccount?.email || '');
  const [profileImage, setProfileImage] = useState(currentAccount?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentAccount) return;
    setLoading(true);
    await updateAccount({
      ...currentAccount,
      name,
      email,
      profileImage,
    });
    setLoading(false);
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (open && currentAccount) {
      setName(currentAccount.name || '');
      setEmail(currentAccount.email || '');
      setProfileImage(currentAccount.profileImage || '');
    }
  }, [open, currentAccount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Profile</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="h-20 w-20 bg-primary">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback>{currentAccount?.initials || 'MK'}</AvatarFallback>
              )}
            </Avatar>
            <Button
              type="button"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="w-full">
            <label htmlFor="profile-name" className="block text-sm font-medium mb-1">Name</label>
            <Input
              id="profile-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="mt-2"
            />
          </div>
          <div className="w-full">
            <label htmlFor="profile-email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="profile-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              className="mt-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? <Spinner size={20} /> : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog; 