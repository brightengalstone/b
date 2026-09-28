import { NextResponse } from 'next/server';

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const PHOTON_SEARCH = 'https://photon.komoot.io/api/';
const PHOTON_REVERSE = 'https://photon.komoot.io/reverse';

const EERSTERUST_TERMS = [
  'eersterust',
  'eersterus',
  'eersterust ext',
  'eersterust extension',
];

function text(value) {
  return String(value || '').trim().toLowerCase();
}

function isEersterustAddress(address = {}, display = '') {
  const values = [
    address.suburb,
    address.neighbourhood,
    address.quarter,
    address.city_district,
    address.village,
    address.town,
    address.city,
    display,
  ].map(text);

  return values.some(value =>
    EERSTERUST_TERMS.some(term => value === term || value.includes(term))
  );
}

function photonAddress(feature) {
  const p = feature?.properties || {};
  return {
    house_number: p.housenumber || p.house_number || '',
    road: p.street || p.road || '',
    suburb: p.suburb || p.district || '',
    city: p.city || p.locality || 'Pretoria',
    postcode: p.postcode || '',
    state: p.state || 'Gauteng',
    country: p.country || 'South Africa',
  };
}

function normalisePhoton(feature) {
  if (!feature?.geometry?.coordinates) return null;
  const [lon, lat] = feature.geometry.coordinates;
  const address = photonAddress(feature);
  const display = [
    [address.house_number, address.road].filter(Boolean).join(' '),
    address.suburb,
    address.city,
    address.postcode,
  ].filter(Boolean).join(', ') || feature.properties?.name || '';
  return {
    lat: String(lat),
    lon: String(lon),
    display_name: display,
    address,
  };
}

async function photonSearch(query) {
  const params = new URLSearchParams({
    q: query,
    limit: '8',
    lang: 'en',
  });
  const response = await fetch(PHOTON_SEARCH + '?' + params.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'BG Smart Services/1.0' },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.features) ? data.features.map(normalisePhoton).filter(Boolean) : [];
}

async function nominatimSearch(query) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'za',
    q: query,
  });
  const response = await fetch(NOMINATIM_SEARCH + '?' + params.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'BG Smart Services address verification/1.0',
    },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  return response.json();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const street = String(searchParams.get('street') || '').trim();
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  const reverse = Number.isFinite(lat) && Number.isFinite(lon);

  if (!street && !reverse) {
    return NextResponse.json(
      { results: [], error: 'Street address or map coordinates are required.' },
      { status: 400 }
    );
  }

  if (reverse) {
    try {
      // Photon is used first because it is less restrictive for interactive map lookups.
      const photonParams = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
      });
      const photonResponse = await fetch(PHOTON_REVERSE + '?' + photonParams.toString(), {
        headers: { Accept: 'application/json', 'User-Agent': 'BG Smart Services/1.0' },
        cache: 'no-store',
      });

      if (photonResponse.ok) {
        const data = await photonResponse.json();
        const feature = data?.features?.[0];
        const result = normalisePhoton(feature);
        if (result) {
          const inEersterust = isEersterustAddress(result.address, result.display_name);
          if (inEersterust) return NextResponse.json({ result, inEersterust: true });
        }
      }

      // Nominatim is the fallback and provides detailed South African address fields.
      const params = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '18',
        lat: String(lat),
        lon: String(lon),
      });
      const response = await fetch(NOMINATIM_REVERSE + '?' + params.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BG Smart Services address verification/1.0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return NextResponse.json(
          { result: null, inEersterust: false, error: 'Address service returned an error.' },
          { status: 502 }
        );
      }

      const result = await response.json();
      const inEersterust = isEersterustAddress(result?.address, result?.display_name);
      return NextResponse.json({ result: inEersterust ? result : null, inEersterust });
    } catch {
      return NextResponse.json(
        { result: null, inEersterust: false, error: 'Address service is unavailable.' },
        { status: 502 }
      );
    }
  }

  try {
    // Search the complete address first, then a simpler Eersterust query if needed.
    const queries = [
      street.toLowerCase().includes('eersterust')
        ? street
        : street + ', Eersterust, Pretoria, Gauteng, South Africa',
      street + ', Eersterust, Pretoria, South Africa',
    ];

    let results = [];
    for (const query of queries) {
      const photonResults = await photonSearch(query);
      const photonEersterust = photonResults.filter(r => isEersterustAddress(r.address, r.display_name));
      if (photonEersterust.length) {
        results = photonEersterust;
        break;
      }
    }

    if (!results.length) {
      for (const query of queries) {
        const nominatimResults = await nominatimSearch(query);
        const eersterust = nominatimResults.filter(result =>
          isEersterustAddress(result?.address, result?.display_name)
        );
        if (eersterust.length) {
          results = eersterust;
          break;
        }
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { results: [], error: 'Address service is unavailable.' },
      { status: 502 }
    );
  }
}
