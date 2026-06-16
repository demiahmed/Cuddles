import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // The API container is accessible via Docker network at 'api:8500'
    const response = await fetch('http://api:8500/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`)
    }
    
    const text = await response.text()
    
    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return new NextResponse('API_UNAVAILABLE', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}