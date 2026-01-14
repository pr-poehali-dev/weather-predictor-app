import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

interface TelegramAuthProps {
  onAuth: (user: any) => void;
}

export default function TelegramAuth({ onAuth }: TelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestMode = () => {
    const guestUser = {
      id: Date.now(),
      first_name: 'Гость',
      username: 'guest',
      is_admin: false,
      isGuest: true
    };
    
    localStorage.setItem('weatherUser', JSON.stringify(guestUser));
    onAuth(guestUser);
  };

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://functions.poehali.dev/f476f07c-1ebf-4e66-9df6-e95aeb8dbe4d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: {
            id: telegramUser.id,
            username: telegramUser.username || '',
            first_name: telegramUser.first_name
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      const userData = {
        ...data.user,
        settings: data.settings,
        isGuest: false
      };

      localStorage.setItem('weatherUser', JSON.stringify(userData));
      onAuth(userData);
    } catch (err: any) {
      setError(err.message);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    (window as any).onTelegramAuth = handleTelegramAuth;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#7EC8E3] to-[#98D8C8] dark:from-[#1a2332] dark:via-[#243447] dark:to-[#2a4556] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#7EC8E3]">
              <Icon name="CloudSun" size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#34495E] dark:text-white mb-2">Волк-синоптик</h1>
          <p className="text-[#34495E]/60 dark:text-white/60">Точный прогноз погоды и аллергенов</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-[#34495E]/80 dark:text-white/80 mb-4 text-center">
              Войдите через Telegram для сохранения настроек и уведомлений
            </p>
            
            <div id="telegram-login-container" className="flex justify-center mb-4">
              {/* Telegram Login Widget будет вставлен сюда */}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#34495E]/20 dark:border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#1e2936] px-2 text-[#34495E]/60 dark:text-white/60">или</span>
            </div>
          </div>

          <Button
            onClick={handleGuestMode}
            className="w-full bg-gradient-to-r from-[#98D8C8] to-[#7EC8E3] hover:from-[#7EC8E3] hover:to-[#4A90E2] text-white"
            size="lg"
          >
            <Icon name="User" size={20} className="mr-2" />
            Продолжить как гость
          </Button>

          <p className="text-xs text-[#34495E]/60 dark:text-white/60 text-center mt-4">
            В режиме гостя настройки сохраняются локально и не синхронизируются между устройствами
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[#34495E]/10 dark:border-white/10">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-[#34495E]/80 dark:text-white/80">
              <strong className="text-blue-700 dark:text-blue-300">Преимущества авторизации:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Синхронизация настроек между устройствами</li>
                <li>Персональные уведомления о погоде</li>
                <li>Сохранение избранных локаций</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
