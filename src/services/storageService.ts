interface Settings {
  loa: string;
  lot: string;
  consent: any;
  withBalance: boolean;
  cacheLoa: boolean;
  cacheLot: boolean;
  consentRequiresAuthentication: boolean;
  dateFrom?: string;
  dateTo?: string;
}

interface RedirectData {
  redirectCode: string;
  authId: string;
  xsrfToken: string;
  maxAge: number;
  type: 'AIS' | 'PIS';
}

interface AccountStruct {
  resourceId: string;
  iban: string;
  name: string;
}

class StorageService {
  private static instance: StorageService;
  private settings: Settings = {
    loa: 'FROM_TPP_WITH_AVAILABLE_CONSENT',
    lot: 'FROM_TPP_WITH_AVAILABLE_CONSENT',
    consent: {},
    withBalance: true,
    cacheLoa: false,
    cacheLot: false,
    consentRequiresAuthentication: true
  };

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  getSettings(): Settings {
    return this.settings;
  }

  setSettings(settings: Partial<Settings>) {
    this.settings = { ...this.settings, ...settings };
  }

  setRedirect(
    redirectCode: string,
    authId: string,
    xsrfToken: string,
    maxAge: number,
    type: 'AIS' | 'PIS'
  ) {
    const redirectData: RedirectData = {
      redirectCode,
      authId,
      xsrfToken,
      maxAge,
      type
    };
    localStorage.setItem('redirectData', JSON.stringify(redirectData));
  }

  getRedirect(): RedirectData | null {
    const data = localStorage.getItem('redirectData');
    return data ? JSON.parse(data) : null;
  }

  clearRedirect() {
    localStorage.removeItem('redirectData');
  }

  setLoa(bankId: string, accounts: AccountStruct[]) {
    localStorage.setItem(`loa_${bankId}`, JSON.stringify(accounts));
  }

  getLoa(bankId: string): AccountStruct[] | null {
    const data = localStorage.getItem(`loa_${bankId}`);
    return data ? JSON.parse(data) : null;
  }

  setBankName(bankName: string) {
    localStorage.setItem('bankName', bankName);
  }

  getBankName(): string | null {
    return localStorage.getItem('bankName');
  }

  isAfterRedirect(): boolean {
    return !!this.getRedirect();
  }
}

export const storageService = StorageService.getInstance(); 