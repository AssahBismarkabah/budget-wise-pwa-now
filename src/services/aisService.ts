import axios from 'axios';

const API_BASE_URL = '/api';

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
  async getAccounts(bankId: string, withBalance: boolean = true) {
    const response = await axios.get(`${API_BASE_URL}/v1/banking/ais/accounts`, {
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
    const response = await axios.get(`${API_BASE_URL}/v1/banking/banks`, {
      params: {
        keyword: query,
        onlyActive: true
      }
    });
    return response.data;
  },

  async getBankProfile(bankId: string): Promise<BankProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/banks/${bankId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bank profile:', error);
      throw error;
    }
  }
}; 