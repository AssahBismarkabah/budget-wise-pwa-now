import { useEffect, useState } from 'react';
import { aisService, Account } from '../services/aisService';

interface AccountsListProps {
  bankId: string;
  onSelect: (account: Account) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({ bankId, onSelect }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await aisService.getAccounts(bankId);
        setAccounts(data);
      } catch (err) {
        setError('Failed to load accounts. Please try again.');
        console.error('Accounts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [bankId]);

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

  if (accounts.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No accounts found.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.iban}</p>
              <p className="text-sm text-gray-500">
                {account.product} - {account.cashAccountType}
              </p>
            </div>
            {account.balances && account.balances.length > 0 && (
              <div className="text-right">
                <p className="font-medium">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: account.balances[0].balanceAmount.currency
                  }).format(parseFloat(account.balances[0].balanceAmount.amount))}
                </p>
                <p className="text-xs text-gray-500">
                  {account.balances[0].balanceType}
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t">
            <button
              onClick={() => onSelect(account)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View Transactions
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 