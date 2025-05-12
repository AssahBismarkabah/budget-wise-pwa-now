import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { consentService, ConsentStatus } from '../services/consentService';

export const ConsentRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      const redirectCode = searchParams.get('redirectCode');
      const status = searchParams.get('status') as ConsentStatus;

      if (!redirectCode || !status) {
        setError('Invalid redirect parameters');
        return;
      }

      try {
        await consentService.handleConsentRedirect(redirectCode, status);
      } catch (err) {
        console.error('Consent redirect error:', err);
        setError('Failed to process consent. Please try again.');
      }
    };

    handleRedirect();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={() => navigate('/bank-integration')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Bank Integration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Processing Consent
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we process your consent...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}; 