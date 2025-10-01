import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  static async initialize() {
    try {
      // Kiểm tra quyền notification
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display !== 'granted') {
        const request = await LocalNotifications.requestPermissions();
        return request.display === 'granted';
      }
      
      return true;
    } catch (error) {
      console.warn('Notification initialization failed:', error);
      return false;
    }
  }

  static async scheduleNoteReminder(note, delayMinutes = 60) {
    try {
      const hasPermission = await this.initialize();
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return false;
      }

      const notificationTime = new Date();
      notificationTime.setMinutes(notificationTime.getMinutes() + delayMinutes);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Geo-Notes Reminder',
            body: `Remember your note: "${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}"`,
            id: parseInt(note.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number
            schedule: { at: notificationTime },
            extra: {
              noteId: note.id,
              lat: note.lat,
              lng: note.lng
            }
          }
        ]
      });

      return true;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return false;
    }
  }

  static async showWelcomeNotification() {
    try {
      const hasPermission = await this.initialize();
      if (!hasPermission) return false;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Welcome to Geo-Notes!',
            body: 'Start capturing your location-based memories',
            id: 1,
            schedule: { at: new Date(Date.now() + 2000) } // 2 seconds delay
          }
        ]
      });

      return true;
    } catch (error) {
      console.error('Failed to show welcome notification:', error);
      return false;
    }
  }

  static async cancelAllNotifications() {
    try {
      await LocalNotifications.cancel({
        notifications: await LocalNotifications.getPending()
          .then(result => result.notifications)
      });
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  static async showLocationBasedReminder(userLat, userLng, notes) {
    try {
      const hasPermission = await this.initialize();
      if (!hasPermission) return false;

      // Tìm notes gần user (trong bán kính 100m)
      const nearbyNotes = notes.filter(note => {
        const distance = this.calculateDistance(userLat, userLng, note.lat, note.lng);
        return distance <= 0.1; // 100m
      });

      if (nearbyNotes.length > 0) {
        const note = nearbyNotes[0];
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'You\'re near a memory!',
              body: `Remember: "${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}"`,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to show location-based reminder:', error);
      return false;
    }
  }

  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default NotificationService;