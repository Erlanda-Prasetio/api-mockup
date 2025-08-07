import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.API_INTAN || !process.env.API_USERNAME || !process.env.API_PASSWORD) {
      throw new Error('Required environment variables are not set');
    }

    const basicAuth = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
    const response = await fetch(`${process.env.API_INTAN}/pegawai`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out entries with no name or with generic names
    const filteredData = data.filter((employee: any) => {
      const name = employee.name?.toLowerCase();
      return name && 
             name !== 'staf' && 
             !name.includes('@gmail.com') && 
             name !== 'bpp';
    });

    // Sort by name
    filteredData.sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json(filteredData);

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
