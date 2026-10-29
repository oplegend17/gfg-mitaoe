import * as XLSX from "xlsx";

/**
 * Exports attendee records to a formatted Microsoft Excel (.xlsx) file
 * @param {Array} attendees List of attendee objects from Firestore
 * @param {string} [filename] Optional custom filename
 */
export function exportAttendeesToExcel(attendees, filename) {
  if (!attendees || attendees.length === 0) {
    alert("No attendance records to export yet!");
    return;
  }

  // Format data for Excel worksheet
  const rows = attendees.map((a, index) => ({
    "Sr. No": index + 1,
    "Full Name": a.name || "Anonymous",
    "Email ID": a.email || "—",
    "Branch": a.branch || "—",
    "Year": a.year || "—",
    "Feedback / Thoughts": a.feedback || "—",
    "Checked In At": a.at
      ? a.at.toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "—",
    "Device Fingerprint": a.id || "—",
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set readable column widths
  worksheet["!cols"] = [
    { wch: 8 },  // Sr. No
    { wch: 26 }, // Full Name
    { wch: 32 }, // Email ID
    { wch: 28 }, // Branch
    { wch: 14 }, // Year
    { wch: 45 }, // Feedback
    { wch: 24 }, // Checked In At
    { wch: 28 }, // Device Fingerprint
  ];

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Flo101 Attendance");

  // Determine filename with current date stamp
  const today = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `Flo101_MITAOE_Attendance_${today}.xlsx`;

  // Write and trigger browser download
  XLSX.writeFile(workbook, finalFilename);
}

