import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET /api/marketplace/geolocation/ip - определить город по IP адресу (fallback)
export async function GET(request: NextRequest) {
  try {
    // Получаем IP адрес из заголовков (Vercel использует x-forwarded-for)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || '')
    
    if (!ip || ip === 'unknown') {
      // Если IP не определен, пробуем использовать сервис, который сам определяет IP
      return await tryAutoIPGeolocation()
    }

    logger.info(`Determining location for IP: ${ip}`)

    // Используем бесплатный сервис для определения города по IP
    // ip-api.com более надежный и бесплатный
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,country,lat,lon&lang=ru`, {
        headers: {
          'User-Agent': 'Medical Assistant App'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'success' && data.city) {
          return NextResponse.json({
            city: data.city,
            country: data.country,
            coordinates: data.lat && data.lon ? {
              lat: data.lat,
              lng: data.lon
            } : null
          })
        }
      }
    } catch (ipError) {
      logger.warn('ip-api.com failed, trying alternative:', ipError)
    }
    
    // Альтернативный сервис
    try {
      const altResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'Medical Assistant App'
        }
      })

      if (altResponse.ok) {
        const altData = await altResponse.json()
        
        if (altData.city && !altData.error) {
          return NextResponse.json({
            city: altData.city,
            country: altData.country_name,
            region: altData.region,
            coordinates: altData.latitude && altData.longitude ? {
              lat: altData.latitude,
              lng: altData.longitude
            } : null
          })
        }
      }
    } catch (altError) {
      logger.error('ipapi.co also failed:', altError)
    }

    // Последняя попытка - автоопределение IP
    return await tryAutoIPGeolocation()
  } catch (error) {
    logger.error('Error IP geolocation:', error)
    return NextResponse.json(
      { error: 'Ошибка определения города по IP' },
      { status: 500 }
    )
  }
}

async function tryAutoIPGeolocation() {
  try {
    // Пробуем сервис, который сам определяет IP клиента
    const response = await fetch('http://ip-api.com/json/?fields=status,message,city,country,lat,lon&lang=ru')
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success' && data.city) {
        return NextResponse.json({
          city: data.city,
          country: data.country,
          coordinates: data.lat && data.lon ? {
            lat: data.lat,
            lng: data.lon
          } : null
        })
      }
    }
  } catch (error) {
    logger.error('Auto IP geolocation failed:', error)
  }
  
  return NextResponse.json({ error: 'Не удалось определить город по IP' }, { status: 500 })
}

