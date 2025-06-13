
import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types/expense';
import EditExpenseModal from './EditExpenseModal';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (updatedExpense: Expense) => {
    if (onEdit) {
      onEdit(updatedExpense);
    }
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found. Add your first transaction to get started!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{expense.description || expense.category}</span>
                <Badge variant={expense.type === 'income' ? 'default' : 'secondary'}>
                  {expense.type}
                </Badge>
                <Badge variant="outline">{expense.paymentMode}</Badge>
                {(expense as any).splitInfo && (
                  <Badge variant="outline" className="text-xs">
                    Split: {(expense as any).splitInfo.totalPeople} people
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {expense.category} • {new Date(expense.date).toLocaleDateString()}
              </div>
              {(expense as any).splitInfo && (
                <div className="text-xs text-blue-600 mt-1">
                  ₹{(expense as any).splitInfo.amountPerPerson.toFixed(2)} per person
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
              </span>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(expense)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(expense.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onEdit={handleEditSubmit}
        expense={editingExpense}
      />
    </>
  );
};

export default ExpenseList;
