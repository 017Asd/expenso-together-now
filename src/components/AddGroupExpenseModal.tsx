
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { GroupExpense, Member } from '@/types/expense';

interface AddGroupExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<GroupExpense, 'id'>) => void;
  members: Member[];
  personalExpenses?: any[];
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

const paymentModes = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Wallet'
];

const AddGroupExpenseModal: React.FC<AddGroupExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  members,
  personalExpenses = []
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: ''
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [multiplePayments, setMultiplePayments] = useState<{
    memberId: string;
    amount: string;
    paymentMode: string;
  }[]>([]);
  const [useMultiplePayments, setUseMultiplePayments] = useState(false);
  const [selectedPersonalExpense, setSelectedPersonalExpense] = useState('');

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

  const addMultiplePayment = () => {
    setMultiplePayments(prev => [...prev, { memberId: '', amount: '', paymentMode: '' }]);
  };

  const removeMultiplePayment = (index: number) => {
    setMultiplePayments(prev => prev.filter((_, i) => i !== index));
  };

  const updateMultiplePayment = (index: number, field: string, value: string) => {
    setMultiplePayments(prev => prev.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    ));
  };

  const handlePersonalExpenseSelect = (expenseId: string) => {
    const expense = personalExpenses.find(e => e.id === expenseId);
    if (expense) {
      setFormData({
        description: expense.description || expense.category,
        amount: expense.amount.toString(),
        paidBy: members[0]?.id || '',
        category: expense.category,
        date: expense.date,
        paymentMode: expense.paymentMode
      });
      setSelectedPersonalExpense(expenseId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.category || selectedMembers.length === 0) {
      return;
    }

    if (useMultiplePayments) {
      const validPayments = multiplePayments.filter(p => p.memberId && p.amount && p.paymentMode);
      const totalMultipleAmount = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      if (validPayments.length === 0 || totalMultipleAmount <= 0) {
        return;
      }

      onAdd({
        description: formData.description,
        amount: totalMultipleAmount,
        paidBy: 'multiple',
        splitBetween: selectedMembers,
        date: formData.date,
        category: formData.category,
        paymentMode: 'multiple',
        multiplePayments: validPayments.map(p => ({
          memberId: p.memberId,
          amount: parseFloat(p.amount),
          paymentMode: p.paymentMode
        }))
      });
    } else {
      if (!formData.amount || !formData.paidBy || !formData.paymentMode) {
        return;
      }

      onAdd({
        description: formData.description,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        splitBetween: selectedMembers,
        date: formData.date,
        category: formData.category,
        paymentMode: formData.paymentMode
      });
    }

    // Reset form
    setFormData({
      description: '',
      amount: '',
      paidBy: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: ''
    });
    setSelectedMembers(members.map(m => m.id));
    setSelectAll(true);
    setMultiplePayments([]);
    setUseMultiplePayments(false);
    setSelectedPersonalExpense('');
    onClose();
  };

  const totalMultipleAmount = multiplePayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const splitAmount = selectedMembers.length > 0 
    ? (useMultiplePayments ? totalMultipleAmount : (parseFloat(formData.amount) || 0)) / selectedMembers.length 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Group Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Import from Personal Expenses */}
          {personalExpenses.length > 0 && (
            <div>
              <Label>Import from Personal Expenses</Label>
              <Select value={selectedPersonalExpense} onValueChange={handlePersonalExpenseSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a personal expense" />
                </SelectTrigger>
                <SelectContent>
                  {personalExpenses.slice(0, 10).map(expense => (
                    <SelectItem key={expense.id} value={expense.id}>
                      {expense.description || expense.category} - ₹{expense.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Multiple Payments Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiple-payments"
              checked={useMultiplePayments}
              onCheckedChange={setUseMultiplePayments}
            />
            <Label htmlFor="multiple-payments">Multiple people paid separately</Label>
          </div>

          {useMultiplePayments ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Payment Details</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMultiplePayment}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Payment
                </Button>
              </div>
              
              {multiplePayments.map((payment, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <Select 
                    value={payment.memberId} 
                    onValueChange={(value) => updateMultiplePayment(index, 'memberId', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e) => updateMultiplePayment(index, 'amount', e.target.value)}
                    className="w-24"
                  />
                  
                  <Select 
                    value={payment.paymentMode} 
                    onValueChange={(value) => updateMultiplePayment(index, 'paymentMode', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMultiplePayment(index)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {totalMultipleAmount > 0 && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Total: ₹{totalMultipleAmount.toFixed(2)}
                </div>
              )}
            </div>
          ) : (
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
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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

          {!useMultiplePayments && (
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={formData.paymentMode} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, paymentMode: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map(mode => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

              {selectedMembers.length > 0 && splitAmount > 0 && (
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
              disabled={!formData.description || !formData.category || selectedMembers.length === 0}
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
