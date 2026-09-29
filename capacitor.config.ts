import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.bgsmartservices.app',
  appName: 'BG Smart Services',
  webDir: 'out',
  server: {
    url: 'https://bg-smart-services.vercel.app',
    cleartext: false
  }
};

export default config;
