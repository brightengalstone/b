import { NextResponse } from 'next/server';

const PAGES = {
  'Soulicious Specials': 'https://chickenlicken.co.za/menu/soulicious-specials',
  'Top Deluxe': 'https://chickenlicken.co.za/products?cId=6',
  'Easy Bucks Menu': 'https://chickenlicken.co.za/products?cId=9',
  'Just Chicken Licken': 'https://chickenlicken.co.za/products?cId=12',
  'Secret Menu': 'https://chickenlicken.co.za/products?cId=18',
  'Slider Specials': 'https://chickenlicken.co.za/products?cId=8',
  'Lick’n Lekker': 'https://chickenlicken.co.za/products?cId=15',
};

const FALLBACK_PAGES = Object.values(PAGES);
const normalize = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/[®™]/g, '').replace(/[’‘]/g, "'").replace(/&amp;/g, '&').replace(/\\s+/g, ' ').trim().toLowerCase();

function findImage(html, productName) {
  const target = normalize(productName);
  const imgTags = html.match(/<img\\b[^>]*>/gi) || [];
  for (const tag of imgTags) {
    const altMatch = tag.match(/\\balt=["']([^"']*)["']/i);
    if (!altMatch) continue;
    const alt = normalize(altMatch[1]);
    if (!alt || (alt !== target && !alt.includes(target) && !target.includes(alt))) continue;
    const srcMatch = tag.match(/\\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    let src = srcMatch[1];
    if (src.startsWith('data:')) continue;
    if (src.startsWith('//')) src = 'https:' + src;
    if (src.startsWith('/')) src = 'https://chickenlicken.co.za' + src;
    return src;
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const category = searchParams.get('category') || '';
  if (!name) return new NextResponse('Missing product name', { status: 400 });

  const orderedPages = [PAGES[category], ...FALLBACK_PAGES].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  for (const page of orderedPages) {
    try {
      const response = await fetch(page, {
        headers: { 'User-Agent': 'Mozilla/5.0 BG-Smart-Services product-catalogue' },
        next: { revalidate: 21600 },
      });
      if (!response.ok) continue;
      const html = await response.text();
      const image = findImage(html, name);
      if (image) {
        return NextResponse.redirect(image, { status: 302, headers: { 'Cache-Control': 'public, max-age=21600, s-maxage=21600' } });
      }
    } catch {}
  }
  return new NextResponse('Product image not found', { status: 404 });
}
