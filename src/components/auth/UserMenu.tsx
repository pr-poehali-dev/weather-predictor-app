import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onSaveSettings: (settings: any) => void;
}

export default function UserMenu({ user, onLogout, onSaveSettings }: UserMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('weatherUser');
    onLogout();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/95 dark:bg-white text-[#34495E] hover:bg-white backdrop-blur-sm"
            title={user.isGuest ? 'Гость' : user.first_name}
          >
            <Icon name={user.isGuest ? "User" : "UserCircle"} size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.first_name}</p>
              {user.username && (
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              )}
              {user.isGuest && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Режим гостя</p>
              )}
              {user.is_admin && !user.isGuest && (
                <p className="text-xs text-green-600 dark:text-green-400">Администратор</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {!user.isGuest && (
            <>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </DropdownMenuItem>
              
              {user.is_admin && (
                <DropdownMenuItem onClick={() => setShowAdmin(true)}>
                  <Icon name="Shield" size={16} className="mr-2" />
                  Админ-панель
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
            <Icon name="LogOut" size={16} className="mr-2" />
            {user.isGuest ? 'Выйти из режима гостя' : 'Выйти'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки пользователя</DialogTitle>
            <DialogDescription>
              Управление вашими личными настройками
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Уведомления о погоде</Label>
              <Switch
                id="notifications"
                defaultChecked={user.settings?.notifications_enabled ?? true}
                onCheckedChange={(checked) => {
                  onSaveSettings({ ...user.settings, notifications_enabled: checked });
                }}
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                <Icon name="Info" size={16} className="inline mr-2" />
                Ваши настройки автоматически синхронизируются между устройствами
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {user.is_admin && (
        <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Админ-панель</DialogTitle>
              <DialogDescription>
                Управление системой и пользователями
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Icon name="Users" size={24} />
                  <span className="text-sm">Пользователи</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Icon name="Bell" size={24} />
                  <span className="text-sm">Уведомления</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Icon name="Database" size={24} />
                  <span className="text-sm">База данных</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Icon name="BarChart" size={24} />
                  <span className="text-sm">Статистика</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
