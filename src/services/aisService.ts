import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086/v1';

// Add fintech ID and headers
const FINTECH_ID = 'MY-SUPER-FINTECH-ID';
let fintechToken: string | null = null;

const getHeaders = () => ({
  'X-Fintech-ID': FINTECH_ID,
  'Content-Type': 'application/json',
  'X-Request-ID': crypto.randomUUID(),
  'X-Session-ID': crypto.randomUUID(),
  'X-Timestamp': new Date().toISOString(),
  ...(fintechToken ? { 'fintech-token': fintechToken } : {})
});

export interface Account {
  id: string;
  iban: string;
  currency: string;
  name: string;
  product: string;
  cashAccountType: string;
  status: string;
  balances?: {
    balanceAmount: {
      amount: string;
      currency: string;
    };
    balanceType: string;
    lastChangeDateTime: string;
  }[];
}

export interface Transaction {
  transactionId: string;
  entryReference: string;
  endToEndId: string;
  mandateId: string;
  checkId: string;
  creditorId: string;
  amount: {
    amount: string;
    currency: string;
  };
  creditorName: string;
  creditorAccount: {
    iban: string;
  };
  debtorName: string;
  debtorAccount: {
    iban: string;
  };
  bookingDate: string;
  valueDate: string;
  remittanceInformationUnstructured: string;
  purposeCode: string;
  bankTransactionCode: string;
}

export interface BankProfile {
  bankName: string;
  services: string[];
}

export interface AccountDetails {
  resourceId: string;
  iban: string;
  name: string;
  balances?: {
    balanceAmount: {
      amount: number;
      currency: string;
    };
  }[];
}

export const aisService = {
  async login(username: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/v1/login`, {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID()
      }
    });
    return response.data;
  },

  async getAccounts(bankId: string, withBalance: boolean = true) {
    const response = await axios.get(`${API_BASE_URL}/v1/banking/ais/accounts`, {
      headers: getHeaders(),
      params: {
        bankId,
        withBalance,
        online: true,
        createConsentIfNone: 'true',
        loARetrievalInformation: 'GLOBAL'
      }
    });
    return response.data;
  },

  async getTransactions(
    bankId: string,
    accountId: string,
    dateFrom: string,
    dateTo: string
  ) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/banking/ais/accounts/${accountId}/transactions`,
      {
        headers: getHeaders(),
        params: {
          bankId,
          dateFrom,
          dateTo,
          online: true,
          createConsentIfNone: 'true',
          loTRetrievalInformation: 'GLOBAL'
        }
      }
    );
    return response.data;
  },

  async searchBanks(query: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/search`, {
        params: { query },
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID()
        },
        withCredentials: true // This ensures cookies are sent with the request
      });
      return response.data;
    } catch (error) {
      console.error('Error searching banks:', error);
      throw error;
    }
  },

  async getBankProfile(bankId: string): Promise<BankProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/banks/${bankId}/profile`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bank profile:', error);
      throw error;
    }
  },

  async initiateConsent(bankId: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/consents`,
        { bankId },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID()
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating consent:', error);
      throw error;
    }
  },

  async getConsentStatus(consentId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/consents/${consentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID()
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting consent status:', error);
      throw error;
    }
  }
}; 