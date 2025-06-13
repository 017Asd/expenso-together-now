
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, CreditCard } from 'lucide-react';
import { GroupExpense, Member } from '@/types/expense';

interface GroupExpenseListProps {
  expenses: GroupExpense[];
  members: Member[];
  onDelete: (id: string) => void;
}

const GroupExpenseList: React.FC<GroupExpenseListProps> = ({ expenses, members, onDelete }) => {
  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No expenses added yet. Add your first group expense to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const splitAmount = expense.amount / expense.splitBetween.length;
        
        return (
          <div
            key={expense.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-lg">{expense.description}</h4>
                  <Badge variant="outline">{expense.category}</Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  {expense.multiplePayments ? (
                    <div>
                      <span className="font-medium">Paid by multiple people:</span>
                      <div className="ml-2 mt-1 space-y-1">
                        {expense.multiplePayments.map((payment, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span>{getMemberName(payment.memberId)}</span>
                            <span>₹{payment.amount.toFixed(2)}</span>
                            <Badge variant="secondary" className="text-xs">
                              <CreditCard className="w-3 h-3 mr-1" />
                              {payment.paymentMode}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Paid by:</span> 
                      <span>{getMemberName(expense.paidBy)}</span>
                      <Badge variant="secondary" className="text-xs">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {expense.paymentMode}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Date:</span> {expense.date}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Split between:</span>
                    <Users className="w-3 h-3" />
                    <span>{expense.splitBetween.length} members</span>
                  </div>
                </div>

                {/* Split details */}
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium mb-1">Split Details:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {expense.splitBetween.map(memberId => (
                      <div key={memberId} className="flex justify-between">
                        <span>{getMemberName(memberId)}</span>
                        <span>₹{splitAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary mb-2">
                  ₹{expense.amount.toLocaleString()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupExpenseList;
