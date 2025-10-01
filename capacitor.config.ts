import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.geonotes.app',
  appName: 'Geo-Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3b82f6",
      sound: "beep.wav"
    }
  },
  android: {
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  },
  ios: {
    permissions: [
      "NSLocationWhenInUseUsageDescription",
      "NSCameraUsageDescription",
      "NSPhotoLibraryUsageDescription"
    ]
  }
};

export default config;