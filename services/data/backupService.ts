import { AppBackupData, CognitiveGraphData, Message, CognitiveMetrics, UserProfile } from '../../types';

/**
 * Membuat file JSON dari state aplikasi dan memicu download browser.
 */
export const exportDataToJson = (
  graphData: CognitiveGraphData,
  messages: Message[],
  metrics: CognitiveMetrics,
  userProfile: UserProfile
): void => {
  try {
    const backupData: AppBackupData = {
      version: '1.1.0', // Updated version to support extended profile fields
      timestamp: Date.now(),
      graphData,
      messages,
      metrics,
      userProfile
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link element to trigger download
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `mybrain_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Gagal mengekspor data. Terjadi kesalahan internal.');
  }
};

/**
 * Membaca file JSON yang diupload user, memvalidasi struktur, dan mengembalikan data.
 */
export const importDataFromJson = (file: File): Promise<AppBackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const parsedData = JSON.parse(jsonStr);

        // Basic Validation
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Format file tidak valid.');
        }

        // Check required keys (Basic Schema Validation)
        const requiredKeys = ['graphData', 'messages', 'metrics', 'userProfile'];
        const missingKeys = requiredKeys.filter(key => !(key in parsedData));

        if (missingKeys.length > 0) {
          throw new Error(`File rusak atau korup. Missing keys: ${missingKeys.join(', ')}`);
        }

        resolve(parsedData as AppBackupData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file.'));
    };

    reader.readAsText(file);
  });
};