
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { GroupEvent, Member } from '@/types/expense';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Omit<GroupEvent, 'id' | 'expenses' | 'createdAt'>) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const addMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined
    };
    
    setMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || members.length === 0) {
      return;
    }

    onCreate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      members
    });

    // Reset form
    setFormData({ name: '', description: '' });
    setMembers([]);
    setNewMemberName('');
    setNewMemberEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Goa Trip 2025"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the event..."
              rows={2}
            />
          </div>

          <div>
            <Label>Members</Label>
            <div className="space-y-3">
              {/* Add Member Form */}
              <div className="flex space-x-2">
                <Input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member name"
                  className="flex-1"
                />
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Email (optional)"
                  type="email"
                  className="flex-1"
                />
                <Button type="button" onClick={addMember} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Members List */}
              {members.length > 0 && (
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        {member.email && (
                          <div className="text-xs text-gray-500">{member.email}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {members.length === 0 && (
                <div className="text-sm text-gray-500 py-2">
                  Add at least one member to create the event
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || members.length === 0}>
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
