interface Certificate {
  id: number;
  user_id: string;
  module_name: string;
  issued_at: string;
}

const PROGRESS_KEY = 'eduai_user_progress';
const CERTIFICATES_KEY = 'eduai_user_certificates';

export const storageService = {
  getProgress: (userId: string): string[] => {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return allProgress[userId] || [];
  },

  saveProgress: (userId: string, moduleId: string): void => {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    if (!allProgress[userId]) allProgress[userId] = [];
    if (!allProgress[userId].includes(moduleId)) {
      allProgress[userId].push(moduleId);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    }
  },

  getCertificates: (userId: string): Certificate[] => {
    const allCerts = JSON.parse(localStorage.getItem(CERTIFICATES_KEY) || '{}');
    return allCerts[userId] || [];
  },

  issueCertificate: (userId: string, moduleName: string): { success: boolean; alreadyExists?: boolean } => {
    const allCerts = JSON.parse(localStorage.getItem(CERTIFICATES_KEY) || '{}');
    if (!allCerts[userId]) allCerts[userId] = [];
    
    const existing = allCerts[userId].find((c: Certificate) => c.module_name === moduleName);
    if (existing) return { success: true, alreadyExists: true };

    const newCert: Certificate = {
      id: Date.now(),
      user_id: userId,
      module_name: moduleName,
      issued_at: new Date().toISOString()
    };

    allCerts[userId].push(newCert);
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(allCerts));
    return { success: true };
  }
};
