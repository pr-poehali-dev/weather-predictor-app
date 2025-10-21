"""
Business: Get real weather data for a city using Open-Meteo API
Args: event with httpMethod, queryStringParameters (city, lat, lon)
Returns: HTTP response with weather data including temperature, conditions, sun times
"""

import json
import urllib.request
import urllib.parse
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
    
    lat = params.get('lat', coords['lat'])
    lon = params.get('lon', coords['lon'])
    
    try:
        api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=10"
        
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
            'sun': {
                'sunrise': daily.get('sunrise', [])[0] if daily.get('sunrise') else '',
                'sunset': daily.get('sunset', [])[0] if daily.get('sunset') else ''
            }
        }
        
        for i in range(min(24, len(hourly.get('time', [])))):
            time_str = hourly['time'][i]
            hour = datetime.fromisoformat(time_str).strftime('%H:%M')
            weather_code = hourly.get('weather_code', [])[i] if i < len(hourly.get('weather_code', [])) else 0
            
            result['hourly'].append({
                'time': hour,
                'temp': round(hourly.get('temperature_2m', [])[i]) if i < len(hourly.get('temperature_2m', [])) else 0,
                'icon': weather_icons.get(weather_code, 'Cloud'),
                'precip': hourly.get('precipitation_probability', [])[i] if i < len(hourly.get('precipitation_probability', [])) else 0
            })
        
        days = ['Сегодня', 'Завтра', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for i in range(min(10, len(daily.get('time', [])))):
            weather_code = daily.get('weather_code', [])[i] if i < len(daily.get('weather_code', [])) else 0
            
            result['daily'].append({
                'day': days[i] if i < len(days) else daily['time'][i],
                'high': round(daily.get('temperature_2m_max', [])[i]) if i < len(daily.get('temperature_2m_max', [])) else 0,
                'low': round(daily.get('temperature_2m_min', [])[i]) if i < len(daily.get('temperature_2m_min', [])) else 0,
                'icon': weather_icons.get(weather_code, 'Cloud'),
                'precip': daily.get('precipitation_probability_max', [])[i] if i < len(daily.get('precipitation_probability_max', [])) else 0,
                'condition': weather_codes.get(weather_code, 'Неизвестно')
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
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
