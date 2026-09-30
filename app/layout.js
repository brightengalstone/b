import './globals.css';
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from '../components/theme-provider';

export const metadata = {
  title: 'BG Smart Services',
  description: 'Local shopping, delivered in Eersterust.',
  applicationName: 'BG Smart Services',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101828',
};

export default function Layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
