
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense } from '@/types/expense';

interface ExpenseChartProps {
  expenses: Expense[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  // Filter only expenses (not income) for the pie chart
  const expenseData = expenses.filter(e => e.type === 'expense');
  
  if (expenseData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No expenses to display. Add some expenses to see the breakdown.
      </div>
    );
  }

  // Group expenses by category
  const categoryData = expenseData.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Calculate monthly data for bar chart
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    acc[month][expense.type] += expense.amount;
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const barData = Object.values(monthlyData).slice(-6); // Last 6 months

  return (
    <div className="space-y-6">
      {/* Pie Chart for Expense Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Expense by Category</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart for Monthly Income vs Expense */}
      {barData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Overview</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expense" fill="#FF8042" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
