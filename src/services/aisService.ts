import axios from 'axios';
import { api } from './authService';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:8086/v1';

// Add fintech ID and headers
const FINTECH_ID = 'MY-SUPER-FINTECH-ID';
let fintechToken: string | null = null;

const getHeaders = () => ({
  'X-Fintech-ID': FINTECH_ID,
  'Content-Type': 'application/json',
  'X-Request-ID': crypto.randomUUID(),
  'x-session-id': crypto.randomUUID(),
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
    const response = await axios.get(`${API_BASE_URL}/banking/ais/accounts`, {
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
      const response = await api.get(`${API_BASE_URL}/search/bankSearch`, {
        params: { keyword: query }
      });
      console.log('Bank search response:', response.data);
      const mapped = response.data.bankDescriptor.map((bank: any) => ({
        id: bank.uuid,
        name: bank.bankName,
        bic: bank.bic,
        bankCode: bank.bankCode
      }));
      console.log('Mapped bank UUIDs:', mapped.map(b => b.id));
      return mapped;
    } catch (error) {
      console.error('Error searching banks:', error);
      throw error;
    }
  },

  async getBankProfile(bankId: string): Promise<BankProfile> {
    const response = await axios.get(`${API_BASE_URL}/search/bankProfile`, {
      headers: getHeaders(),
      params: { bankProfileId: bankId },
      withCredentials: true
    });
    return response.data;
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