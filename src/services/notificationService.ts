interface NotificationSettings {
  email: string;
  telegram: string;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  pollenHigh: boolean;
  pollenMedium: boolean;
  pollenTypes: {
    birch: boolean;
    grass: boolean;
    ragweed: boolean;
    tree: boolean;
    weed: boolean;
  };
  weatherAlert: boolean;
  precipitationEnabled: boolean;
  minPrecipitation: number;
  pressureEnabled: boolean;
  minPressure: number;
  maxPressure: number;
  dailyForecast: boolean;
  dailyForecastTime: string;
}

interface WeatherData {
  temp?: number;
  description?: string;
  wind_speed?: number;
  precipitation?: number;
  pressure?: number;
}

interface AirQualityData {
  pollen?: {
    birch_pollen?: number;
    grass_pollen?: number;
    ragweed_pollen?: number;
    tree_pollen?: number;
    weed_pollen?: number;
  };
}

const NOTIFICATIONS_API = 'https://functions.poehali.dev/69d98fba-a11e-4a25-bab8-02070f305ce1';

export class NotificationService {
  private settings: NotificationSettings | null = null;
  private lastNotificationTime: { [key: string]: number } = {};
  private readonly NOTIFICATION_COOLDOWN = 3600000;

  constructor() {
    this.loadSettings();
    this.setupAutoCheck();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('weatherNotifications');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
  }

  private setupAutoCheck(): void {
    setInterval(() => {
      this.loadSettings();
    }, 60000);
  }

  private canSendNotification(type: string): boolean {
    const lastTime = this.lastNotificationTime[type] || 0;
    const now = Date.now();
    return (now - lastTime) >= this.NOTIFICATION_COOLDOWN;
  }

  private markNotificationSent(type: string): void {
    this.lastNotificationTime[type] = Date.now();
  }

  private async sendNotification(message: string, type: string): Promise<void> {
    if (!this.settings) return;
    if (!this.canSendNotification(type)) return;

    if (!this.settings.emailEnabled && !this.settings.telegramEnabled) return;

    try {
      await fetch(NOTIFICATIONS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.settings.emailEnabled ? this.settings.email : '',
          telegram: this.settings.telegramEnabled ? this.settings.telegram : '',
          message,
          type
        })
      });

      this.markNotificationSent(type);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async checkPollenLevels(airQualityData: AirQualityData): Promise<void> {
    if (!this.settings) return;
    if (!this.settings.pollenHigh && !this.settings.pollenMedium) return;

    const pollen = airQualityData.pollen;
    if (!pollen) return;

    const pollenTypes = [
      { id: 'birch', value: pollen.birch_pollen || 0, label: 'Берёза' },
      { id: 'grass', value: pollen.grass_pollen || 0, label: 'Злаковые травы' },
      { id: 'ragweed', value: pollen.ragweed_pollen || 0, label: 'Амброзия' },
      { id: 'tree', value: pollen.tree_pollen || 0, label: 'Деревья' },
      { id: 'weed', value: pollen.weed_pollen || 0, label: 'Сорные травы' }
    ];

    for (const pollenType of pollenTypes) {
      const isEnabled = this.settings.pollenTypes[pollenType.id as keyof typeof this.settings.pollenTypes];
      if (!isEnabled) continue;

      if (this.settings.pollenHigh && pollenType.value > 9.0) {
        await this.sendNotification(
          `⚠️ ВЫСОКИЙ уровень пыльцы!\n\n${pollenType.label}: ${pollenType.value.toFixed(1)}\n\nРекомендуется оставаться в помещении и принять антигистаминные препараты.`,
          'pollen_high'
        );
      } else if (this.settings.pollenMedium && pollenType.value >= 4.0 && pollenType.value <= 9.0) {
        await this.sendNotification(
          `⚡ Средний уровень пыльцы\n\n${pollenType.label}: ${pollenType.value.toFixed(1)}\n\nБудьте внимательны при выходе на улицу.`,
          'pollen_medium'
        );
      }
    }
  }

  async checkWeatherConditions(weatherData: WeatherData): Promise<void> {
    if (!this.settings) return;

    if (this.settings.precipitationEnabled && weatherData.precipitation !== undefined) {
      if (weatherData.precipitation >= this.settings.minPrecipitation) {
        const intensity = 
          weatherData.precipitation < 1 ? 'Слабый дождь' :
          weatherData.precipitation < 3 ? 'Умеренный дождь' :
          weatherData.precipitation < 6 ? 'Сильный дождь' : 'Очень сильный дождь';
        
        await this.sendNotification(
          `🌧️ Осадки!\n\n${intensity}\nКоличество: ${weatherData.precipitation.toFixed(1)} мм\n\nВозьмите с собой зонт!`,
          'precipitation'
        );
      }
    }

    if (this.settings.pressureEnabled && weatherData.pressure !== undefined) {
      if (weatherData.pressure < this.settings.minPressure || weatherData.pressure > this.settings.maxPressure) {
        await this.sendNotification(
          `🌡️ Изменение давления!\n\nТекущее давление: ${weatherData.pressure} мм рт.ст.\nВаш диапазон: ${this.settings.minPressure}-${this.settings.maxPressure} мм рт.ст.\n\nМогут быть головные боли и недомогание.`,
          'pressure'
        );
      }
    }

    if (this.settings.weatherAlert) {
      const description = weatherData.description?.toLowerCase() || '';
      const windSpeed = weatherData.wind_speed || 0;

      if (windSpeed > 15 || 
          description.includes('storm') || 
          description.includes('hurricane') ||
          description.includes('tornado') ||
          description.includes('blizzard')) {
        await this.sendNotification(
          `🌪️ ПОГОДНОЕ ПРЕДУПРЕЖДЕНИЕ!\n\n${weatherData.description}\nСкорость ветра: ${windSpeed} м/с\n\nОставайтесь в безопасности!`,
          'weather_alert'
        );
      }
    }
  }

  async checkAllConditions(weatherData: WeatherData, airQualityData: AirQualityData): Promise<void> {
    await this.checkWeatherConditions(weatherData);
    await this.checkPollenLevels(airQualityData);
  }

  async sendDailyForecast(forecastText: string): Promise<void> {
    if (!this.settings?.dailyForecast) return;

    await this.sendNotification(
      `🌤️ Прогноз на сегодня\n\n${forecastText}`,
      'daily_forecast'
    );
  }
}

export const notificationService = new NotificationService();
