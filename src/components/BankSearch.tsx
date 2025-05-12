import React, { useState } from 'react';
import { aisService } from '../services/aisService';

interface Bank {
  id: string;
  name: string;
  bic: string;
  bankCode: string;
}

interface BankSearchProps {
  onSelect: (bank: Bank) => void;
}

export const BankSearch: React.FC<BankSearchProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setBanks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await aisService.searchBanks(query);
      setBanks(results);
    } catch (err) {
      setError('Failed to search banks. Please try again.');
      console.error('Bank search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for your bank..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}

      {banks.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-lg">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => onSelect(bank)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="font-medium">{bank.name}</div>
              <div className="text-sm text-gray-500">
                {bank.bic && `BIC: ${bank.bic}`}
                {bank.bankCode && ` | Bank Code: ${bank.bankCode}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 