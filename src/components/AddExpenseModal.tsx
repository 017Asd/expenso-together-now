
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Expense } from '@/types/expense';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

const predefinedCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bills & Utilities',
  'Travel',
  'Salary',
  'Investment'
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: ''
  });

  const [isForSplit, setIsForSplit] = useState(false);
  const [splitPeople, setSplitPeople] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !getSelectedCategory() || !formData.paymentMode) {
      return;
    }

    const expense = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: getSelectedCategory(),
      description: formData.description,
      date: formData.date,
      paymentMode: formData.paymentMode,
      // Add split information if applicable
      ...(isForSplit && splitPeople && {
        splitInfo: {
          totalPeople: parseInt(splitPeople),
          amountPerPerson: parseFloat(formData.amount) / parseInt(splitPeople)
        }
      })
    };

    onAdd(expense);
    resetForm();
    onClose();
  };

  const getSelectedCategory = () => {
    return isCustomCategory ? customCategory : formData.category;
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: ''
    });
    setIsForSplit(false);
    setSplitPeople('');
    setIsCustomCategory(false);
    setCustomCategory('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <div className="space-y-2">
              <Select 
                value={isCustomCategory ? 'custom' : formData.category} 
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setIsCustomCategory(true);
                    setFormData(prev => ({ ...prev, category: '' }));
                  } else {
                    setIsCustomCategory(false);
                    setCustomCategory('');
                    setFormData(prev => ({ ...prev, category: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
              
              {isCustomCategory && (
                <Input
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={formData.paymentMode} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, paymentMode: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === 'expense' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for-split"
                  checked={isForSplit}
                  onCheckedChange={(checked) => setIsForSplit(checked === true)}
                />
                <Label htmlFor="for-split">This expense is for splitting</Label>
              </div>
              
              {isForSplit && (
                <div>
                  <Label htmlFor="split-people">Number of people to split between</Label>
                  <Input
                    id="split-people"
                    type="number"
                    min="2"
                    max="20"
                    value={splitPeople}
                    onChange={(e) => setSplitPeople(e.target.value)}
                    placeholder="Enter number of people"
                    required={isForSplit}
                  />
                  {splitPeople && formData.amount && (
                    <p className="text-sm text-gray-600 mt-1">
                      Amount per person: ₹{(parseFloat(formData.amount) / parseInt(splitPeople)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
