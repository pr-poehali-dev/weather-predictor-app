import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import NotificationChannels from './NotificationChannels';
import PollenNotifications from './PollenNotifications';
import WeatherNotifications from './WeatherNotifications';

const NOTIFICATIONS_API = 'https://functions.poehali.dev/69d98fba-a11e-4a25-bab8-02070f305ce1';
const TELEGRAM_BOT_API = 'https://functions.poehali.dev/f03fce2f-ec26-44b9-8491-2ec4d99f6a01';
const TELEGRAM_BOT_USERNAME = 'WolfWeatherForecaste_Bot';

export default function NotificationSettings() {
  const { toast } = useToast();
  const [botStatus, setBotStatus] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking');
  const [botInfo, setBotInfo] = useState<{ username?: string; name?: string } | null>(null);
  const [settings, setSettings] = useState({
    email: '',
    telegram: '',
    emailEnabled: false,
    telegramEnabled: false,
    
    pollenHigh: true,
    pollenMedium: false,
    pollenTypes: {
      birch: true,
      grass: true,
      ragweed: true,
      tree: false,
      weed: false,
    },
    
    weatherAlert: true,
    precipitationEnabled: false,
    minPrecipitation: 0.1,
    
    pressureEnabled: false,
    minPressure: 730,
    maxPressure: 770,
    
    dailyForecast: false,
    dailyForecastTime: '08:00'
  });

  useEffect(() => {
    checkBotStatus();
    const saved = localStorage.getItem('weatherNotifications');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      setSettings({
        ...settings,
        ...parsedSettings,
        pollenTypes: parsedSettings.pollenTypes || settings.pollenTypes,
      });
    }
  }, []);

  const setupTelegramWebhook = async () => {
    try {
      const response = await fetch(`${TELEGRAM_BOT_API}?action=set-webhook`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Webhook настроен',
          description: 'Telegram бот готов к работе!',
        });
        checkBotStatus();
      } else {
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось настроить webhook',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось подключиться к боту',
        variant: 'destructive'
      });
    }
  };

  const checkBotStatus = async () => {
    setBotStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${NOTIFICATIONS_API}?action=bot-status`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.active) {
        setBotStatus('active');
        setBotInfo(data.bot);
      } else {
        setBotStatus('inactive');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setBotStatus('error');
      } else {
        setBotStatus('inactive');
      }
    }
  };

  const handleSave = () => {
    if (settings.emailEnabled && !settings.email) {
      toast({
        title: '❌ Ошибка',
        description: 'Введите email для уведомлений',
        variant: 'destructive'
      });
      return;
    }

    if (settings.telegramEnabled && !settings.telegram) {
      toast({
        title: '❌ Ошибка',
        description: 'Введите Telegram ID для уведомлений',
        variant: 'destructive'
      });
      return;
    }

    localStorage.setItem('weatherNotifications', JSON.stringify(settings));
    
    toast({
      title: '✅ Настройки сохранены',
      description: 'Уведомления настроены успешно!',
    });
  };

  const handleTestNotification = async () => {
    if (!settings.emailEnabled && !settings.telegramEnabled) {
      toast({
        title: '⚠️ Внимание',
        description: 'Включите хотя бы один способ уведомлений',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(NOTIFICATIONS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings.emailEnabled ? settings.email : '',
          telegram: settings.telegramEnabled ? settings.telegram : '',
          message: '🧪 Тестовое уведомление от Волк-синоптик!\n\nЕсли вы видите это сообщение, уведомления работают корректно.',
          type: 'info'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '✅ Тест успешен',
          description: 'Уведомление отправлено! Проверьте почту или Telegram.',
        });
      } else {
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось отправить уведомление',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    }
  };

  const getStatusDisplay = () => {
    switch (botStatus) {
      case 'checking':
        return { color: 'bg-gray-400', text: 'Проверка...', icon: 'RefreshCw' };
      case 'active':
        return { color: 'bg-green-500', text: `Бот активен${botInfo?.username ? ` (@${botInfo.username})` : ''}`, icon: 'CheckCircle2' };
      case 'inactive':
        return { color: 'bg-yellow-500', text: 'Бот не настроен', icon: 'AlertCircle' };
      case 'error':
        return { color: 'bg-red-500', text: 'Ошибка подключения', icon: 'XCircle' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
            <Icon name="Bell" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#34495E] dark:text-white/90">Уведомления</h3>
            <p className="text-sm text-[#34495E]/60 dark:text-white/60">Настройте оповещения о погоде и аллергенах</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a3f54] border-2 border-gray-200 dark:border-gray-600">
            <div className={`w-2 h-2 rounded-full ${statusDisplay.color} ${botStatus === 'checking' ? 'animate-pulse' : ''}`} />
            <Icon name={statusDisplay.icon} size={14} className="text-[#34495E]/70 dark:text-white/70" />
            <span className="text-xs font-medium text-[#34495E] dark:text-white/90">{statusDisplay.text}</span>
            <button 
              onClick={checkBotStatus}
              className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Обновить статус"
            >
              <Icon name="RefreshCw" size={12} className="text-[#34495E]/50 dark:text-white/50" />
            </button>
          </div>
          {botStatus === 'inactive' && (
            <Button 
              onClick={setupTelegramWebhook} 
              size="sm"
              className="bg-gradient-to-r from-[#4A90E2] to-[#98D8C8] hover:opacity-90"
            >
              <Icon name="Zap" size={14} className="mr-1" />
              Активировать
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <NotificationChannels 
          settings={settings}
          onSettingsChange={setSettings}
          telegramBotUsername={TELEGRAM_BOT_USERNAME}
        />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <PollenNotifications 
            settings={settings}
            onSettingsChange={setSettings}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <WeatherNotifications 
            settings={settings}
            onSettingsChange={setSettings}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-[#4A90E2] to-[#98D8C8] hover:opacity-90">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки
          </Button>
          <Button onClick={handleTestNotification} variant="outline" className="dark:border-gray-600 dark:text-white/90 dark:hover:bg-[#2a3f54]">
            <Icon name="Send" size={16} className="mr-2" />
            Тест
          </Button>
        </div>
      </div>
    </Card>
  );
}