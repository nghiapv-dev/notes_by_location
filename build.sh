#!/bin/bash

# Geo-Notes Build & Deploy Script
# Builds the app for production and prepares for deployment

echo "🚀 Building Geo-Notes for production..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the web app
echo "🔨 Building web application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Web build completed successfully!"
else
  echo "❌ Web build failed!"
  exit 1
fi

# Sync with Capacitor platforms
echo "📱 Syncing with Capacitor platforms..."
npx cap sync

# Build Android if requested
if [ "$1" = "android" ] || [ "$1" = "all" ]; then
  echo "🤖 Building Android app..."
  npx cap build android
  if [ $? -eq 0 ]; then
    echo "✅ Android build completed!"
  else
    echo "❌ Android build failed!"
  fi
fi

# Build iOS if requested (macOS only)
if [ "$1" = "ios" ] || [ "$1" = "all" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS app..."
    npx cap build ios
    if [ $? -eq 0 ]; then
      echo "✅ iOS build completed!"
    else
      echo "❌ iOS build failed!"
    fi
  else
    echo "⚠️  iOS build requires macOS, skipping..."
  fi
fi

echo "🎉 Build process completed!"
echo "📱 To test on device:"
echo "   Android: npx cap run android"
echo "   iOS: npx cap run ios"
echo "🌐 To preview web: npm run preview"