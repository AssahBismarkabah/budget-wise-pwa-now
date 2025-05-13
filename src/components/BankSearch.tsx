import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aisService } from '@/services/aisService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const results = await aisService.searchBanks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Bank search failed:', err);
      setError('Failed to search for banks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('bank_search')}</CardTitle>
          <CardDescription>{t('bank_search_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_banks_placeholder')}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('searching') : t('search')}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">{t('search_results')}</h3>
              <div className="grid gap-4">
                {searchResults.map((bank) => (
                  <Card 
                    key={bank.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => onSelect(bank)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium">{bank.name}</h4>
                      <p className="text-sm text-gray-500">{bank.bic}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 