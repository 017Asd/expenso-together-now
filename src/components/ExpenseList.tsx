
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Expense } from '@/types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet. Add your first transaction to get started!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              expense.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {expense.type === 'income' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <div className="font-medium">{expense.description || expense.category}</div>
              <div className="text-sm text-gray-500">
                {expense.category} • {expense.paymentMode} • {expense.date}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`font-semibold ${
                expense.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
              </div>
              <Badge variant={expense.type === 'income' ? 'default' : 'secondary'}>
                {expense.type}
              </Badge>
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
      ))}
    </div>
  );
};

export default ExpenseList;
