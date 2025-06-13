
export interface Expense {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMode: string;
  splitInfo?: {
    totalPeople: number;
    amountPerPerson: number;
  };
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category: string;
  paymentMode: string;
  // New field to track multiple payers
  multiplePayments?: {
    memberId: string;
    amount: number;
    paymentMode: string;
  }[];
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
