"""
Business: Get real weather data for a city using Open-Meteo API
Args: event with httpMethod, queryStringParameters (city, lat, lon)
Returns: HTTP response with weather data including temperature, conditions, sun times, hourly and daily forecasts
"""

import json
import urllib.request
import urllib.parse
import os
from datetime import datetime
from typing import Dict, Any, Optional

def get_coordinates(city: str) -> Optional[Dict[str, float]]:
    """Get coordinates for a city using geocoding"""
    cities_coords = {
        'москва': {'lat': 55.7558, 'lon': 37.6173},
        'санкт-петербург': {'lat': 59.9311, 'lon': 30.3609},
        'новосибирск': {'lat': 55.0084, 'lon': 82.9357},
        'екатеринбург': {'lat': 56.8389, 'lon': 60.6057},
        'moscow': {'lat': 55.7558, 'lon': 37.6173},
        'saint petersburg': {'lat': 59.9311, 'lon': 30.3609},
        'novosibirsk': {'lat': 55.0084, 'lon': 82.9357},
        'yekaterinburg': {'lat': 56.8389, 'lon': 60.6057}
    }
    return cities_coords.get(city.lower())

def fetch_openweathermap_data(lat: float, lon: float, api_key: str) -> Dict[str, Any]:
    """Fetch weather from OpenWeatherMap API"""
    try:
        current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ru"
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ru"
        
        with urllib.request.urlopen(current_url) as response:
            current_data = json.loads(response.read().decode())
        
        with urllib.request.urlopen(forecast_url) as response:
            forecast_data = json.loads(response.read().decode())
        
        weather_icons = {
            '01d': 'Sun', '01n': 'Moon', '02d': 'CloudSun', '02n': 'CloudMoon',
            '03d': 'Cloud', '03n': 'Cloud', '04d': 'Cloud', '04n': 'Cloud',
            '09d': 'CloudDrizzle', '09n': 'CloudDrizzle', '10d': 'CloudRain', '10n': 'CloudRain',
            '11d': 'CloudLightning', '11n': 'CloudLightning', '13d': 'CloudSnow', '13n': 'CloudSnow',
            '50d': 'Cloud', '50n': 'Cloud'
        }
        
        icon_code = current_data['weather'][0]['icon']
        
        result = {
            'current': {
                'temp': round(current_data['main']['temp']),
                'feelsLike': round(current_data['main']['feels_like']),
                'condition': current_data['weather'][0]['description'].capitalize(),
                'icon': weather_icons.get(icon_code, 'Cloud'),
                'humidity': current_data['main']['humidity'],
                'windSpeed': round(current_data['wind']['speed'] * 3.6),
                'windDirection': current_data['wind'].get('deg', 0),
                'pressure': current_data['main']['pressure'],
                'cloudCover': current_data['clouds']['all'],
                'precipitation': current_data.get('rain', {}).get('1h', 0)
            },
            'hourly': [],
            'daily': [],
            'history': [],
            'sun': {
                'sunrise': datetime.fromtimestamp(current_data['sys']['sunrise']).strftime('%H:%M'),
                'sunset': datetime.fromtimestamp(current_data['sys']['sunset']).strftime('%H:%M')
            }
        }
        
        for item in forecast_data['list'][:24]:
            icon_code = item['weather'][0]['icon']
            result['hourly'].append({
                'time': datetime.fromtimestamp(item['dt']).strftime('%H:%M'),
                'temp': round(item['main']['temp']),
                'icon': weather_icons.get(icon_code, 'Cloud'),
                'precip': item.get('pop', 0) * 100,
                'rain': round(item.get('rain', {}).get('3h', 0), 1),
                'snow': round(item.get('snow', {}).get('3h', 0), 1),
                'precipitation': round(item.get('rain', {}).get('3h', 0) + item.get('snow', {}).get('3h', 0), 1),
                'pressure': item['main']['pressure']
            })
        
        daily_groups = {}
        for item in forecast_data['list']:
            date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if date not in daily_groups:
                daily_groups[date] = []
            daily_groups[date].append(item)
        
        days = ['Сегодня', 'Завтра', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for idx, (date, items) in enumerate(list(daily_groups.items())[:10]):
            temps = [item['main']['temp'] for item in items]
            icon_code = items[len(items)//2]['weather'][0]['icon']
            
            result['daily'].append({
                'day': days[idx] if idx < len(days) else date,
                'high': round(max(temps)),
                'low': round(min(temps)),
                'icon': weather_icons.get(icon_code, 'Cloud'),
                'precip': round(max([item.get('pop', 0) for item in items]) * 100),
                'precipitation': round(sum([item.get('rain', {}).get('3h', 0) + item.get('snow', {}).get('3h', 0) for item in items]), 1),
                'rain': round(sum([item.get('rain', {}).get('3h', 0) for item in items]), 1),
                'snow': round(sum([item.get('snow', {}).get('3h', 0) for item in items]), 1),
                'condition': items[len(items)//2]['weather'][0]['description'].capitalize(),
                'pressureMax': round(max([item['main']['pressure'] for item in items])),
                'pressureMin': round(min([item['main']['pressure'] for item in items]))
            })
        
        return result
    except Exception as e:
        print(f"OpenWeatherMap API error: {e}")
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    city = params.get('city', 'Москва')
    
    coords = get_coordinates(city)
    if not coords:
        coords = {'lat': 55.7558, 'lon': 37.6173}
    
    lat = float(params.get('lat', coords['lat']))
    lon = float(params.get('lon', coords['lon']))
    
    weather_api_key = os.environ.get('WEATHER_API_KEY')
    
    if weather_api_key:
        result = fetch_openweathermap_data(lat, lon, weather_api_key)
        if result:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    try:
        api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,precipitation,rain,snowfall,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,rain_sum,snowfall_sum,pressure_msl_max,pressure_msl_min&timezone=auto&forecast_days=14&past_days=7"
        
        with urllib.request.urlopen(api_url) as response:
            data = json.loads(response.read().decode())
        
        current = data.get('current', {})
        hourly = data.get('hourly', {})
        daily = data.get('daily', {})
        
        weather_codes = {
            0: 'Ясно', 1: 'Малооблачно', 2: 'Переменная облачность', 3: 'Облачно',
            45: 'Туман', 48: 'Изморозь', 51: 'Легкая морось', 53: 'Морось', 55: 'Сильная морось',
            61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь',
            71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снег',
            80: 'Ливень', 81: 'Сильный ливень', 82: 'Очень сильный ливень',
            95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом'
        }
        
        weather_icons = {
            0: 'Sun', 1: 'CloudSun', 2: 'CloudSun', 3: 'Cloud',
            45: 'Cloud', 48: 'Cloud', 51: 'CloudDrizzle', 53: 'CloudDrizzle', 55: 'CloudDrizzle',
            61: 'CloudRain', 63: 'CloudRain', 65: 'CloudRain',
            71: 'CloudSnow', 73: 'CloudSnow', 75: 'CloudSnow',
            80: 'CloudRain', 81: 'CloudRain', 82: 'CloudRain',
            95: 'CloudLightning', 96: 'CloudLightning', 99: 'CloudLightning'
        }
        
        current_weather_code = current.get('weather_code', 0)
        
        result = {
            'city': city,
            'current': {
                'temp': round(current.get('temperature_2m', 0)),
                'feelsLike': round(current.get('apparent_temperature', 0)),
                'condition': weather_codes.get(current_weather_code, 'Неизвестно'),
                'icon': weather_icons.get(current_weather_code, 'Cloud'),
                'humidity': current.get('relative_humidity_2m', 0),
                'windSpeed': round(current.get('wind_speed_10m', 0)),
                'windDirection': current.get('wind_direction_10m', 0),
                'pressure': round(current.get('pressure_msl', 0)),
                'cloudCover': current.get('cloud_cover', 0),
                'precipitation': current.get('precipitation', 0)
            },
            'hourly': [],
            'daily': [],
            'history': [],
            'sun': {
                'sunrise': daily.get('sunrise', [])[0] if daily.get('sunrise') else '',
                'sunset': daily.get('sunset', [])[0] if daily.get('sunset') else ''
            }
        }
        
        hourly_times = hourly.get('time', [])
        total_hourly = len(hourly_times)
        
        for i in range(min(24, total_hourly)):
            time_str = hourly_times[i]
            hour = datetime.fromisoformat(time_str).strftime('%H:%M')
            weather_code = hourly.get('weather_code', [])[i] if i < len(hourly.get('weather_code', [])) else 0
            
            result['hourly'].append({
                'time': hour,
                'temp': round(hourly.get('temperature_2m', [])[i]) if i < len(hourly.get('temperature_2m', [])) else 0,
                'icon': weather_icons.get(weather_code, 'Cloud'),
                'precip': hourly.get('precipitation_probability', [])[i] if i < len(hourly.get('precipitation_probability', [])) else 0,
                'rain': round(hourly.get('rain', [])[i], 1) if i < len(hourly.get('rain', [])) else 0,
                'snow': round(hourly.get('snowfall', [])[i], 1) if i < len(hourly.get('snowfall', [])) else 0,
                'precipitation': round(hourly.get('precipitation', [])[i], 1) if i < len(hourly.get('precipitation', [])) else 0,
                'pressure': round(hourly.get('pressure_msl', [])[i]) if i < len(hourly.get('pressure_msl', [])) else 0
            })
        
        daily_times = daily.get('time', [])
        total_daily = len(daily_times)
        
        history_start = max(0, total_daily - 17)
        for i in range(history_start, total_daily - 10):
            if i >= 0:
                weather_code = daily.get('weather_code', [])[i] if i < len(daily.get('weather_code', [])) else 0
                date_str = daily_times[i]
                
                result['history'].append({
                    'date': date_str,
                    'high': round(daily.get('temperature_2m_max', [])[i]) if i < len(daily.get('temperature_2m_max', [])) else 0,
                    'low': round(daily.get('temperature_2m_min', [])[i]) if i < len(daily.get('temperature_2m_min', [])) else 0,
                    'icon': weather_icons.get(weather_code, 'Cloud'),
                    'precipitation': round(daily.get('precipitation_sum', [])[i], 1) if i < len(daily.get('precipitation_sum', [])) else 0,
                    'rain': round(daily.get('rain_sum', [])[i], 1) if i < len(daily.get('rain_sum', [])) else 0,
                    'snow': round(daily.get('snowfall_sum', [])[i], 1) if i < len(daily.get('snowfall_sum', [])) else 0,
                    'condition': weather_codes.get(weather_code, 'Неизвестно'),
                    'pressureMax': round(daily.get('pressure_msl_max', [])[i]) if i < len(daily.get('pressure_msl_max', [])) else 0,
                    'pressureMin': round(daily.get('pressure_msl_min', [])[i]) if i < len(daily.get('pressure_msl_min', [])) else 0
                })
        
        days = ['Сегодня', 'Завтра', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        forecast_start = max(0, total_daily - 14)
        for i in range(forecast_start, total_daily):
            weather_code = daily.get('weather_code', [])[i] if i < len(daily.get('weather_code', [])) else 0
            day_index = i - forecast_start
            
            result['daily'].append({
                'day': days[day_index] if day_index < len(days) else daily_times[i],
                'high': round(daily.get('temperature_2m_max', [])[i]) if i < len(daily.get('temperature_2m_max', [])) else 0,
                'low': round(daily.get('temperature_2m_min', [])[i]) if i < len(daily.get('temperature_2m_min', [])) else 0,
                'icon': weather_icons.get(weather_code, 'Cloud'),
                'precip': daily.get('precipitation_probability_max', [])[i] if i < len(daily.get('precipitation_probability_max', [])) else 0,
                'precipitation': round(daily.get('precipitation_sum', [])[i], 1) if i < len(daily.get('precipitation_sum', [])) else 0,
                'rain': round(daily.get('rain_sum', [])[i], 1) if i < len(daily.get('rain_sum', [])) else 0,
                'snow': round(daily.get('snowfall_sum', [])[i], 1) if i < len(daily.get('snowfall_sum', [])) else 0,
                'condition': weather_codes.get(weather_code, 'Неизвестно'),
                'pressureMax': round(daily.get('pressure_msl_max', [])[i]) if i < len(daily.get('pressure_msl_max', [])) else 0,
                'pressureMin': round(daily.get('pressure_msl_min', [])[i]) if i < len(daily.get('pressure_msl_min', [])) else 0
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }