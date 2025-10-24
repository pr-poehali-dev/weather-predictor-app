import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const NOTIFICATIONS_API = 'https://functions.poehali.dev/69d98fba-a11e-4a25-bab8-02070f305ce1';

export default function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: '',
    telegram: '',
    emailEnabled: false,
    telegramEnabled: false,
    pollenHigh: true,
    pollenMedium: false,
    weatherAlert: true,
    dailyForecast: false,
    dailyForecastTime: '08:00'
  });

  useEffect(() => {
    const saved = localStorage.getItem('weatherNotifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

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
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
          <Icon name="Bell" size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#34495E]">Уведомления</h3>
          <p className="text-sm text-[#34495E]/60">Настройте оповещения о погоде и аллергенах</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <Icon name="Mail" size={20} className="text-[#4A90E2]" />
              <Label htmlFor="email-notifications" className="font-medium text-[#34495E]">
                Email уведомления
              </Label>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
            />
          </div>

          {settings.emailEnabled && (
            <div className="ml-4 pl-4 border-l-2 border-blue-200">
              <Input
                type="email"
                placeholder="your@email.com"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="max-w-md"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#98D8C8]/30 to-[#4A90E2]/30">
            <div className="flex items-center gap-3">
              <Icon name="Send" size={20} className="text-[#4A90E2]" />
              <Label htmlFor="telegram-notifications" className="font-medium text-[#34495E]">
                Telegram уведомления
              </Label>
            </div>
            <Switch
              id="telegram-notifications"
              checked={settings.telegramEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, telegramEnabled: checked })}
            />
          </div>

          {settings.telegramEnabled && (
            <div className="ml-4 pl-4 border-l-2 border-[#98D8C8] space-y-3">
              <Input
                type="text"
                placeholder="@username или Chat ID"
                value={settings.telegram}
                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                className="max-w-md"
              />
              
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-[#34495E] mb-2">
                  🤖 Настройте уведомления через бота:
                </p>
                <ol className="text-xs text-[#34495E]/70 space-y-1 ml-4 list-decimal">
                  <li>Напишите боту @ВашБотName команду /start</li>
                  <li>Бот пришлёт ваш Chat ID — скопируйте его сюда</li>
                  <li>Или используйте команды бота: /subscribe, /email</li>
                </ol>
                <p className="text-xs text-[#34495E]/50 mt-2">
                  💡 Можно указать @username (например @ivan) или Chat ID (123456789)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#34495E]/10">
          <h4 className="font-semibold text-[#34495E] mb-4">Типы уведомлений</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={18} className="text-red-500" />
                <div>
                  <div className="font-medium text-[#34495E]">Высокий уровень пыльцы</div>
                  <div className="text-xs text-[#34495E]/60">Индекс {'>'} 9.0</div>
                </div>
              </div>
              <Switch
                checked={settings.pollenHigh}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenHigh: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-yellow-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={18} className="text-yellow-600" />
                <div>
                  <div className="font-medium text-[#34495E]">Средний уровень пыльцы</div>
                  <div className="text-xs text-[#34495E]/60">Индекс 4.0-9.0</div>
                </div>
              </div>
              <Switch
                checked={settings.pollenMedium}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenMedium: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="CloudRain" size={18} className="text-orange-600" />
                <div>
                  <div className="font-medium text-[#34495E]">Экстремальная погода</div>
                  <div className="text-xs text-[#34495E]/60">Штормы, метели, ураганы</div>
                </div>
              </div>
              <Switch
                checked={settings.weatherAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, weatherAlert: checked })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon name="Calendar" size={18} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-[#34495E]">Ежедневный прогноз</div>
                    <div className="text-xs text-[#34495E]/60">Выберите время получения прогноза</div>
                  </div>
                </div>
                <Switch
                  checked={settings.dailyForecast}
                  onCheckedChange={(checked) => setSettings({ ...settings, dailyForecast: checked })}
                />
              </div>
              {settings.dailyForecast && (
                <div className="ml-12 flex items-center gap-3">
                  <Label htmlFor="forecast-time" className="text-sm text-[#34495E]">Время:</Label>
                  <Input
                    id="forecast-time"
                    type="time"
                    value={settings.dailyForecastTime}
                    onChange={(e) => setSettings({ ...settings, dailyForecastTime: e.target.value })}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[#4A90E2] to-[#98D8C8] hover:opacity-90"
          >
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить настройки
          </Button>
          <Button 
            onClick={handleTestNotification}
            variant="outline"
            className="flex-1"
          >
            <Icon name="Send" size={18} className="mr-2" />
            Тест уведомления
          </Button>
        </div>
      </div>
    </Card>
  );
}