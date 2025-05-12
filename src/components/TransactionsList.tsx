import React, { useEffect, useState } from 'react';
import { aisService, Transaction } from '../services/aisService';

interface TransactionsListProps {
  bankId: string;
  accountId: string;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  bankId,
  accountId
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await aisService.getTransactions(
          bankId,
          accountId,
          dateRange.from,
          dateRange.to
        );
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions. Please try again.');
        console.error('Transactions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [bankId, accountId, dateRange]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No transactions found for the selected period.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateRangeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateRangeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.transactionId}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {transaction.creditorName || transaction.debtorName}
                </h3>
                <p className="text-sm text-gray-500">
                  {transaction.remittanceInformationUnstructured}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(transaction.bookingDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  parseFloat(transaction.amount.amount) < 0
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}>
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: transaction.amount.currency
                  }).format(parseFloat(transaction.amount.amount))}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.bankTransactionCode}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 