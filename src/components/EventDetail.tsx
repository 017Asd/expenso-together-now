
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Users, Calculator } from 'lucide-react';
import { GroupEvent, GroupExpense, Settlement } from '@/types/expense';
import AddGroupExpenseModal from './AddGroupExpenseModal';
import GroupExpenseList from './GroupExpenseList';
import SettlementView from './SettlementView';

interface EventDetailProps {
  event: GroupEvent;
  onUpdate: (event: GroupEvent) => void;
  onBack: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onUpdate, onBack }) => {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);

  const addExpense = (expense: Omit<GroupExpense, 'id'>) => {
    const newExpense: GroupExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    const updatedEvent = {
      ...event,
      expenses: [newExpense, ...event.expenses]
    };
    
    onUpdate(updatedEvent);
  };

  const deleteExpense = (id: string) => {
    const updatedEvent = {
      ...event,
      expenses: event.expenses.filter(expense => expense.id !== id)
    };
    
    onUpdate(updatedEvent);
  };

  const calculateSettlements = (): Settlement[] => {
    // Calculate how much each person paid and owes
    const memberBalances: Record<string, number> = {};
    
    // Initialize balances
    event.members.forEach(member => {
      memberBalances[member.id] = 0;
    });

    // Calculate what each person paid
    event.expenses.forEach(expense => {
      memberBalances[expense.paidBy] += expense.amount;
    });

    // Calculate what each person owes
    event.expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      expense.splitBetween.forEach(memberId => {
        memberBalances[memberId] -= sharePerPerson;
      });
    });

    // Generate settlements
    const settlements: Settlement[] = [];
    const memberIds = Object.keys(memberBalances);
    
    for (let i = 0; i < memberIds.length; i++) {
      for (let j = i + 1; j < memberIds.length; j++) {
        const member1 = memberIds[i];
        const member2 = memberIds[j];
        const balance1 = memberBalances[member1];
        const balance2 = memberBalances[member2];
        
        if (balance1 > 0 && balance2 < 0) {
          const amount = Math.min(balance1, Math.abs(balance2));
          if (amount > 0.01) { // Ignore very small amounts
            settlements.push({
              from: member2,
              to: member1,
              amount: amount
            });
            memberBalances[member1] -= amount;
            memberBalances[member2] += amount;
          }
        } else if (balance2 > 0 && balance1 < 0) {
          const amount = Math.min(balance2, Math.abs(balance1));
          if (amount > 0.01) { // Ignore very small amounts
            settlements.push({
              from: member1,
              to: member2,
              amount: amount
            });
            memberBalances[member2] -= amount;
            memberBalances[member1] += amount;
          }
        }
      }
    }
    
    return settlements;
  };

  const totalAmount = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averagePerPerson = event.members.length > 0 ? totalAmount / event.members.length : 0;

  if (showSettlement) {
    return (
      <SettlementView
        event={event}
        settlements={calculateSettlements()}
        onBack={() => setShowSettlement(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{event.name}</h2>
                {event.description && (
                  <p className="text-gray-600">{event.description}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowSettlement(true)} variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Settle Up
              </Button>
              <Button onClick={() => setIsAddExpenseModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{averagePerPerson.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Per Person</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {event.expenses.length}
              </div>
              <div className="text-sm text-gray-500">Total Expenses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({event.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {event.members.map(member => (
              <Badge key={member.id} variant="secondary" className="px-3 py-1">
                {member.name}
                {member.email && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({member.email})
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupExpenseList
            expenses={event.expenses}
            members={event.members}
            onDelete={deleteExpense}
          />
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <AddGroupExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAdd={addExpense}
        members={event.members}
      />
    </div>
  );
};

export default EventDetail;
