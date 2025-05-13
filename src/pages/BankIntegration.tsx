import { useState } from 'react';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { BankSearch } from '@/components/BankSearch';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountsList } from '@/components/AccountsList';
import { TransactionsList } from '@/components/TransactionsList';
import { aisService } from '@/services/aisService';
import { storageService } from '@/services/storageService';
import { BankProfile } from '@/services/aisService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Bank {
  id: string;
  name: string;
  bic: string;
  bankCode: string;
}

interface Account {
  id: string;
  name: string;
  iban: string;
  product: string;
  cashAccountType: string;
  balances?: {
    balanceAmount: {
      amount: string;
      currency: string;
    };
    balanceType: string;
  }[];
}

const BankIntegration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFintechAuthenticated, setIsFintechAuthenticated] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [bankProfile, setBankProfile] = useState<BankProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setSelectedAccount(null);
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleBack = () => {
    if (selectedAccount) {
      setSelectedAccount(null);
    } else if (selectedBank) {
      setSelectedBank(null);
      setBankProfile(null);
    } else {
      navigate('/settings');
    }
  };

  return (
    <>
      {!isFintechAuthenticated ? (
        <AuthProvider>
          <Auth onSuccess={() => setIsFintechAuthenticated(true)} />
        </AuthProvider>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {selectedAccount
                ? t('transactions')
                : selectedBank
                ? t('accounts')
                : t('bank_integration')}
            </h1>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {!selectedBank && <BankSearch onSelect={handleBankSelect} />}
              {selectedBank && !selectedAccount && (
                <AccountsList
                  bankId={selectedBank.id}
                  onSelect={handleAccountSelect}
                />
              )}
              {selectedBank && selectedAccount && (
                <TransactionsList
                  bankId={selectedBank.id}
                  accountId={selectedAccount.id}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default BankIntegration; 