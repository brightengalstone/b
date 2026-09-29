export default function manifest() {
  return {
    name: 'BG Smart Services',
    short_name: 'BG Smart',
    description: 'Local shopping delivery in Eersterust.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#f5f7fa',
    theme_color: '#101828',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  };
}
