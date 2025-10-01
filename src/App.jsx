import React, { useState, useRef, useEffect } from 'react';
import { GeoNotesProvider, useGeoNotes } from './context/GeoNotesContext';
import { Geolocation } from '@capacitor/geolocation';
import MapComponent from './components/MapComponent';
import NoteListComponent from './components/NoteListComponent';
import AddNoteButton from './components/AddNoteButton';
import NotificationService from './services/NotificationService';
import { Menu, X, List, Map, Bell, BellOff, Wifi, WifiOff, MapPin } from 'lucide-react';
import './App.css';

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState('map'); // 'map' or 'list'
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  const { notes } = useGeoNotes();

  // Khởi tạo notifications và theo dõi trạng thái online
  useEffect(() => {
    // Initialize notifications
    NotificationService.initialize().then(granted => {
      setNotificationsEnabled(granted);
      if (granted && notes.length === 0) {
        NotificationService.showWelcomeNotification();
      }
    });

    // Get current location for filtering
    const getCurrentLocation = async () => {
      try {
        // Try web geolocation first
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setCurrentLocation(location);
              
              // Set initial map center to user location
              if (!mapCenter) {
                setMapCenter([location.lat, location.lng]);
                setMapZoom(15); // Zoom closer for user location
              }
            },
            async (error) => {
              console.warn('Web geolocation failed:', error);
              // Try Capacitor geolocation as fallback
              try {
                const position = await Geolocation.getCurrentPosition({
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 300000
                });
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setCurrentLocation(location);
                if (!mapCenter) {
                  setMapCenter([location.lat, location.lng]);
                  setMapZoom(15);
                }
              } catch (capacitorError) {
                console.warn('Could not get current location:', capacitorError);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        } else {
          // No web geolocation, try Capacitor
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          if (!mapCenter) {
            setMapCenter([location.lat, location.lng]);
            setMapZoom(15);
          }
        }
      } catch (error) {
        console.warn('Could not get current location for filtering:', error);
      }
    };

    getCurrentLocation();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notes.length]);

  const handleNoteClick = (lat, lng) => {
    // Pan map to the selected note
    setMapCenter([lat, lng]);
    setMapZoom(16);
    
    // On mobile, switch to map view and close sidebar
    if (window.innerWidth < 768) {
      setCurrentView('map');
      setShowSidebar(false);
    }
  };

  const handleNoteAdded = async (newNote) => {
    // Center map on the new note
    setMapCenter([newNote.lat, newNote.lng]);
    setMapZoom(16);

    // Schedule reminder notification if enabled
    if (notificationsEnabled) {
      await NotificationService.scheduleNoteReminder(newNote, 60); // 1 hour reminder
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await NotificationService.initialize();
      setNotificationsEnabled(granted);
      if (granted) {
        alert('Notifications enabled! You\'ll receive reminders about your notes.');
      } else {
        alert('Notification permission denied. Enable it in your device settings to get reminders.');
      }
    } else {
      setNotificationsEnabled(false);
      await NotificationService.cancelAllNotifications();
      alert('Notifications disabled. You won\'t receive reminders.');
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleView = (view) => {
    setCurrentView(view);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-800">Geo-Notes</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-gray-500">{notes.length} notes</span>
            </div>
          </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={toggleNotifications}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                           ${notificationsEnabled 
                             ? 'bg-green-100 text-green-600' 
                             : 'text-gray-600 hover:bg-gray-100'}`}
                title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => {
                  getCurrentLocation();
                  alert('Refreshing your location...');
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                         text-gray-600 hover:bg-gray-100"
                title="Refresh current location"
              >
                <MapPin className="w-4 h-4" />
              </button>
              
              <div className="flex items-center text-gray-400">
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>

              <button
                onClick={() => toggleView('map')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                           ${currentView === 'map' 
                             ? 'bg-blue-100 text-blue-600' 
                             : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Map className="w-4 h-4" />
                <span className="text-sm font-medium">Map</span>
              </button>
              <button
                onClick={toggleSidebar}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                           ${showSidebar 
                             ? 'bg-blue-100 text-blue-600' 
                             : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Notes</span>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => toggleView('map')}
                className={`p-2 rounded-lg transition-colors
                           ${currentView === 'map' 
                             ? 'bg-blue-100 text-blue-600' 
                             : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Map view"
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleView('list')}
                className={`p-2 rounded-lg transition-colors
                           ${currentView === 'list' 
                             ? 'bg-blue-100 text-blue-600' 
                             : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Map View */}
          <div className={`flex-1 relative ${
            currentView === 'list' && window.innerWidth < 768 ? 'hidden' : 'block'
          }`}>
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              onMapReady={(map) => { mapRef.current = map; }}
            />
          </div>

          {/* Mobile List View */}
          <div className={`w-full h-full md:hidden ${
            currentView === 'map' ? 'hidden' : 'block'
          }`}>
            <NoteListComponent
              onNoteClick={handleNoteClick}
              currentLocation={currentLocation}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className={`hidden md:block transition-all duration-300 ease-in-out
                          ${showSidebar ? 'w-96' : 'w-0'} 
                          bg-white border-l border-gray-200 overflow-hidden`}>
            {showSidebar && (
              <NoteListComponent
                onNoteClick={handleNoteClick}
                onClose={() => setShowSidebar(false)}
                currentLocation={currentLocation}
              />
            )}
          </div>

          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={toggleSidebar}
              />
              
              {/* Sidebar */}
              <div className="relative ml-auto w-80 max-w-full bg-white h-full">
                <NoteListComponent
                  onNoteClick={handleNoteClick}
                  onClose={toggleSidebar}
                  currentLocation={currentLocation}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Note Button - Only show on map view */}
        {(currentView === 'map' || window.innerWidth >= 768) && (
          <AddNoteButton onNoteAdded={handleNoteAdded} />
        )}

        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 z-30">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 
                          text-xs text-gray-600 shadow-sm border border-gray-200 flex items-center space-x-2">
            <span>
              {currentLocation 
                ? `📍 Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                : '📍 Getting location...'
              }
            </span>
            {!isOnline && (
              <span className="text-orange-500 font-medium">• Offline</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  function App() {
    return (
      <GeoNotesProvider>
        <AppContent />
      </GeoNotesProvider>
    );
  }

  export default App;