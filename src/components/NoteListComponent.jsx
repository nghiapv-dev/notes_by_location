import React, { useState } from "react";
import { useGeoNotes } from "../context/GeoNotesContext";
import SearchFilter from "./SearchFilter";
import { MapPin, Clock, Trash2, Camera, X } from "lucide-react";

const NoteListComponent = ({ onNoteClick, onClose, currentLocation }) => {
  const { notes, deleteNote } = useGeoNotes();
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [selectedNote, setSelectedNote] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
    }
  };

  const handleNoteClick = (note) => {
    if (onNoteClick) {
      onNoteClick(note.lat, note.lng);
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Geo-Notes</h2>
          <p className="text-sm text-gray-500">{notes.length} notes saved</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Start adding geo-notes to see them here. Each note will be linked
              to a specific location!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 
                           transition-colors border border-gray-200 group"
              >
                <div className="flex items-start justify-between">
                  {/* Note content */}
                  <div className="flex space-x-3 flex-1 min-w-0">
                    {/* Image thumbnail */}
                    {note.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={note.imageUrl}
                          alt="Note"
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Note text */}
                      <p className="text-gray-800 font-medium mb-2 line-clamp-3">
                        {note.text}
                      </p>

                      {/* Location and time info */}
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>
                            {note.lat.toFixed(4)}, {note.lng.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatTimestamp(note.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 
                               hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteListComponent;
