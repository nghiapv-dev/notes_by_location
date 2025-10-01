import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Camera as CameraIcon, Image, X } from "lucide-react";

const ImageCapture = ({ onImageCaptured, onClose, currentImage }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");

  const captureImage = async () => {
    setIsCapturing(true);
    setError("");

    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera !== "granted") {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.camera !== "granted") {
          setError("Camera permission is required to take photos.");
          setIsCapturing(false);
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 800,
        height: 600,
        correctOrientation: true,
      });

      if (image.dataUrl) {
        onImageCaptured(image.dataUrl);
      }
    } catch (err) {
      console.error("Error capturing image:", err);
      if (
        !err.message.includes("cancelled") &&
        !err.message.includes("canceled")
      ) {
        setError("Failed to capture image. Please try again.");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async () => {
    setIsCapturing(true);
    setError("");

    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.photos !== "granted") {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.photos !== "granted") {
          setError("Photo library permission is required to select images.");
          setIsCapturing(false);
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 800,
        height: 600,
        correctOrientation: true,
      });

      if (image.dataUrl) {
        onImageCaptured(image.dataUrl);
      }
    } catch (err) {
      console.error("Error selecting image:", err);
      if (
        !err.message.includes("cancelled") &&
        !err.message.includes("canceled")
      ) {
        setError("Failed to select image. Please try again.");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const removeImage = () => {
    onImageCaptured(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Add Photo (Optional)
        </h3>
        {currentImage && (
          <button
            onClick={removeImage}
            className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Captured"
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <button
                onClick={captureImage}
                disabled={isCapturing}
                className="px-3 py-1 bg-white bg-opacity-90 rounded text-xs font-medium
                         hover:bg-opacity-100 transition-colors disabled:opacity-50"
              >
                Retake
              </button>
              <button
                onClick={selectFromGallery}
                disabled={isCapturing}
                className="px-3 py-1 bg-white bg-opacity-90 rounded text-xs font-medium
                         hover:bg-opacity-100 transition-colors disabled:opacity-50"
              >
                Choose Different
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={captureImage}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 
                     border-dashed border-gray-300 rounded-lg hover:border-blue-400 
                     hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <CameraIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isCapturing ? "Opening Camera..." : "Take Photo"}
            </span>
          </button>

          <button
            onClick={selectFromGallery}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 
                     border-dashed border-gray-300 rounded-lg hover:border-blue-400 
                     hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Image className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isCapturing ? "Opening Gallery..." : "From Gallery"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
