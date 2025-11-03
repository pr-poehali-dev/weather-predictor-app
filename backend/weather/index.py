"""
Business: Get real weather data using Yandex Weather GraphQL API
Args: event with httpMethod, queryStringParameters (lat, lon)
Returns: HTTP response with weather data including temperature, conditions, humidity, wind
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
    lat = float(params.get('lat', 55.7558))
    lon = float(params.get('lon', 37.6173))
    
    graphql_query = {
        "query": """
        {
          weatherByPoint(request: {lat: %s, lon: %s}) {
            now {
              cloudiness
              humidity
              precType
              precStrength
              pressure
              temperature
              windSpeed
              windDirection
            }
          }
        }
        """ % (lat, lon)
    }
    
    try:
        req = urllib.request.Request(
            'https://api.weather.yandex.ru/graphql/query',
            data=json.dumps(graphql_query).encode(),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
        
        weather_data = data.get('data', {}).get('weatherByPoint', {}).get('now', {})
        
        prec_types = {
            0: 'Без осадков',
            1: 'Дождь',
            2: 'Дождь со снегом',
            3: 'Снег',
            4: 'Град'
        }
        
        prec_strength = {
            0: '',
            0.25: 'Слабые',
            0.5: 'Умеренные',
            0.75: 'Сильные',
            1.0: 'Очень сильные'
        }
        
        weather_icons = {
            0: 'Sun',
            1: 'CloudRain',
            2: 'CloudSnow',
            3: 'CloudSnow',
            4: 'CloudLightning'
        }
        
        cloudiness_map = {
            0: 'Ясно',
            0.25: 'Малооблачно',
            0.5: 'Облачно с прояснениями',
            0.75: 'Облачно',
            1.0: 'Пасмурно'
        }
        
        prec_type = weather_data.get('precType', 0)
        cloudiness = weather_data.get('cloudiness', 0)
        
        condition = cloudiness_map.get(cloudiness, 'Облачно')
        if prec_type > 0:
            strength = prec_strength.get(weather_data.get('precStrength', 0), '')
            prec_name = prec_types.get(prec_type, 'Осадки')
            condition = f"{strength} {prec_name}".strip() if strength else prec_name
        
        result = {
            'current': {
                'temp': round(weather_data.get('temperature', 0)),
                'condition': condition,
                'icon': weather_icons.get(prec_type, 'CloudSun' if cloudiness < 0.5 else 'Cloud'),
                'humidity': round(weather_data.get('humidity', 0)),
                'windSpeed': round(weather_data.get('windSpeed', 0)),
                'windDirection': weather_data.get('windDirection', 0),
                'pressure': round(weather_data.get('pressure', 0) * 0.75),
                'cloudCover': round(weather_data.get('cloudiness', 0) * 100)
            }
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
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
