import { NextResponse } from 'next/server';

const SOURCES = {
  'mcdonalds': ['https://www.mcdonalds.co.za/menu'],
  'kfc': ['https://order.kfc.co.za/menu'],
  'chicken licken': ['https://chickenlicken.co.za/menu/soulicious-specials','https://chickenlicken.co.za/products?cId=6','https://chickenlicken.co.za/products?cId=9','https://chickenlicken.co.za/products?cId=12','https://chickenlicken.co.za/products?cId=18','https://chickenlicken.co.za/products?cId=8','https://chickenlicken.co.za/products?cId=15'],
  'debonairs pizza': ['https://debonairspizza.co.za/menus/standard-menu/?custom=False','https://debonairspizza.co.za/menus/halaal-menu/'],
  "nando's": ['https://www.nandos.co.za/eat/order'],
  "roman's pizza": ['https://www.romanspizza.co.za/menus'],
  'steers': ['https://steers.co.za/menu/sit-down-menu/','https://steers.co.za/'],
  'hungry lion': ['https://www.hungrylion.co.za/menu-for-one/'],
};

const normalize = value => String(value || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[®™]/g, '')
  .replace(/&amp;/g, '&')
  .replace(/[’‘]/g, "'")
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

function findImage(html, productName) {
  const target = normalize(productName);
  if (!target) return null;
  const tags = html.match(/<img\\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const alt = tag.match(/\\balt=["']([^"']+)["']/i);
    if (!alt) continue;
    const candidate = normalize(alt[1]);
    if (!candidate || (candidate !== target && !candidate.includes(target) && !target.includes(candidate))) continue;
    const src = tag.match(/\\bsrc=["']([^"']+)["']/i);
    if (!src) continue;
    let url = src[1];
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) {
      const origin = new URL(pageUrl).origin;
      url = origin + url;
    }
    if (!url.startsWith('data:')) return url;
  }
  return null;
}

let pageUrl = '';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const brand = normalize(searchParams.get('brand'));
  const name = searchParams.get('name');
  if (!brand || !name) return new NextResponse('Missing product information', { status: 400 });

  const pages = SOURCES[brand] || [];
  for (const page of pages) {
    pageUrl = page;
    try {
      const response = await fetch(page, {
        headers: { 'User-Agent': 'Mozilla/5.0 BG-Smart-Services product catalogue' },
        next: { revalidate: 21600 },
      });
      if (!response.ok) continue;
      const html = await response.text();
      const image = findImage(html, name);
      if (image) return NextResponse.redirect(image, {
        status: 302,
        headers: { 'Cache-Control': 'public, max-age=21600, s-maxage=21600' },
      });
    } catch {}
  }

  return new NextResponse('Product image not found', { status: 404 });
}
