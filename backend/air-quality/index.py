"""
Business: Get air quality and pollen forecast data
Args: event with httpMethod, queryStringParameters (lat, lon)
Returns: HTTP response with air quality index and allergen levels
"""

import json
import urllib.request
from typing import Dict, Any

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
    lat = params.get('lat', 55.7558)
    lon = params.get('lon', 37.6173)
    
    try:
        api_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&hourly=pm10,pm2_5,alder_pollen,birch_pollen,grass_pollen,ragweed_pollen,mugwort_pollen,olive_pollen&timezone=auto&forecast_days=7"
        
        with urllib.request.urlopen(api_url) as response:
            data = json.loads(response.read().decode())
        
        current = data.get('current', {})
        hourly = data.get('hourly', {})
        
        aqi = current.get('european_aqi', 0)
        aqi_level = 'Отличное'
        aqi_color = 'green'
        
        if aqi > 100:
            aqi_level = 'Очень плохое'
            aqi_color = 'purple'
        elif aqi > 75:
            aqi_level = 'Плохое'
            aqi_color = 'red'
        elif aqi > 50:
            aqi_level = 'Умеренное'
            aqi_color = 'orange'
        elif aqi > 25:
            aqi_level = 'Удовлетворительное'
            aqi_color = 'yellow'
        
        def get_pollen_level(value):
            if value is None or value == 0:
                return {'level': 'Нет', 'risk': 'low', 'value': 0}
            elif value < 20:
                return {'level': 'Низкий', 'risk': 'low', 'value': value}
            elif value < 50:
                return {'level': 'Средний', 'risk': 'medium', 'value': value}
            elif value < 100:
                return {'level': 'Высокий', 'risk': 'high', 'value': value}
            else:
                return {'level': 'Очень высокий', 'risk': 'very_high', 'value': value}
        
        allergens = {
            'alder': {
                'name': 'Ольха',
                'icon': 'Trees',
                'bloomPeriod': 'март-апрель',
                **get_pollen_level(current.get('alder_pollen', 0))
            },
            'birch': {
                'name': 'Берёза',
                'icon': 'TreeDeciduous',
                'bloomPeriod': 'апрель-май',
                **get_pollen_level(current.get('birch_pollen', 0))
            },
            'grass': {
                'name': 'Злаки',
                'icon': 'Flower2',
                'bloomPeriod': 'май-август',
                **get_pollen_level(current.get('grass_pollen', 0))
            },
            'olive': {
                'name': 'Олива',
                'icon': 'Apple',
                'bloomPeriod': 'май-июнь',
                **get_pollen_level(current.get('olive_pollen', 0))
            },
            'mugwort': {
                'name': 'Полынь',
                'icon': 'Sprout',
                'bloomPeriod': 'июль-сентябрь',
                **get_pollen_level(current.get('mugwort_pollen', 0))
            },
            'ragweed': {
                'name': 'Амброзия',
                'icon': 'Leaf',
                'bloomPeriod': 'август-октябрь',
                **get_pollen_level(current.get('ragweed_pollen', 0))
            }
        }
        
        hourly_forecast = []
        if hourly.get('time'):
            time_list = hourly['time'][:48] if len(hourly['time']) > 48 else hourly['time']
            for i, time in enumerate(time_list):
                item = {'time': time}
                
                alder_list = hourly.get('alder_pollen', [])
                birch_list = hourly.get('birch_pollen', [])
                grass_list = hourly.get('grass_pollen', [])
                mugwort_list = hourly.get('mugwort_pollen', [])
                olive_list = hourly.get('olive_pollen', [])
                ragweed_list = hourly.get('ragweed_pollen', [])
                pm25_list = hourly.get('pm2_5', [])
                pm10_list = hourly.get('pm10', [])
                
                item['alder'] = alder_list[i] if i < len(alder_list) else 0
                item['birch'] = birch_list[i] if i < len(birch_list) else 0
                item['grass'] = grass_list[i] if i < len(grass_list) else 0
                item['mugwort'] = mugwort_list[i] if i < len(mugwort_list) else 0
                item['olive'] = olive_list[i] if i < len(olive_list) else 0
                item['ragweed'] = ragweed_list[i] if i < len(ragweed_list) else 0
                item['pm25'] = pm25_list[i] if i < len(pm25_list) else 0
                item['pm10'] = pm10_list[i] if i < len(pm10_list) else 0
                
                hourly_forecast.append(item)
        
        result = {
            'aqi': {
                'value': round(aqi) if aqi else 0,
                'level': aqi_level,
                'color': aqi_color
            },
            'pollutants': {
                'pm25': round(current.get('pm2_5', 0), 1),
                'pm10': round(current.get('pm10', 0), 1),
                'no2': round(current.get('nitrogen_dioxide', 0), 1),
                'o3': round(current.get('ozone', 0), 1),
                'co': round(current.get('carbon_monoxide', 0), 0),
                'so2': round(current.get('sulphur_dioxide', 0), 1),
                'dust': round(current.get('dust', 0), 1),
                'ammonia': round(current.get('ammonia', 0), 1)
            },
            'allergens': allergens,
            'hourlyForecast': hourly_forecast,
            'uv_index': current.get('uv_index', 0),
            'dust': current.get('dust', 0)
        }
        
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