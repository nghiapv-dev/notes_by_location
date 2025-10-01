import React, { useState, useEffect } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { useGeoNotes } from "../context/GeoNotesContext";
import ImageCapture from "./ImageCapture";
import {
  Plus,
  MapPin,
  Loader2,
  X,
  Settings,
  AlertTriangle,
} from "lucide-react";

const AddNoteButton = ({ onNoteAdded }) => {
  const { addNote } = useGeoNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("prompt"); // 'granted', 'denied', 'prompt'
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Kiểm tra quyền location khi component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const permission = await Geolocation.checkPermissions();
      setPermissionStatus(permission.location);

      if (permission.location === "denied") {
        console.warn("Location permission denied");
      }
    } catch (error) {
      console.warn("Error checking location permission:", error);
      setPermissionStatus("prompt");
    }
  };

  const requestLocationPermission = async () => {
    setIsCheckingPermission(true);
    try {
      const permission = await Geolocation.requestPermissions();
      setPermissionStatus(permission.location);
      return permission.location === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setPermissionStatus("denied");
      return false;
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError("");

    // Kiểm tra và yêu cầu quyền trước
    if (permissionStatus !== "granted") {
      const granted = await requestLocationPermission();
      if (!granted) {
        setError(
          "Location permission is required to add geo-notes. Please enable location access in your device settings and try again."
        );
        setShowModal(true);
        setIsLoading(false);
        return;
      }
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000, // Tăng timeout
        maximumAge: 30000, // Giảm maximumAge
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Kiểm tra độ chính xác
      if (accuracy && accuracy > 100) {
        console.warn("Low accuracy location:", accuracy);
      }

      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy || "Unknown",
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error getting location:", err);

      let errorMessage = "Unable to get your location. ";

      if (err.code === 1) {
        errorMessage +=
          "Location access was denied. Please enable location services in your device settings.";
        setPermissionStatus("denied");
      } else if (err.code === 2) {
        errorMessage +=
          "Location information is unavailable. Please check your GPS settings.";
      } else if (err.code === 3) {
        errorMessage += "Location request timed out. Please try again.";
      } else {
        errorMessage +=
          "Please check your location settings and internet connection.";
      }

      setError(errorMessage);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      alert("Please enter a note before saving.");
      return;
    }

    if (!currentLocation) {
      alert("Location is required to save a geo-note.");
      return;
    }

    try {
      const newNote = addNote(
        noteText,
        currentLocation.lat,
        currentLocation.lng,
        capturedImage
      );

      setNoteText("");
      setCurrentLocation(null);
      setCapturedImage(null);
      setShowModal(false);
      setError("");

      if (onNoteAdded) {
        onNoteAdded(newNote);
      }

      // Show success feedback
      alert("Note saved successfully!");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setNoteText("");
    setCurrentLocation(null);
    setCapturedImage(null);
    setError("");
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const openLocationSettings = () => {
    // Hướng dẫn user mở cài đặt
    if (
      window.confirm(
        "To enable location access, please go to your device settings and allow location permission for this app. Would you like to be reminded how?"
      )
    ) {
      const instructions =
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPad")
          ? "iOS: Settings → Privacy & Security → Location Services → Enable for this app"
          : "Android: Settings → Apps → Geo-Notes → Permissions → Location → Allow";

      alert(instructions);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="relative">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading || isCheckingPermission}
          className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg 
                     flex items-center justify-center z-50 transition-all duration-200
                     ${
                       isLoading || isCheckingPermission
                         ? "bg-gray-400 cursor-not-allowed"
                         : permissionStatus === "denied"
                         ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
                         : "bg-blue-500 hover:bg-blue-600 active:scale-95"
                     } text-white`}
          aria-label="Add new geo-note"
        >
          {isLoading || isCheckingPermission ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : permissionStatus === "denied" ? (
            <AlertTriangle className="w-8 h-8" />
          ) : (
            <Plus className="w-8 h-8" />
          )}
        </button>

        {/* Permission status indicator */}
        {permissionStatus === "denied" && (
          <div
            className="fixed bottom-24 right-6 bg-orange-100 border border-orange-300 
                          rounded-lg p-2 shadow-lg max-w-xs z-40"
          >
            <div className="text-xs text-orange-800 font-medium">
              Location access required
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Tap to enable location services
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add Geo-Note</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cancel"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {error ? (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        Location Error
                      </h3>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                      {permissionStatus === "denied" && (
                        <button
                          onClick={openLocationSettings}
                          className="mt-3 flex items-center text-sm text-red-700 hover:text-red-900 
                                   font-medium underline"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Open Settings Guide
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                currentLocation && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Location Found
                        </h3>
                        <p className="text-sm text-green-600 mt-1">
                          {formatCoordinates(
                            currentLocation.lat,
                            currentLocation.lng
                          )}
                        </p>
                        {currentLocation.accuracy && (
                          <p className="text-xs text-green-500 mt-1">
                            Accuracy: ~{Math.round(currentLocation.accuracy)}m
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="mb-4">
                <label
                  htmlFor="noteText"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  What's happening here?
                </label>
                <textarea
                  id="noteText"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note about this location..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           resize-none placeholder-gray-500"
                  disabled={!!error}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {noteText.length}/500 characters
                </div>
              </div>

              {/* Image Capture Section */}
              <div className="mb-4">
                <ImageCapture
                  onImageCaptured={setCapturedImage}
                  currentImage={capturedImage}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                         rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              {!error && (
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || !currentLocation}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                           transition-colors font-medium"
                >
                  Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNoteButton;
