// Debug location script - paste vào Console của browser
console.log('Testing geolocation...');

if ('geolocation' in navigator) {
  console.log('✓ Geolocation API available');
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✓ Location success:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy + ' meters'
      });
      
      // Show on map service
      const mapUrl = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
      console.log('🗺️ View on map:', mapUrl);
    },
    (error) => {
      console.error('✗ Location error:', {
        code: error.code,
        message: error.message,
        meaning: {
          1: 'Permission denied',
          2: 'Position unavailable', 
          3: 'Timeout'
        }[error.code]
      });
      
      // Troubleshooting tips
      console.log('🔧 Troubleshooting:');
      console.log('1. Check if HTTPS is used (required for location)');
      console.log('2. Allow location permission in browser');
      console.log('3. Check if GPS/location services are enabled on device');
      console.log('4. Try clearing browser cache and cookies');
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
} else {
  console.error('✗ Geolocation API not supported by browser');
}