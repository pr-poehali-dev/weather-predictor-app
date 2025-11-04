import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const NOTIFICATIONS_API = 'https://functions.poehali.dev/69d98fba-a11e-4a25-bab8-02070f305ce1';
const TELEGRAM_BOT_USERNAME = 'WolfWeatherForecaste_Bot';

const POLLEN_TYPES = [
  { id: 'birch', label: 'Берёза', icon: 'TreeDeciduous' },
  { id: 'grass', label: 'Злаковые травы', icon: 'Wheat' },
  { id: 'ragweed', label: 'Амброзия', icon: 'Flower2' },
  { id: 'tree', label: 'Деревья', icon: 'Trees' },
  { id: 'weed', label: 'Сорные травы', icon: 'Sprout' },
];

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
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
            <Icon name="Bell" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#34495E]">Уведомления</h3>
            <p className="text-sm text-[#34495E]/60">Настройте оповещения о погоде и аллергенах</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-gray-200">
          <div className={`w-2 h-2 rounded-full ${statusDisplay.color} ${botStatus === 'checking' ? 'animate-pulse' : ''}`} />
          <Icon name={statusDisplay.icon} size={14} className="text-[#34495E]/70" />
          <span className="text-xs font-medium text-[#34495E]">{statusDisplay.text}</span>
          <button 
            onClick={checkBotStatus}
            className="ml-1 p-1 hover:bg-gray-100 rounded transition-colors"
            title="Обновить статус"
          >
            <Icon name="RefreshCw" size={12} className="text-[#34495E]/50" />
          </button>
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
            <div className="ml-4 pl-4 border-l-2 border-[#98D8C8] space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-[#34495E] mb-3 flex items-center gap-2">
                  <Icon name="Info" size={16} className="text-[#4A90E2]" />
                  <span className="font-medium">Как получить Telegram ID:</span>
                </p>
                <ol className="text-sm text-[#34495E]/80 space-y-2 ml-6 list-decimal">
                  <li>
                    Откройте бота{' '}
                    <a 
                      href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4A90E2] hover:underline font-medium"
                    >
                      @{TELEGRAM_BOT_USERNAME}
                    </a>
                  </li>
                  <li>Нажмите <strong>Start</strong> или отправьте команду <code className="px-1.5 py-0.5 bg-white rounded text-xs">/start</code></li>
                  <li>Бот пришлет ваш ID — скопируйте его и вставьте ниже</li>
                </ol>
              </div>
              
              <Input
                type="text"
                placeholder="Ваш Telegram ID (например: 123456789)"
                value={settings.telegram}
                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                className="max-w-md"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        <div className="space-y-4">
          <h4 className="font-semibold text-[#34495E] flex items-center gap-2">
            <Icon name="Settings" size={18} className="text-[#4A90E2]" />
            Условия для уведомлений
          </h4>

          <div className="space-y-3 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={18} className="text-amber-600" />
                <Label className="font-medium text-[#34495E]">Высокий уровень пыльцы</Label>
              </div>
              <Switch
                checked={settings.pollenHigh}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenHigh: checked })}
              />
            </div>
            <p className="text-xs text-[#34495E]/60 ml-6">Индекс {'>'} 9.0</p>
          </div>

          <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={18} className="text-yellow-600" />
                <Label className="font-medium text-[#34495E]">Средний уровень пыльцы</Label>
              </div>
              <Switch
                checked={settings.pollenMedium}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenMedium: checked })}
              />
            </div>
            <p className="text-xs text-[#34495E]/60 ml-6">Индекс 4.0–9.0</p>
          </div>

          {(settings.pollenHigh || settings.pollenMedium) && (
            <div className="ml-4 pl-4 border-l-2 border-amber-300 space-y-3">
              <p className="text-sm font-medium text-[#34495E] mb-2">Выберите аллергены:</p>
              <div className="grid grid-cols-1 gap-2">
                {POLLEN_TYPES.map((pollen) => (
                  <div 
                    key={pollen.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-amber-50 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={pollen.icon} size={16} className="text-amber-600" />
                      <span className="text-sm text-[#34495E]">{pollen.label}</span>
                    </div>
                    <Switch
                      checked={settings.pollenTypes[pollen.id as keyof typeof settings.pollenTypes]}
                      onCheckedChange={(checked) => 
                        setSettings({ 
                          ...settings, 
                          pollenTypes: { ...settings.pollenTypes, [pollen.id]: checked } 
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="CloudRain" size={18} className="text-blue-600" />
                <Label className="font-medium text-[#34495E]">Осадки</Label>
              </div>
              <Switch
                checked={settings.precipitationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, precipitationEnabled: checked })}
              />
            </div>
            
            {settings.precipitationEnabled && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#34495E]/70">Минимальное количество осадков:</span>
                  <span className="font-medium text-[#34495E]">{settings.minPrecipitation} мм</span>
                </div>
                <Slider
                  value={[settings.minPrecipitation]}
                  onValueChange={(value) => setSettings({ ...settings, minPrecipitation: value[0] })}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-[#34495E]/60">
                  {settings.minPrecipitation < 1 ? 'Слабый дождь' : 
                   settings.minPrecipitation < 3 ? 'Умеренный дождь' : 
                   settings.minPrecipitation < 6 ? 'Сильный дождь' : 'Очень сильный дождь'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Gauge" size={18} className="text-purple-600" />
                <Label className="font-medium text-[#34495E]">Атмосферное давление</Label>
              </div>
              <Switch
                checked={settings.pressureEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, pressureEnabled: checked })}
              />
            </div>
            
            {settings.pressureEnabled && (
              <div className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#34495E]/70">Минимальное давление:</span>
                    <span className="font-medium text-[#34495E]">{settings.minPressure} мм рт.ст.</span>
                  </div>
                  <Slider
                    value={[settings.minPressure]}
                    onValueChange={(value) => setSettings({ ...settings, minPressure: value[0] })}
                    min={700}
                    max={780}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#34495E]/70">Максимальное давление:</span>
                    <span className="font-medium text-[#34495E]">{settings.maxPressure} мм рт.ст.</span>
                  </div>
                  <Slider
                    value={[settings.maxPressure]}
                    onValueChange={(value) => setSettings({ ...settings, maxPressure: value[0] })}
                    min={700}
                    max={780}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <p className="text-xs text-[#34495E]/60 bg-white p-2 rounded border border-purple-200">
                  Уведомление придет, если давление выйдет за пределы {settings.minPressure}-{settings.maxPressure} мм рт.ст.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Cloud" size={18} className="text-red-600" />
                <Label className="font-medium text-[#34495E]">Экстремальная погода</Label>
              </div>
              <Switch
                checked={settings.weatherAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, weatherAlert: checked })}
              />
            </div>
            <p className="text-xs text-[#34495E]/60 ml-6">Штормы, метели, ураганы</p>
          </div>

          <div className="space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={18} className="text-green-600" />
                <Label className="font-medium text-[#34495E]">Ежедневный прогноз</Label>
              </div>
              <Switch
                checked={settings.dailyForecast}
                onCheckedChange={(checked) => setSettings({ ...settings, dailyForecast: checked })}
              />
            </div>
            
            {settings.dailyForecast && (
              <div className="ml-6 mt-3">
                <Label className="text-sm text-[#34495E]/70 mb-2 block">Время отправки:</Label>
                <Input
                  type="time"
                  value={settings.dailyForecastTime}
                  onChange={(e) => setSettings({ ...settings, dailyForecastTime: e.target.value })}
                  className="max-w-[150px]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
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
            className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10"
          >
            <Icon name="Send" size={18} className="mr-2" />
            Тест
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-[#34495E] flex items-start gap-2">
            <Icon name="Info" size={16} className="text-[#4A90E2] mt-0.5 flex-shrink-0" />
            <span>
              Уведомления работают автоматически. Вы получите оповещение, когда любое из выбранных условий будет выполнено.
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}