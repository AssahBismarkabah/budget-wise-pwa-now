import { Transaction, Category, Limit, Template, RecurringItem, SavingsGoal } from './dbService';

export interface ExportData {
  transactions: Transaction[];
  categories: Category[];
  limits: Limit[];
  templates: Template[];
  recurringItems: RecurringItem[];
  savingsGoals: SavingsGoal[];
  exportDate: string;
  version: string;
}

export const exportData = (data: ExportData): string => {
  const exportString = JSON.stringify(data, null, 2);
  const blob = new Blob([exportString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget-wise-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return exportString;
};

export const importData = async (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        
        // Validate the imported data
        if (!data.transactions || !data.categories || !data.limits || 
            !data.templates || !data.recurringItems || !data.savingsGoals) {
          throw new Error('Invalid export file format');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse import file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };
    
    reader.readAsText(file);
  });
}; 