
export interface Expense {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMode: string;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface GroupEvent {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  expenses: GroupExpense[];
  createdAt: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
