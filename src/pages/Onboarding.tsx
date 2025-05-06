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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addAccount } = useBudget();
  const { setIsAuthenticated } = useAccount();

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

  const handleNext = async () => {
    if (step === 1 && accountName) {
      // Create the initial account
      await addAccount(accountName);
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Mark onboarding as complete and navigate to the main app
      localStorage.setItem('onboardingComplete', 'true');
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  const handleSkip = () => {
    if (step === 1 && accountName) {
      // Create the initial account even if skipping
      addAccount(accountName);
    }
    localStorage.setItem('onboardingComplete', 'true');
    setIsAuthenticated(true);
    navigate('/');
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
            <h2 className="text-2xl font-bold">{t(steps[step].title)}</h2>
            <p className="text-muted-foreground">{t(steps[step].description)}</p>
          </div>

          {/* Account creation form */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">{t('account_name')}</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={t('account_name_placeholder')}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className={step === 0 ? 'invisible' : ''}
            >
              {t('skip')}
            </Button>
            <Button
              onClick={handleNext}
              disabled={step === 1 && !accountName}
            >
              {step === steps.length - 1 ? t('get_started') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
