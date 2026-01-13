import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  description: string;
  value: string;
  icon: string;
  placeholder: string;
}

const DEFAULT_API_KEYS: ApiKey[] = [
  {
    id: 'openai',
    name: 'OpenAI API Key',
    description: 'Для ChatGPT и других AI моделей OpenAI',
    value: '',
    icon: 'Brain',
    placeholder: 'sk-...'
  },
  {
    id: 'openweather',
    name: 'OpenWeather API Key',
    description: 'Для данных о погоде',
    value: '',
    icon: 'CloudSun',
    placeholder: 'Ваш API ключ OpenWeather'
  },
  {
    id: 'google_maps',
    name: 'Google Maps API Key',
    description: 'Для карт и геолокации',
    value: '',
    icon: 'Map',
    placeholder: 'AIza...'
  },
  {
    id: 'stripe',
    name: 'Stripe API Key',
    description: 'Для обработки платежей',
    value: '',
    icon: 'CreditCard',
    placeholder: 'sk_test_... или sk_live_...'
  },
  {
    id: 'telegram',
    name: 'Telegram Bot Token',
    description: 'Для Telegram бота',
    value: '',
    icon: 'MessageCircle',
    placeholder: '123456:ABC-DEF...'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid API Key',
    description: 'Для отправки email',
    value: '',
    icon: 'Mail',
    placeholder: 'SG...'
  }
];

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('api_keys');
    if (saved) {
      setApiKeys(JSON.parse(saved));
    } else {
      setApiKeys(DEFAULT_API_KEYS);
    }
  }, []);

  const saveKeys = (keys: ApiKey[]) => {
    localStorage.setItem('api_keys', JSON.stringify(keys));
    setApiKeys(keys);
  };

  const updateKey = (id: string, value: string) => {
    const updated = apiKeys.map(key => 
      key.id === id ? { ...key, value } : key
    );
    saveKeys(updated);
    setEditingId(null);
    toast({
      title: 'API ключ сохранён',
      description: 'Ключ успешно обновлён в локальном хранилище'
    });
  };

  const addCustomKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название ключа',
        variant: 'destructive'
      });
      return;
    }

    const newKey: ApiKey = {
      id: `custom_${Date.now()}`,
      name: newKeyName,
      description: 'Пользовательский API ключ',
      value: newKeyValue,
      icon: 'Key',
      placeholder: 'Ваш API ключ'
    };

    saveKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNewKeyValue('');
    toast({
      title: 'Ключ добавлен',
      description: `${newKeyName} успешно добавлен`
    });
  };

  const deleteKey = (id: string) => {
    const updated = apiKeys.filter(key => key.id !== id);
    saveKeys(updated);
    toast({
      title: 'Ключ удалён',
      description: 'API ключ удалён из хранилища'
    });
  };

  const clearKey = (id: string) => {
    updateKey(id, '');
  };

  const exportKeys = () => {
    const dataStr = JSON.stringify(apiKeys, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'api_keys.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({
      title: 'Экспорт завершён',
      description: 'Ключи сохранены в файл'
    });
  };

  const importKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveKeys(imported);
        toast({
          title: 'Импорт завершён',
          description: `Загружено ${imported.length} ключей`
        });
      } catch (error) {
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось прочитать файл',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  const maskKey = (value: string) => {
    if (!value) return 'Не задан';
    if (value.length < 8) return '••••••';
    return value.substring(0, 4) + '••••' + value.substring(value.length - 4);
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Icon name="Key" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#34495E] dark:text-white">
              Управление API ключами
            </h3>
            <p className="text-sm text-[#34495E]/60 dark:text-white/60">
              {apiKeys.filter(k => k.value).length} из {apiKeys.length} ключей настроено
            </p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={24} 
          className="text-[#34495E] dark:text-white"
        />
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={exportKeys} variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
            <label htmlFor="import-keys">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Импорт
                </span>
              </Button>
              <input 
                id="import-keys"
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={importKeys}
              />
            </label>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div 
                key={key.id}
                className="p-4 rounded-lg border border-[#34495E]/10 dark:border-white/10 bg-[#34495E]/5 dark:bg-white/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon name={key.icon} size={20} className="text-[#4A90E2]" />
                    <div>
                      <div className="font-semibold text-[#34495E] dark:text-white">
                        {key.name}
                      </div>
                      <div className="text-xs text-[#34495E]/60 dark:text-white/60">
                        {key.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {key.value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => clearKey(key.id)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                    {key.id.startsWith('custom_') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteKey(key.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {editingId === key.id ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="password"
                      defaultValue={key.value}
                      placeholder={key.placeholder}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateKey(key.id, e.currentTarget.value);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        updateKey(key.id, input.value);
                      }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Отмена
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <code className="text-sm text-[#34495E]/70 dark:text-white/70 font-mono">
                      {maskKey(key.value)}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(key.id)}
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Изменить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#34495E]/10 dark:border-white/10">
            <h4 className="font-semibold text-[#34495E] dark:text-white mb-3">
              Добавить свой ключ
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-key-name">Название</Label>
                <Input
                  id="new-key-name"
                  placeholder="Например: My Custom API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-key-value">API ключ</Label>
                <Input
                  id="new-key-value"
                  type="password"
                  placeholder="Ваш API ключ"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                />
              </div>
              <Button onClick={addCustomKey} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ключ
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Безопасность:</strong> Ключи хранятся локально в браузере и не отправляются на сервер.
                Используйте экспорт/импорт для переноса между устройствами.
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
