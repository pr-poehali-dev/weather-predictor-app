export const getApiKey = (keyId: string): string | null => {
  try {
    const saved = localStorage.getItem('api_keys');
    if (!saved) return null;
    
    const keys = JSON.parse(saved);
    const key = keys.find((k: any) => k.id === keyId);
    return key?.value || null;
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
};

export const getAllApiKeys = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('api_keys');
    if (!saved) return {};
    
    const keys = JSON.parse(saved);
    return keys.reduce((acc: Record<string, string>, key: any) => {
      if (key.value) {
        acc[key.id] = key.value;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to get API keys:', error);
    return {};
  }
};

export const setApiKey = (keyId: string, value: string): void => {
  try {
    const saved = localStorage.getItem('api_keys');
    const keys = saved ? JSON.parse(saved) : [];
    
    const existingIndex = keys.findIndex((k: any) => k.id === keyId);
    if (existingIndex >= 0) {
      keys[existingIndex].value = value;
    } else {
      keys.push({
        id: keyId,
        name: keyId,
        description: 'Custom API Key',
        value,
        icon: 'Key',
        placeholder: 'API Key'
      });
    }
    
    localStorage.setItem('api_keys', JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to set API key:', error);
  }
};
