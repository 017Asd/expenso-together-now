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
    const margin = 15;
    let yPosition = margin;

    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    const drawLine = (y: number) => {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
    };

    const addSection = (title: string, fontSize = 14) => {
      addNewPageIfNeeded(25);
      yPosition += 10;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPosition);
      yPosition += 8;
      drawLine(yPosition);
      yPosition += 8;
    };

    // Header with better spacing
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(event.name, pageWidth / 2, yPosition + 5, { align: 'center' });
    yPosition += 12;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Expense Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date and generation info with better formatting
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const currentDate = new Date();
    pdf.text(`Generated on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 
             pageWidth / 2, yPosition, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    yPosition += 20;

    // Event Overview with improved layout
    addSection('Event Overview', 16);
    const totalAmount = event.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const eventDetails = [
      `Event Name: ${event.name}`,
      event.description ? `Description: ${event.description}` : null,
      `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`,
      `Total Expenses: ${event.expenses.length}`,
      `Members: ${event.members.length}`,
      `Created: ${new Date(event.createdAt).toLocaleDateString()}`
    ].filter(Boolean);

    eventDetails.forEach(detail => {
      pdf.text(`• ${detail}`, margin + 5, yPosition);
      yPosition += 6;
    });

    // Members section with better formatting
    addSection('Event Members', 16);
    pdf.setFontSize(11);
    event.members.forEach((member, index) => {
      const memberText = `${index + 1}. ${member.name}${member.email ? ` (${member.email})` : ''}`;
      pdf.text(memberText, margin + 5, yPosition);
      yPosition += 6;
    });

    // Detailed Expenses with improved structure
    addSection('Expense Details', 16);
    
    event.expenses.forEach((expense, index) => {
      addNewPageIfNeeded(80);
      
      // Expense title with background
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${expense.description}`, margin + 3, yPosition + 6);
      yPosition += 18;

      // Expense details in structured format
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const leftCol = margin + 10;
      const rightCol = pageWidth / 2 + 10;
      
      // Left column
      pdf.setFont('helvetica', 'bold');
      pdf.text('Amount:', leftCol, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`₹${expense.amount.toLocaleString('en-IN')}`, leftCol + 25, yPosition);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', rightCol, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(expense.date, rightCol + 20, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Category:', leftCol, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(expense.category, leftCol + 25, yPosition);
      yPosition += 10;

      // Payment information
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Details:', leftCol, yPosition);
      yPosition += 7;

      if (expense.multiplePayments) {
        pdf.setFont('helvetica', 'normal');
        pdf.text('Multiple Payers:', leftCol + 5, yPosition);
        yPosition += 5;
        expense.multiplePayments.forEach(payment => {
          pdf.text(`  • ${getMemberName(payment.memberId)}: ₹${payment.amount.toFixed(2)} (${payment.paymentMode})`, 
                   leftCol + 5, yPosition);
          yPosition += 5;
        });
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Paid by: ${getMemberName(expense.paidBy)}`, leftCol + 5, yPosition);
        yPosition += 5;
        pdf.text(`Mode: ${expense.paymentMode}`, leftCol + 5, yPosition);
        yPosition += 5;
      }

      // Split information
      yPosition += 3;
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Split Details:', leftCol, yPosition);
      yPosition += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Shared among ${expense.splitBetween.length} members (₹${sharePerPerson.toFixed(2)} each):`, 
               leftCol + 5, yPosition);
      yPosition += 5;
      
      expense.splitBetween.forEach(memberId => {
        pdf.text(`  • ${getMemberName(memberId)}: ₹${sharePerPerson.toFixed(2)}`, leftCol + 5, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      drawLine(yPosition);
      yPosition += 5;
    });

    // Member Summary with improved layout
    addSection('Financial Summary', 16);
    const memberSummary = calculateMemberSummary();
    
    // Table header
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Member', margin + 3, yPosition + 6);
    pdf.text('Paid', margin + 60, yPosition + 6);
    pdf.text('Share', margin + 90, yPosition + 6);
    pdf.text('Balance', margin + 120, yPosition + 6);
    pdf.text('Status', margin + 155, yPosition + 6);
    yPosition += 15;

    event.members.forEach((member, index) => {
      addNewPageIfNeeded(8);
      const data = memberSummary[member.id];
      const isOwed = data.balance > 0;
      const owes = data.balance < 0;
      const isSettled = Math.abs(data.balance) < 0.01 || isSettlementCleared;
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
      }
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(member.name, margin + 3, yPosition + 3);
      pdf.text(`₹${data.paid.toFixed(2)}`, margin + 60, yPosition + 3);
      pdf.text(`₹${data.owes.toFixed(2)}`, margin + 90, yPosition + 3);
      
      // Balance with color coding
      const balanceText = data.balance >= 0 ? `+₹${data.balance.toFixed(2)}` : `-₹${Math.abs(data.balance).toFixed(2)}`;
      pdf.text(balanceText, margin + 120, yPosition + 3);
      
      // Status
      pdf.setFont('helvetica', 'bold');
      if (isSettled) {
        pdf.text('Settled ✓', margin + 155, yPosition + 3);
      } else if (isOwed) {
        pdf.text('Gets back', margin + 155, yPosition + 3);
      } else if (owes) {
        pdf.text('Owes', margin + 155, yPosition + 3);
      }
      
      yPosition += 8;
    });

    // Settlement Instructions with better formatting
    addSection('Settlement Instructions', 16);

    if (settlements.length === 0 || isSettlementCleared) {
      pdf.setFillColor(230, 255, 230);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎉 All Settled!', margin + 5, yPosition + 8);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(isSettlementCleared 
        ? "All settlements have been marked as completed."
        : "No money needs to be exchanged between members.", 
        margin + 5, yPosition + 16);
    } else {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('The following settlements are required:', margin + 5, yPosition);
      yPosition += 15;

      settlements.forEach((settlement, index) => {
        addNewPageIfNeeded(12);
        
        // Settlement box
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin + 5, yPosition - 2, pageWidth - 2 * margin - 10, 10, 'F');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${getMemberName(settlement.from)} → ${getMemberName(settlement.to)}`, 
                 margin + 8, yPosition + 3);
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Amount: ₹${settlement.amount.toFixed(2)}`, margin + 8, yPosition + 8);
        yPosition += 15;
      });
    }

    // Footer
    yPosition = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by Expense Tracker', pageWidth / 2, yPosition, { align: 'center' });

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
