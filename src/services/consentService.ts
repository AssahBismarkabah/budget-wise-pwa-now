import axios from 'axios';

const API_BASE_URL = '/api';

export enum ConsentStatus {
  OK = 'OK',
  NOT_OK = 'NOT_OK'
}

export const consentService = {
  async handleConsentRedirect(redirectCode: string, status: ConsentStatus) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/v1/consent/fromAspsp/${redirectCode}`,
        {
          params: {
            status
          },
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400
        }
      );

      // Handle redirect if present
      if (response.headers.location) {
        window.location.href = response.headers.location;
        return;
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.headers?.location) {
        window.location.href = error.response.headers.location;
        return;
      }
      throw error;
    }
  },

  async handlePaymentRedirect(redirectCode: string, status: ConsentStatus) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/v1/payment/fromAspsp/${redirectCode}`,
        {
          params: {
            status
          },
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400
        }
      );

      // Handle redirect if present
      if (response.headers.location) {
        window.location.href = response.headers.location;
        return;
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.headers?.location) {
        window.location.href = error.response.headers.location;
        return;
      }
      throw error;
    }
  }
}; 