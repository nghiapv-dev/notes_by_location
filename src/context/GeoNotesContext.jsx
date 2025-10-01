import React, { createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';

const GeoNotesContext = createContext();

export const useGeoNotes = () => {
  const context = useContext(GeoNotesContext);
  if (!context) {
    throw new Error('useGeoNotes must be used within a GeoNotesProvider');
  }
  return context;
};

export const GeoNotesProvider = ({ children }) => {
  const [notes, setNotes] = useLocalStorage('geo-notes', []);

  const addNote = (text, lat, lng, imageUrl = null) => {
    const newNote = {
      id: uuidv4(),
      text: text.trim(),
      lat,
      lng,
      imageUrl,
      timestamp: new Date().toISOString()
    };
    
    setNotes(prevNotes => [...prevNotes, newNote]);
    return newNote;
  };

  const deleteNote = (noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  const getNoteById = (noteId) => {
    return notes.find(note => note.id === noteId);
  };

  const getNotesWithinRadius = (centerLat, centerLng, radiusKm = 1) => {
    return notes.filter(note => {
      const distance = calculateDistance(centerLat, centerLng, note.lat, note.lng);
      return distance <= radiusKm;
    });
  };

  // Helper function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const contextValue = {
    notes,
    addNote,
    deleteNote,
    getNoteById,
    getNotesWithinRadius
  };

  return (
    <GeoNotesContext.Provider value={contextValue}>
      {children}
    </GeoNotesContext.Provider>
  );
};