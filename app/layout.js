import './globals.css';
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from '../components/theme-provider';
import CustomerBottomNav from '../components/CustomerBottomNav';

export const metadata = {
  title: 'BG Smart Services',
  description: 'Local shopping, delivered in Eersterust.',
  applicationName: 'BG Smart Services',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#18c968',
};

export default function Layout({ children }) {
  return <ThemeProvider><div className="customer-app-shell">{children}<CustomerBottomNav /></div></ThemeProvider>;
}
