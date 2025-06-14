
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Share2, CheckCircle } from 'lucide-react';
import { GroupEvent, Settlement } from '@/types/expense';

interface SettlementViewProps {
  event: GroupEvent;
  settlements: Settlement[];
  onBack: () => void;
  onClearSettlements?: () => void;
}

const SettlementView: React.FC<SettlementViewProps> = ({ 
  event, 
  settlements, 
  onBack, 
  onClearSettlements 
}) => {
  const [isSettlementCleared, setIsSettlementCleared] = useState(false);

  const getMemberName = (memberId: string) => {
    return event.members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const generateShareableLink = () => {
    const settlementText = settlements
      .map(s => `${getMemberName(s.from)} owes ${getMemberName(s.to)} ₹${s.amount.toFixed(2)}`)
      .join('\n');
    
    const message = `💰 ${event.name} - Settlement Summary\n\n${settlementText}\n\nTotal: ₹${event.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${event.name} - Settlement`,
        text: message
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Settlement details copied to clipboard!');
    }
  };

  const handleClearSettlements = () => {
    if (onClearSettlements) {
      onClearSettlements();
      setIsSettlementCleared(true);
    }
  };

  const calculateMemberSummary = () => {
    const summary: Record<string, { paid: number; owes: number; balance: number }> = {};
    
    // Initialize all members with zero values
    event.members.forEach(member => {
      summary[member.id] = { paid: 0, owes: 0, balance: 0 };
    });

    // Calculate what each person paid
    event.expenses.forEach(expense => {
      if (expense.multiplePayments) {
        // Handle multiple payments
        expense.multiplePayments.forEach(payment => {
          if (summary[payment.memberId]) {
            summary[payment.memberId].paid += payment.amount;
          }
        });
      } else if (expense.paidBy && summary[expense.paidBy]) {
        // Handle single payer - only add if paidBy exists and is in summary
        summary[expense.paidBy].paid += expense.amount;
      }
    });

    // Calculate what each person owes
    event.expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      expense.splitBetween.forEach(memberId => {
        if (summary[memberId]) {
          summary[memberId].owes += sharePerPerson;
        }
      });
    });

    // Calculate balances
    Object.keys(summary).forEach(memberId => {
      summary[memberId].balance = summary[memberId].paid - summary[memberId].owes;
    });

    return summary;
  };

  const memberSummary = calculateMemberSummary();

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
                <h2 className="text-2xl font-bold">Settlement Summary</h2>
                <p className="text-gray-600">{event.name}</p>
              </div>
            </div>
            <Button onClick={generateShareableLink} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Settlement Completion Checkbox */}
      {settlements.length > 0 && !isSettlementCleared && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Checkbox
                id="clear-settlements"
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    handleClearSettlements();
                  }
                }}
              />
              <div className="flex-1">
                <label htmlFor="clear-settlements" className="text-sm font-medium cursor-pointer">
                  Mark all settlements as completed
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Check this box once all members have settled their amounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Member Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {event.members.map(member => {
              const data = memberSummary[member.id];
              const isOwed = data.balance > 0;
              const owes = data.balance < 0;
              const isSettled = Math.abs(data.balance) < 0.01 || isSettlementCleared;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{member.name}</div>
                    {isSettled && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Settled
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Paid: ₹{data.paid.toFixed(2)} | Owes: ₹{data.owes.toFixed(2)}
                    </div>
                    <div className={`font-medium ${
                      isSettled ? 'text-gray-600' : isOwed ? 'text-green-600' : owes ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {isSettled ? 'All settled' : (
                        <>
                          {isOwed && `Gets back ₹${data.balance.toFixed(2)}`}
                          {owes && `Owes ₹${Math.abs(data.balance).toFixed(2)}`}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>
            {settlements.length > 0 && !isSettlementCleared ? 'Required Settlements' : 'All Settled!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(settlements.length === 0 || isSettlementCleared) ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Everything is settled!
              </h3>
              <p className="text-gray-600">
                {isSettlementCleared 
                  ? "All settlements have been marked as completed."
                  : "No money needs to be exchanged between members."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{getMemberName(settlement.from)}</div>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <div className="font-medium">{getMemberName(settlement.to)}</div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ₹{settlement.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                ₹{event.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Expenses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {event.expenses.length}
              </div>
              <div className="text-sm text-gray-500">Total Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {isSettlementCleared ? 0 : settlements.length}
              </div>
              <div className="text-sm text-gray-500">Settlements Needed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementView;
