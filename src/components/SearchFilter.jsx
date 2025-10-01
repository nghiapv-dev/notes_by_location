import React, { useState, useMemo } from "react";
import { useGeoNotes } from "../context/GeoNotesContext";
import { Search, Filter, X, Calendar, MapPin } from "lucide-react";

const SearchFilter = ({ onFilteredNotes, currentLocation }) => {
  const { notes } = useGeoNotes();
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [radiusFilter, setRadiusFilter] = useState("all");

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Text search
    if (searchText.trim()) {
      filtered = filtered.filter((note) =>
        note.text.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter(
          (note) => new Date(note.timestamp) >= cutoffDate
        );
      }
    }
    if (radiusFilter !== "all" && currentLocation) {
      const maxDistance = parseInt(radiusFilter);
      filtered = filtered.filter((note) => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          note.lat,
          note.lng
        );
        return distance <= maxDistance;
      });
    }

    return filtered;
  }, [notes, searchText, dateFilter, radiusFilter, currentLocation]);

  React.useEffect(() => {
    onFilteredNotes(filteredNotes);
  }, [filteredNotes, onFilteredNotes]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearFilters = () => {
    setSearchText("");
    setDateFilter("all");
    setRadiusFilter("all");
    setShowFilters(false);
  };

  const hasActiveFilters =
    searchText || dateFilter !== "all" || radiusFilter !== "all";

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded
                       ${hasActiveFilters ? "text-blue-600" : "text-gray-400"} 
                       hover:bg-gray-100 transition-colors`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>
            {filteredNotes.length} of {notes.length} notes
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Date Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
            </select>
          </div>

          {/* Radius Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              Distance from current location
            </label>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(e.target.value)}
              disabled={!currentLocation}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">Any distance</option>
              <option value="1">Within 1 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
            </select>
            {!currentLocation && (
              <p className="text-xs text-gray-500 mt-1">
                Location needed for distance filter
              </p>
            )}
          </div>

          {/* Quick Stats */}
          {notes.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Latest:</span>
                  <br />
                  {new Date(
                    Math.max(...notes.map((n) => new Date(n.timestamp)))
                  ).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">With Photos:</span>
                  <br />
                  {notes.filter((n) => n.imageUrl).length} notes
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
