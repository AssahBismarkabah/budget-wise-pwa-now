import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'de' | 'en';

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define translations
const translations: Record<Language, Record<string, string>> = {
  de: {
    // Navigation
    'overview': 'Übersicht',
    'limits': 'Limits',
    'savings_goals': 'Sparziele',
    'statistics': 'Statistik',
    'categories': 'Kategorien',
    'income_categories': 'Einnahmen Kategorien',
    'expense_categories': 'Ausgaben Kategorien',
    'tools': 'Tools',
    'templates': 'Vorlagen',
    'recurring_items': 'Wiederkehrende Posten',
    'settings': 'Einstellungen',
    
    // Settings
    'accounts': 'Konten',
    'new_account': 'Neues Konto',
    'app_settings': 'App-Einstellungen',
    'offline_mode': 'Offline Modus',
    'reset_app': 'App zurücksetzen',
    'reset_warning': 'Diese Aktion löscht alle Ihre Daten und setzt die App zurück. Dies kann nicht rückgängig gemacht werden.',
    'cancel': 'Abbrechen',
    'reset': 'Zurücksetzen',
    'account_name': 'Kontoname',
    'account_placeholder': 'z.B. Privatkonto, Gemeinschaftskonto, etc.',
    'create': 'Erstellen',
    'language': 'Sprache',
    'german': 'Deutsch',
    'english': 'Englisch',
    
    // Feedback
    'feedback': 'Feedback',
    'feedback_desc': 'Wir freuen uns über Ihr Feedback! Helfen Sie uns, die App zu verbessern.',
    'your_feedback': 'Ihr Feedback...',
    'send_feedback': 'Feedback senden',
    'feedback_sent': 'Vielen Dank für Ihr Feedback!',
    
    // About
    'about': 'Über uns',
    'app_by': 'My Budget - Expenses under control wird von Deutschland im Plus entwickelt.',
    'version': 'Version 1.0.0',
    'imprint': 'Impressum',
    'privacy': 'Datenschutz',
    
    // General
    'menu': 'Menü',
    'loading': 'Lädt...',
    'error': 'Fehler',
    'please_enter': 'Bitte geben Sie einen Namen für das Konto ein.',
    'balance': 'Saldo',
    'transactions': 'Transaktionen',
    'no_transactions': 'Noch keine Transaktionen vorhanden',
    'add_first_transaction': 'Fügen Sie Ihre ersten Einnahmen oder Ausgaben hinzu',
    'new_income': 'Neue Einnahme',
    'new_expense': 'Neue Ausgabe',
    'amount': 'Betrag',
    'category': 'Kategorie',
    'date': 'Datum',
    'note': 'Notiz',
    'save': 'Speichern',
    'delete': 'Löschen',
    'edit': 'Bearbeiten',
    'delete_confirmation': 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
    'yes': 'Ja',
    'no': 'Nein',
    'no_limits': 'Bisher wurden noch keine Limits angelegt',
    'no_savings_goals': 'Bisher wurden noch keine Sparziele angelegt',
    'add_limit': 'Limit hinzufügen',
    'add_savings_goal': 'Sparziel hinzufügen',
    'target_amount': 'Zielbetrag',
    'current_savings': 'Aktuelles Ersparnis',
    'deadline': 'Fälligkeitsdatum',
    'progress': 'Fortschritt',
    'remaining': 'Verbleibend',
    'goal_name': 'Zielname',
    'limit_amount': 'Limitbetrag',
    'spent': 'Ausgegeben',
    'limit_name': 'Limitname',
    'no_categories': 'Keine Kategorien vorhanden',
    'add_category': 'Kategorie hinzufügen',
    'all_categories': 'Alle Kategorien',
    'dark_mode': "Dunkelmodus",
    'light_mode': "Hellmodus",
    'tagline': "Ausgaben unter Kontrolle"
  },
  en: {
    // Navigation
    'overview': 'Overview',
    'limits': 'Limits',
    'savings_goals': 'Savings Goals',
    'statistics': 'Statistics',
    'categories': 'Categories',
    'income_categories': 'Income Categories',
    'expense_categories': 'Expense Categories',
    'tools': 'Tools',
    'templates': 'Templates',
    'recurring_items': 'Recurring Items',
    'settings': 'Settings',
    
    // Settings
    'accounts': 'Accounts',
    'new_account': 'New Account',
    'app_settings': 'App Settings',
    'offline_mode': 'Offline Mode',
    'reset_app': 'Reset App',
    'reset_warning': 'This action will delete all your data and reset the app. This cannot be undone.',
    'cancel': 'Cancel',
    'reset': 'Reset',
    'account_name': 'Account Name',
    'account_placeholder': 'e.g. Private Account, Joint Account, etc.',
    'create': 'Create',
    'language': 'Language',
    'german': 'German',
    'english': 'English',
    
    // Feedback
    'feedback': 'Feedback',
    'feedback_desc': 'We appreciate your feedback! Help us improve the app.',
    'your_feedback': 'Your feedback...',
    'send_feedback': 'Send Feedback',
    'feedback_sent': 'Thank you for your feedback!',
    
    // About
    'about': 'About Us',
    'app_by': 'My Budget - Expenses under control is developed by Deutschland im Plus.',
    'version': 'Version 1.0.0',
    'imprint': 'Imprint',
    'privacy': 'Privacy Policy',
    
    // General
    'menu': 'Menu',
    'loading': 'Loading...',
    'error': 'Error',
    'please_enter': 'Please enter a name for the account.',
    'balance': 'Balance',
    'transactions': 'Transactions',
    'no_transactions': 'No transactions available yet',
    'add_first_transaction': 'Add your first income or expense',
    'new_income': 'New Income',
    'new_expense': 'New Expense',
    'amount': 'Amount',
    'category': 'Category',
    'date': 'Date',
    'note': 'Note',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'delete_confirmation': 'Are you sure you want to delete this item?',
    'yes': 'Yes',
    'no': 'No',
    'no_limits': 'No limits have been set yet',
    'no_savings_goals': 'No savings goals have been set yet',
    'add_limit': 'Add Limit',
    'add_savings_goal': 'Add Savings Goal',
    'target_amount': 'Target Amount',
    'current_savings': 'Current Savings',
    'deadline': 'Deadline',
    'progress': 'Progress',
    'remaining': 'Remaining',
    'goal_name': 'Goal Name',
    'limit_amount': 'Limit Amount',
    'spent': 'Spent',
    'limit_name': 'Limit Name',
    'no_categories': 'No categories available',
    'add_category': 'Add Category',
    'all_categories': 'All Categories',
    'dark_mode': "Dark Mode",
    'light_mode': "Light Mode",
    'tagline': "Expenses under control"
  }
};

// Create the provider
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or default to German
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'de';
  });

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
