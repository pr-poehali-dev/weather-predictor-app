import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ApiKeySettingsProps {
  isAdmin: boolean;
}

export default function ApiKeySettings({ isAdmin }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const { toast } = useToast();
  
  if (!isAdmin) {
    return null;
  }

  useEffect(() => {
    const saved = localStorage.getItem('weather_api_key');
    if (saved) {
      setApiKey(saved);
      setTempKey(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('weather_api_key', tempKey);
    setApiKey(tempKey);
    setIsEditing(false);
    toast({
      title: 'API ключ сохранён',
      description: 'Перезагрузите страницу чтобы использовать новый ключ'
    });
  };

  const handleClear = () => {
    localStorage.removeItem('weather_api_key');
    setApiKey('');
    setTempKey('');
    setIsEditing(false);
    toast({
      title: 'API ключ удалён',
      description: 'Используется демо версия'
    });
  };

  const maskKey = (key: string) => {
    if (!key) return 'Не задан';
    if (key.length < 8) return '••••••';
    return key.substring(0, 4) + '••••' + key.substring(key.length - 4);
  };

  return (
    <Card className="p-4 md:p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Icon name="Key" size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-[#34495E] dark:text-white">
              API ключ для погоды
            </h3>
            <p className="text-xs md:text-sm text-[#34495E]/60 dark:text-white/60">
              {apiKey ? 'Ваш ключ настроен' : 'Используется демо версия'}
            </p>
            
            {!isEditing && (
              <div className="mt-2">
                <code className="text-xs md:text-sm text-[#34495E]/70 dark:text-white/70 font-mono">
                  {maskKey(apiKey)}
                </code>
              </div>
            )}

            {isEditing && (
              <div className="mt-3 space-y-2">
                <Input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Вставьте ваш API ключ от OpenWeatherMap"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Icon name="Check" size={14} className="mr-1" />
                    Сохранить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setTempKey(apiKey);
                  }}>
                    Отмена
                  </Button>
                  {apiKey && (
                    <Button size="sm" variant="destructive" onClick={handleClear}>
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Icon name="Edit" size={14} className="mr-1" />
            {apiKey ? 'Изменить' : 'Настроить'}
          </Button>
        )}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="mb-1"><strong>Где взять ключ:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Зарегистрируйтесь на <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">openweathermap.org</a></li>
              <li>Создайте API ключ в личном кабинете</li>
              <li>Вставьте его сюда (хранится локально в браузере)</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}