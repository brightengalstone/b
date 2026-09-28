import { NextResponse } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const street = String(searchParams.get('street') || '').trim();
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  const reverse = Number.isFinite(lat) && Number.isFinite(lon);

  if (!street && !reverse) {
    return NextResponse.json({ results: [], error: 'Street address or map coordinates are required.' }, { status: 400 });
  }

  if (reverse) {
    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18',
      lat: String(lat),
      lon: String(lon),
    });

    try {
      const response = await fetch('https://nominatim.openstreetmap.org/reverse?' + params.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BG Smart Services address verification/1.0',
        },
        cache: 'no-store',
      });
      if (!response.ok) return NextResponse.json({ result: null, error: 'Address service returned an error.' }, { status: response.status });
      const result = await response.json();
      const suburb = String(result?.address?.suburb || '').toLowerCase();
      const display = String(result?.display_name || '').toLowerCase();
      const inEersterust = suburb === 'eersterust' || display.includes('eersterust');
      return NextResponse.json({ result, inEersterust });
    } catch {
      return NextResponse.json({ result: null, error: 'Address service is unavailable.' }, { status: 502 });
    }
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
