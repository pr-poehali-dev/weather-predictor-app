import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onAuthChange: (isAdmin: boolean) => void;
}

export default function AdminAuth({ onAuthChange }: AdminAuthProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAdmin(true);
      onAuthChange(true);
    }
  }, [onAuthChange]);

  const handleLogin = () => {
    setIsLoading(true);
    
    const adminPassword = localStorage.getItem('admin_password') || 'admin123';
    
    if (password === adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('admin_auth', 'true');
      onAuthChange(true);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в режим администратора'
      });
      setPassword('');
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_auth');
    onAuthChange(false);
    toast({
      title: 'Выход выполнен',
      description: 'Вы вышли из режима администратора'
    });
  };

  const handleChangePassword = () => {
    const newPassword = prompt('Введите новый пароль администратора:');
    if (newPassword && newPassword.length >= 6) {
      localStorage.setItem('admin_password', newPassword);
      toast({
        title: 'Пароль изменён',
        description: 'Новый пароль сохранён'
      });
    } else if (newPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть минимум 6 символов',
        variant: 'destructive'
      });
    }
  };

  if (isAdmin) {
    return (
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#34495E] dark:text-white">
                Режим администратора
              </div>
              <div className="text-xs text-[#34495E]/60 dark:text-white/60">
                У вас есть доступ к настройкам
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleChangePassword}>
              <Icon name="Lock" size={14} className="mr-1" />
              Сменить пароль
            </Button>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <Icon name="LogOut" size={14} className="mr-1" />
              Выйти
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700">
          <Icon name="Lock" size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[#34495E] dark:text-white mb-2">
            Вход для администратора
          </h3>
          <div className="flex gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Введите пароль"
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleLogin} disabled={isLoading || !password}>
              {isLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <>
                  <Icon name="LogIn" size={16} className="mr-1" />
                  Войти
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-[#34495E]/60 dark:text-white/60 mt-2">
            По умолчанию пароль: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </Card>
  );
}
