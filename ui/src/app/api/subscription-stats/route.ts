import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Forward to API container via Docker network
    const response = await fetch('http://api:8500/api/subscription-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Subscription stats failed:', error)
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 503 }
    )
  }
}