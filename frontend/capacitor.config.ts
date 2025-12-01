import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inia.app',
  appName: 'iniaApp',
  webDir: 'dist/inia-frontend',
  server: {
    url: 'http://inia-prod-alb-1531354287.us-east-1.elb.amazonaws.com/',
    cleartext: true
  }
};

export default config;
