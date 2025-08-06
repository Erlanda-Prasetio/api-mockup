import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      )
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify the token with Google reCAPTCHA
    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const verifyData = await verifyResponse.json()

    console.log('reCAPTCHA verification result:', verifyData)

    if (verifyData.success) {
      return NextResponse.json({
        success: true,
        message: 'reCAPTCHA verification successful',
        score: verifyData.score || null // v3 provides score, v2 doesn't
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA verification failed',
          'error-codes': verifyData['error-codes']
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during reCAPTCHA verification'
      },
      { status: 500 }
    )
  }
}
