import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Share2, CheckCircle, FileText } from 'lucide-react';
import { GroupEvent, Settlement } from '@/types/expense';
import jsPDF from 'jspdf';

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

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${event.name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(16);
    pdf.text('Detailed Expense Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date and generation info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;

    // Event Overview
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Event Overview', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const totalAmount = event.expenses.reduce((sum, e) => sum + e.amount, 0);
    pdf.text(`Event Name: ${event.name}`, 25, yPosition);
    yPosition += 6;
    if (event.description) {
      pdf.text(`Description: ${event.description}`, 25, yPosition);
      yPosition += 6;
    }
    pdf.text(`Total Amount Spent: ₹${totalAmount.toLocaleString()}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Number of Expenses: ${event.expenses.length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Number of Members: ${event.members.length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Date Created: ${new Date(event.createdAt).toLocaleDateString()}`, 25, yPosition);
    yPosition += 20;

    // Members List
    addNewPageIfNeeded(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Members', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    event.members.forEach((member, index) => {
      pdf.text(`${index + 1}. ${member.name}${member.email ? ` (${member.email})` : ''}`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Detailed Expense List
    addNewPageIfNeeded(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Expense Breakdown', 20, yPosition);
    yPosition += 15;

    event.expenses.forEach((expense, index) => {
      addNewPageIfNeeded(60);
      
      // Expense header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${expense.description}`, 25, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Basic expense info
      pdf.text(`Amount: ₹${expense.amount.toLocaleString()}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Category: ${expense.category}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Date: ${expense.date}`, 30, yPosition);
      yPosition += 5;

      // Payment information
      if (expense.multiplePayments) {
        pdf.text('Paid by Multiple People:', 30, yPosition);
        yPosition += 5;
        expense.multiplePayments.forEach(payment => {
          pdf.text(`  • ${getMemberName(payment.memberId)}: ₹${payment.amount.toFixed(2)} (${payment.paymentMode})`, 35, yPosition);
          yPosition += 5;
        });
      } else {
        pdf.text(`Paid by: ${getMemberName(expense.paidBy)}`, 30, yPosition);
        yPosition += 5;
        pdf.text(`Payment Mode: ${expense.paymentMode}`, 30, yPosition);
        yPosition += 5;
      }

      // Split information
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      pdf.text(`Split among ${expense.splitBetween.length} members (₹${sharePerPerson.toFixed(2)} each):`, 30, yPosition);
      yPosition += 5;
      
      expense.splitBetween.forEach(memberId => {
        pdf.text(`  • ${getMemberName(memberId)}: ₹${sharePerPerson.toFixed(2)}`, 35, yPosition);
        yPosition += 5;
      });
      
      yPosition += 8;
    });

    // Member Financial Summary
    addNewPageIfNeeded(60);
    const memberSummary = calculateMemberSummary();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Member Financial Summary', 20, yPosition);
    yPosition += 15;

    event.members.forEach(member => {
      addNewPageIfNeeded(25);
      const data = memberSummary[member.id];
      const isOwed = data.balance > 0;
      const owes = data.balance < 0;
      const isSettled = Math.abs(data.balance) < 0.01 || isSettlementCleared;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${member.name}`, 25, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Paid: ₹${data.paid.toFixed(2)}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Total Share: ₹${data.owes.toFixed(2)}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Net Balance: ₹${data.balance.toFixed(2)}`, 30, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'bold');
      if (isSettled) {
        pdf.text('Status: ✓ All Settled', 30, yPosition);
      } else if (isOwed) {
        pdf.text(`Status: Gets back ₹${data.balance.toFixed(2)}`, 30, yPosition);
      } else if (owes) {
        pdf.text(`Status: Owes ₹${Math.abs(data.balance).toFixed(2)}`, 30, yPosition);
      }
      yPosition += 12;
    });

    // Settlement Instructions
    addNewPageIfNeeded(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Settlement Instructions', 20, yPosition);
    yPosition += 15;

    if (settlements.length === 0 || isSettlementCleared) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎉 All Settled!', 25, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(isSettlementCleared 
        ? "All settlements have been marked as completed."
        : "No money needs to be exchanged between members.", 25, yPosition);
    } else {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('The following settlements need to be made to balance all accounts:', 25, yPosition);
      yPosition += 10;

      settlements.forEach((settlement, index) => {
        addNewPageIfNeeded(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${getMemberName(settlement.from)} → ${getMemberName(settlement.to)}`, 25, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`    Amount: ₹${settlement.amount.toFixed(2)}`, 25, yPosition);
        yPosition += 8;
      });
    }

    // Footer
    addNewPageIfNeeded(20);
    yPosition = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Expense Tracker App', pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF
    pdf.save(`${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_detailed_report.pdf`);
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
            <div className="flex space-x-2">
              <Button onClick={generatePDF} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Download Detailed PDF
              </Button>
              <Button onClick={generateShareableLink} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
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
