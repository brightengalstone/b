import { NextResponse } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const street = String(searchParams.get('street') || '').trim();

  if (!street) {
    return NextResponse.json({ results: [], error: 'Street address is required.' }, { status: 400 });
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'za',
    layer: 'address',
    street,
    city: 'Pretoria',
    state: 'Gauteng',
    country: 'South Africa',
    viewbox: '28.285,-25.735,28.345,-25.680',
    bounded: '1',
  });

  try {
    const response = await fetch(NOMINATIM_URL + '?' + params.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BG Smart Services address verification/1.0',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ results: [], error: 'Address service returned an error.' }, { status: response.status });
    }

    const results = await response.json();
    const eersterust = results.filter((result) => {
      const suburb = String(result?.address?.suburb || '').toLowerCase();
      const display = String(result?.display_name || '').toLowerCase();
      return suburb === 'eersterust' || display.includes('eersterust');
    });

    return NextResponse.json({ results: eersterust });
  } catch {
    return NextResponse.json({ results: [], error: 'Address service is unavailable.' }, { status: 502 });
  }
}
