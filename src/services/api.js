// src/services/api.js

/* ── Configs ── */
export const PRIORITY_CONFIG = {
  Critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
  High:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" },
  Medium:   { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  Low:      { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400" },
};

export const STATUS_CONFIG = {
  Reported:    { label: "Reported",    bg: "bg-blue-500/15",    text: "text-blue-400" },
  "In Progress": { label: "In Progress", bg: "bg-yellow-500/15",  text: "text-yellow-400" },
  Resolved:    { label: "Resolved",    bg: "bg-green-500/15",   text: "text-green-400" },
};

/* ── Reports (using localStorage) ── */
const STORAGE_KEY = 'civicfix_reports';

const getStoredReports = () => {
  const reports = localStorage.getItem(STORAGE_KEY);
  return reports ? JSON.parse(reports) : [];
};

const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const addReport = async (data) => {
  try {
    const reports = getStoredReports();
    const newReport = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: "Reported",
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    saveReports(reports);
    return newReport.id;
  } catch (error) {
    console.error("Error adding report: ", error);
    throw error;
  }
};

export const getReports = async () => {
  try {
    return getStoredReports();
  } catch (error) {
    console.error("Error getting reports: ", error);
    throw error;
  }
};

export const upvoteReport = async (id) => {
  try {
    const reports = getStoredReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index].upvotes = (reports[index].upvotes || 0) + 1;
      saveReports(reports);
    }
  } catch (error) {
    console.error("Error upvoting report: ", error);
    throw error;
  }
};

/* ── Storage (Mocked) ── */
export const uploadImage = async (file) => {
  try {
    // Return a dummy image URL for the sake of the prototype
    return URL.createObjectURL(file);
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};

/* ── AI Classification (Simulated) ── */
export const classifyIssue = (description = "", filename = "") => {
  const text = (description + " " + filename).toLowerCase();

  if (text.includes("pothole") || text.includes("road") || text.includes("crack")) {
    return { type: "Road Damage", priority: "High", icon: "🚧" };
  }
  if (text.includes("garbage") || text.includes("trash") || text.includes("waste") || text.includes("dump")) {
    return { type: "Garbage Dump", priority: "Medium", icon: "🗑️" };
  }
  if (text.includes("light") || text.includes("dark") || text.includes("streetlamp")) {
    return { type: "Broken Streetlight", priority: "Medium", icon: "💡" };
  }
  if (text.includes("flood") || text.includes("water") || text.includes("drain")) {
    return { type: "Flooding", priority: "Critical", icon: "🌊" };
  }
  if (text.includes("tree") || text.includes("branch") || text.includes("fallen")) {
    return { type: "Fallen Tree", priority: "High", icon: "🌳" };
  }
  if (text.includes("vandalism") || text.includes("graffiti") || text.includes("broken")) {
    return { type: "Vandalism", priority: "Low", icon: "🎨" };
  }

  return { type: "General Issue", priority: "Low", icon: "⚠️" };
};
