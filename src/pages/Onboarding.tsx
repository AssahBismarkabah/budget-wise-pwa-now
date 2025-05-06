import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudget } from '@/contexts/BudgetContext';
import { useAccount } from '@/contexts/AccountContext';
import Logo from '@/components/Logo';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accounts, addAccount, switchAccount } = useBudget();
  const { setIsAuthenticated } = useAccount();

  // If accounts exist, show account selection first
  const hasAccounts = accounts && accounts.length > 0;

  // Main account id for tying new accounts
  const mainAccountId = hasAccounts ? accounts[0].id : null;

  // Step 0: Account selection or creation
  if (step === 0 && hasAccounts && !creatingNew) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo size="large" />
            <h2 className="text-2xl font-bold mt-4">{t('select_account')}</h2>
            <p className="text-muted-foreground mb-4">{t('select_account_desc')}</p>
          </div>
          <div className="space-y-4">
            {accounts.map((acc) => (
              <Button
                key={acc.id}
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  switchAccount(acc.id);
                  localStorage.setItem('onboardingComplete', 'true');
                  setIsAuthenticated(true);
                  navigate('/');
                }}
              >
                {acc.name}
              </Button>
            ))}
            <Button
              className="w-full mt-2"
              onClick={() => setCreatingNew(true)}
            >
              {t('create_account_title')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 0: Create new account (if no accounts or user chose to create new)
  if (step === 0 && (!hasAccounts || creatingNew)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo size="large" />
            <h2 className="text-2xl font-bold mt-4">{t('create_account_title')}</h2>
            <p className="text-muted-foreground mb-4">{t('create_account_description')}</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="accountName">{t('account_name')}</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t('account_name_placeholder')}
            />
            <Button
              className="w-full mt-2"
              onClick={async () => {
                // Tie new account to main account if exists
                await addAccount(accountName);
                setAccountName('');
                setCreatingNew(false);
                setStep(1);
              }}
              disabled={!accountName.trim()}
            >
              {t('next')}
            </Button>
            {hasAccounts && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setCreatingNew(false)}
              >
                {t('back')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rest of onboarding steps (feature tour)
  const steps = [
    {
      title: t('welcome_title'),
      description: t('welcome_description'),
      image: '/onboarding/welcome.svg'
    },
    {
      title: t('transactions_title'),
      description: t('transactions_description'),
      image: '/onboarding/transactions.svg'
    },
    {
      title: t('categories_title'),
      description: t('categories_description'),
      image: '/onboarding/categories.svg'
    },
    {
      title: t('limits_title'),
      description: t('limits_description'),
      image: '/onboarding/limits.svg'
    },
    {
      title: t('templates_title'),
      description: t('templates_description'),
      image: '/onboarding/templates.svg'
    },
    {
      title: t('statistics_title'),
      description: t('statistics_description'),
      image: '/onboarding/statistics.svg'
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Logo size="large" />
          </div>
          {/* Step content */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{t(steps[step]?.title)}</h2>
            <p className="text-muted-foreground">{t(steps[step]?.description)}</p>
          </div>
          {/* Navigation buttons */}
          <div className="flex justify-end pt-6">
            <Button onClick={handleNext}>
              {step === steps.length - 1 ? t('get_started') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
