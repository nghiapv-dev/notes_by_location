import { useGeoNotes } from "../context/GeoNotesContext";

class DataService {
  static generateExportData(notes) {
    const exportData = {
      appName: "Geo-Notes",
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      totalNotes: notes.length,
      notes: notes.map((note) => ({
        id: note.id,
        text: note.text,
        lat: note.lat,
        lng: note.lng,
        timestamp: note.timestamp,
        hasImage: !!note.imageUrl,
      })),
    };
    return exportData;
  }

  static exportToJSON(notes) {
    const data = this.generateExportData(notes);
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const fileName = `geonotes-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    this.downloadFile(dataBlob, fileName);
  }

  static exportToCSV(notes) {
    const headers = [
      "ID",
      "Note Text",
      "Latitude",
      "Longitude",
      "Date",
      "Time",
      "Has Photo",
    ];
    const csvContent = [
      headers.join(","),
      ...notes.map((note) => {
        const date = new Date(note.timestamp);
        return [
          note.id,
          `"${note.text.replace(/"/g, '""')}"`,
          note.lat,
          note.lng,
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          note.imageUrl ? "Yes" : "No",
        ].join(",");
      }),
    ].join("\n");

    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const fileName = `geonotes-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    this.downloadFile(dataBlob, fileName);
  }

  static exportToGPX(notes) {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Geo-Notes App">
  <metadata>
    <name>Geo-Notes Export</name>
    <desc>Exported notes from Geo-Notes application</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${notes
  .map((note) => {
    const date = new Date(note.timestamp);
    return `  <wpt lat="${note.lat}" lon="${note.lng}">
    <time>${date.toISOString()}</time>
    <name>${this.escapeXML(note.text.substring(0, 50))}${
      note.text.length > 50 ? "..." : ""
    }</name>
    <desc>${this.escapeXML(note.text)}</desc>
    <type>note</type>
  </wpt>`;
  })
  .join("\n")}
</gpx>`;

    const dataBlob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const fileName = `geonotes-export-${
      new Date().toISOString().split("T")[0]
    }.gpx`;
    this.downloadFile(dataBlob, fileName);
  }

  static escapeXML(str) {
    return str.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return char;
      }
    });
  }

  static downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async importFromJSON(file, addNote) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.notes || !Array.isArray(data.notes)) {
        throw new Error("Invalid file format");
      }

      let importedCount = 0;
      let skippedCount = 0;

      for (const note of data.notes) {
        if (
          note.text &&
          typeof note.lat === "number" &&
          typeof note.lng === "number"
        ) {
          try {
            addNote(note.text, note.lat, note.lng);
            importedCount++;
          } catch (err) {
            console.warn("Failed to import note:", note.id, err);
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: data.notes.length,
      };
    } catch (error) {
      console.error("Import error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static generateBackupData(notes) {
    return {
      ...this.generateExportData(notes),
      includesImages: true,
      notes: notes, // Include full data including images for backup
    };
  }

  static createBackup(notes) {
    const backupData = this.generateBackupData(notes);
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const fileName = `geonotes-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    this.downloadFile(dataBlob, fileName);
  }

  static async restoreFromBackup(file, setNotes) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.notes || !Array.isArray(data.notes)) {
        throw new Error("Invalid backup file format");
      }

      // Restore all notes including images
      setNotes(data.notes);

      return {
        success: true,
        restored: data.notes.length,
      };
    } catch (error) {
      console.error("Restore error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default DataService;
