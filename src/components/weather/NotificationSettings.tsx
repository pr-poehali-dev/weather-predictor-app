import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import BotStatusBadge from './notifications/BotStatusBadge';
import EmailSettings from './notifications/EmailSettings';
import TelegramSettings from './notifications/TelegramSettings';
import PollenSettings from './notifications/PollenSettings';
import PrecipitationSettings from './notifications/PrecipitationSettings';
import PressureSettings from './notifications/PressureSettings';
import DailyForecastSettings from './notifications/DailyForecastSettings';

const NOTIFICATIONS_API = 'https://functions.poehali.dev/69d98fba-a11e-4a25-bab8-02070f305ce1';
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

  return (
    <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
            <Icon name="Bell" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#34495E] dark:text-white">Уведомления</h3>
            <p className="text-sm text-[#34495E]/60 dark:text-white/60">Настройте оповещения о погоде и аллергенах</p>
          </div>
        </div>
        
        <BotStatusBadge 
          status={botStatus} 
          botInfo={botInfo} 
          onRefresh={checkBotStatus} 
        />
      </div>

      <div className="space-y-6">
        <EmailSettings
          enabled={settings.emailEnabled}
          email={settings.email}
          onEnabledChange={(enabled) => setSettings({ ...settings, emailEnabled: enabled })}
          onEmailChange={(email) => setSettings({ ...settings, email })}
        />

        <TelegramSettings
          enabled={settings.telegramEnabled}
          telegramId={settings.telegram}
          botUsername={TELEGRAM_BOT_USERNAME}
          onEnabledChange={(enabled) => setSettings({ ...settings, telegramEnabled: enabled })}
          onTelegramIdChange={(id) => setSettings({ ...settings, telegram: id })}
        />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

        <div className="space-y-4">
          <h4 className="font-semibold text-[#34495E] dark:text-white flex items-center gap-2">
            <Icon name="Settings" size={18} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
            Условия для уведомлений
          </h4>

          <PollenSettings
            pollenHigh={settings.pollenHigh}
            pollenMedium={settings.pollenMedium}
            pollenTypes={settings.pollenTypes}
            onPollenHighChange={(enabled) => setSettings({ ...settings, pollenHigh: enabled })}
            onPollenMediumChange={(enabled) => setSettings({ ...settings, pollenMedium: enabled })}
            onPollenTypeChange={(id, enabled) => 
              setSettings({ 
                ...settings, 
                pollenTypes: { ...settings.pollenTypes, [id]: enabled } 
              })
            }
          />

          <PrecipitationSettings
            enabled={settings.precipitationEnabled}
            minPrecipitation={settings.minPrecipitation}
            onEnabledChange={(enabled) => setSettings({ ...settings, precipitationEnabled: enabled })}
            onMinPrecipitationChange={(value) => setSettings({ ...settings, minPrecipitation: value })}
          />

          <PressureSettings
            enabled={settings.pressureEnabled}
            minPressure={settings.minPressure}
            maxPressure={settings.maxPressure}
            onEnabledChange={(enabled) => setSettings({ ...settings, pressureEnabled: enabled })}
            onMinPressureChange={(value) => setSettings({ ...settings, minPressure: value })}
            onMaxPressureChange={(value) => setSettings({ ...settings, maxPressure: value })}
          />

          <DailyForecastSettings
            enabled={settings.dailyForecast}
            time={settings.dailyForecastTime}
            onEnabledChange={(enabled) => setSettings({ ...settings, dailyForecast: enabled })}
            onTimeChange={(time) => setSettings({ ...settings, dailyForecastTime: time })}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

        <div className="flex gap-3">
          <Button 
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[#4A90E2] to-[#98D8C8] hover:from-[#357ABD] hover:to-[#7AB8A8] text-white font-medium py-6"
          >
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить настройки
          </Button>
          
          <Button
            onClick={handleTestNotification}
            variant="outline"
            className="flex-1 border-2 border-[#4A90E2] text-[#4A90E2] dark:text-[#7EC8E3] hover:bg-[#4A90E2]/10 font-medium py-6"
          >
            <Icon name="Send" size={18} className="mr-2" />
            Отправить тестовое уведомление
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon name="Info" size={18} className="text-[#4A90E2] dark:text-[#7EC8E3] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#34495E] dark:text-white/80 space-y-2">
              <p className="font-medium">Как работают уведомления:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Уведомления отправляются при соблюдении выбранных условий</li>
                <li>Можно настроить несколько способов получения уведомлений</li>
                <li>Для Telegram нужно сначала запустить бота и получить свой ID</li>
                <li>Настройки сохраняются в браузере</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
