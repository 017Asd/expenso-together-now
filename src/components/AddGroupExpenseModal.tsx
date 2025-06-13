
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GroupExpense, Member } from '@/types/expense';

interface AddGroupExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<GroupExpense, 'id'>) => void;
  members: Member[];
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Travel',
  'Activities',
  'Other'
];

const AddGroupExpenseModal: React.FC<AddGroupExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  members 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Initialize with all members selected
  React.useEffect(() => {
    if (isOpen && members.length > 0) {
      setSelectedMembers(members.map(m => m.id));
      setSelectAll(true);
    }
  }, [isOpen, members]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const updated = prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      setSelectAll(updated.length === members.length);
      return updated;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedMembers(checked ? members.map(m => m.id) : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.paidBy || 
        !formData.category || selectedMembers.length === 0) {
      return;
    }

    onAdd({
      description: formData.description,
      amount: parseFloat(formData.amount),
      paidBy: formData.paidBy,
      splitBetween: selectedMembers,
      date: formData.date,
      category: formData.category
    });

    // Reset form
    setFormData({
      description: '',
      amount: '',
      paidBy: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedMembers(members.map(m => m.id));
    setSelectAll(true);
    onClose();
  };

  const splitAmount = selectedMembers.length > 0 
    ? (parseFloat(formData.amount) || 0) / selectedMembers.length 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Group Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Dinner at restaurant"
              required
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paidBy">Paid By</Label>
              <Select value={formData.paidBy} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, paidBy: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Split Between</Label>
            <div className="space-y-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All Members
                </Label>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {members.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Label htmlFor={member.id} className="flex-1">
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedMembers.length > 0 && formData.amount && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Split: ₹{splitAmount.toFixed(2)} per person ({selectedMembers.length} members)
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.description || !formData.amount || !formData.paidBy || 
                       !formData.category || selectedMembers.length === 0}
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupExpenseModal;
