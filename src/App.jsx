import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, AlertTriangle, Beaker, Flame, Skull, Droplet, Wind, CircleDot, Bug, AlertCircle,
  Plus, Trash2, Edit, X, ChevronDown, ChevronUp, Loader2, RefreshCw, FileText, Check, Save, FileSpreadsheet,
  Bomb, Fish, Moon, Sun, Download, BarChart3, Clock, ArrowRight
} from 'lucide-react';
import { firebaseService } from './services/firebaseService';
import { GHS_CONFIG, STATUS_OPTIONS, EMPTY_FORM, SIGNAL_WORD_OPTIONS } from './constants';
import { checkIsExpired, formatDateTime } from './utils';

// --- 1. Utility Components ---

const StatusBadge = ({ status }) => {
  const config = STATUS_OPTIONS.find(opt => opt.value === status) ||
    (status === "TRUE" ? STATUS_OPTIONS.find(opt => opt.value === "Ready") : null) ||
    { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${config.color}`}>
      {config.label}
    </span>
  );
};

const SignalWordBadge = ({ word }) => {
  if (!word || word === "-") return null;
  const config = SIGNAL_WORD_OPTIONS.find(opt => opt.value === word) ||
    { label: word, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-black uppercase tracking-widest ${config.color}`}>
      {config.label}
    </span>
  );
};

const GHSIcons = ({ ghs, size = 16 }) => {
  if (!ghs) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      {GHS_CONFIG.map((item) => (
        ghs[item.key] ? (
          <div key={item.key} title={item.label} className={`p-1 rounded border ${item.bg} ${item.border}`}>
            <item.icon size={size} className={item.color} />
          </div>
        ) : null
      ))}
    </div>
  );
};

// --- Mobile Card Component ---
const ChemicalCard = ({ item, onEdit, onDelete, onToggleDanger }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status Border Accent
  const statusColor = item.status === 'Ready' ? 'border-l-green-500' :
    item.status === 'Expired' ? 'border-l-red-500' :
      item.status === 'Dispose' ? 'border-l-yellow-500' :
        'border-l-gray-300';

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-y border-r border-gray-100 dark:border-gray-700/50 mb-4 flex flex-col gap-3 transition-all active:scale-[0.98] border-l-4 ${statusColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50 whitespace-nowrap shadow-sm">{item.id}</span>
            <StatusBadge status={item.status} />
            <SignalWordBadge word={item.signalWord} />
          </div>
          <h3 className="font-black text-gray-900 dark:text-gray-100 text-xl leading-tight mb-1 antialiased tracking-tight">{item.name}</h3>
          <div className="text-xs font-mono flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-400">CAS</span> {item.cas || "N/A"}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 ml-2">
          <button
            onClick={() => onToggleDanger(item)}
            className={`p-2.5 rounded-xl transition-all shadow-sm border-2 ${item.signalWord === 'Danger'
              ? 'bg-red-600 text-white border-red-700 animate-pulse'
              : 'bg-white dark:bg-slate-700 text-gray-400 border-gray-100 dark:border-gray-600 hover:text-red-500 hover:border-red-200'
              }`}
            title={item.signalWord === 'Danger' ? "Remove Danger Status" : "Mark as Danger"}
          >
            <AlertTriangle size={20} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter">Current Quantity</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{item.remaining || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter">Lab Location</span>
          <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.location}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter">Imported On</span>
          <span className="font-medium text-gray-600 dark:text-gray-400">{item.importDate || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter">Best Before</span>
          <span className={`font-bold ${item.status === 'Expired' ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.expiry || "-"}
          </span>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ease-out">
          {item.hazard !== '-' && (
            <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100/50 dark:border-orange-900/30">
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest block mb-1">Hazard Warnings</span>
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{item.hazard}</span>
            </div>
          )}
          {item.expirationNote && item.expirationNote !== '-' && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest block mb-1">Logistics Note</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.expirationNote}</span>
            </div>
          )}
          <div className="px-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest block mb-2">GHS Pictograms</span>
            <GHSIcons ghs={item.ghs} size={28} />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 bg-gray-50 dark:bg-slate-900/20 rounded-xl text-xs font-black text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1.5 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50"
      >
        {isExpanded ? (
          <>Collapse Record <ChevronUp size={16} /></>
        ) : (
          <>View Full Record <ChevronDown size={16} /></>
        )}
      </button>
    </div>
  );
};





// --- 3. Main Application ---

const ChemicalInventoryApp = () => {
  // Data State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGHS, setFilterGHS] = useState("All");
  const [filterExpNote, setFilterExpNote] = useState("All");
  const [filterSignalWord, setFilterSignalWord] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState("inventory"); // 'inventory' or 'history'

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showDashboard, setShowDashboard] = useState(true);

  // --- Data Loading (Realtime) ---
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeToData((sanitizedData) => {
      setData(sanitizedData);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- History Loading ---
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToLogs((logs) => {
      setHistory(logs);
    });
    return () => unsubscribe();
  }, []);

  // --- Dark Mode Effect ---
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Processed Data (Main Data Enrichment) ---
  const processedData = useMemo(() => {
    return data.map(item => {
      // Logic: Only automatically mark as 'Expired' IF the status is 'Ready'
      // This respects manual changes to 'Dispose' or other custom statuses.
      if (item.status === 'Ready' && checkIsExpired(item.expiry)) {
        return { ...item, status: 'Expired' };
      }
      return item;
    });
  }, [data]);

  // --- Handlers ---

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Comprehensive Data Hardening & Sanitization
      const cleanId = formData.id?.trim() || "";
      const cleanName = formData.name?.trim() || "";
      const cleanCas = formData.cas?.trim() || "-";
      const cleanLocation = formData.location?.trim() || "-";
      const cleanHazard = formData.hazard?.trim() || "-";
      const cleanNote = formData.expirationNote?.trim() || "-";
      const cleanRemaining = formData.remaining?.trim() || "-";
      const cleanImport = formData.importDate?.trim() || "-";
      const cleanExpiry = formData.expiry?.trim() || "-";

      if (!cleanId || !cleanName) {
        throw new Error("โปรดระบุ Bottle ID และชื่อสารเคมี");
      }

      if (/[.#$[\]]/.test(cleanId)) {
        throw new Error("Bottle ID ห้ามมีตัวอักขระพิเศษ . # $ [ ]");
      }

      let finalFormData = {
        ...formData,
        id: cleanId,
        name: cleanName,
        cas: cleanCas,
        location: cleanLocation,
        hazard: cleanHazard,
        expirationNote: cleanNote,
        remaining: cleanRemaining,
        importDate: cleanImport,
        expiry: cleanExpiry,
        // Ensure old fields are cleared if they exist
        lastUpdated: null,
        updatedAt: null // Will be set by server
      };

      // Enforce Auto-Expiry Logic on Save
      if (checkIsExpired(finalFormData.expiry)) {
        finalFormData.status = "Expired";
      } else if (finalFormData.status === "Expired") {
        finalFormData.status = "Ready";
      }

      if (isEditing) {
        await firebaseService.saveItem(finalFormData);
        await firebaseService.pushLog('EDIT', cleanId, cleanName, `แก้ไขข้อมูลสารเคมี (สถานะ: ${finalFormData.status})`);
      } else {
        // Strict ID check (case-insensitive) for new entries
        if (data.some(item => item.id.trim().toLowerCase() === cleanId.toLowerCase())) {
          throw new Error(`ID ${cleanId} มีในระบบอยู่แล้ว โปรดใช้ ID อื่น`);
        }
        await firebaseService.saveItem(finalFormData);
        await firebaseService.pushLog('ADD', cleanId, cleanName, 'เพิ่มสารเคมีเข้าสู่ระบบ');
      }



      // Success
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const itemToDelete = data.find(item => item.id === id);
    setIsSaving(true);
    try {
      await firebaseService.deleteItem(id);
      await firebaseService.pushLog('DELETE', id, itemToDelete?.name || 'Unknown', 'ลบข้อมูลออกจากระบบ');
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting data");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDanger = async (item) => {
    const newSignalWord = item.signalWord === "Danger" ? "-" : "Danger";
    try {
      // Remove legacy string-based timestamp to rely on server synchronization
      const { lastUpdated, ...cleanItem } = item;
      await firebaseService.saveItem({ ...cleanItem, signalWord: newSignalWord });

      const details = newSignalWord === 'Danger' ? 'กำหนดสถานะ: Danger' : 'ยกเลิกสถานะ: Danger';
      await firebaseService.pushLog('TOGGLE_DANGER', item.id, item.name, details);
    } catch (err) {
      console.error("Toggle danger error:", err);
      setError("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("ต้องการลบประวัตินี้หรือไม่?")) return;
    try {
      await firebaseService.deleteLog(logId);
    } catch (err) {
      setError("ไม่สามารถลบประวัติได้");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("⚠️ คำเตือน: คุณกำลังจะลบประวัติการใช้งานทั้งหมด การกระทำนี้ไม่สามารถย้อนกลับได้\n\nยืนยันการลบประวัติทั้งหมด?")) return;
    try {
      await firebaseService.clearLogs();
      await firebaseService.pushLog('CLEAR_HISTORY', 'SYSTEM', 'System', 'ล้างประวัติการใช้งานทั้งหมด');
    } catch (err) {
      setError("ไม่สามารถล้างประวัติได้");
    }
  };

  // --- Derived Data ---
  const locations = useMemo(() => {
    const locs = new Set(processedData.map(d => d.location));
    return ["All", ...Array.from(locs)];
  }, [processedData]);

  const formLocations = useMemo(() => {
    const locs = new Set(processedData.map(d => d.location));
    if (formData.location && !locs.has(formData.location)) locs.add(formData.location);
    return Array.from(locs).sort();
  }, [processedData, formData.location]);

  const formExpirationNotes = useMemo(() => {
    const notes = new Set(processedData.map(d => d.expirationNote).filter(n => n && n !== '-'));
    return Array.from(notes).sort();
  }, [processedData]);

  const uniqueExpirationNotes = useMemo(() => {
    const notes = new Set(processedData.map(d => d.expirationNote).filter(n => n && n !== '-'));
    return ["All", ...Array.from(notes).sort()];
  }, [processedData]);

  const formHazards = useMemo(() => {
    const hazards = new Set(processedData.map(d => d.hazard).filter(h => h && h !== '-'));
    return Array.from(hazards).sort();
  }, [processedData]);

  const filteredData = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const isSearching = searchLower !== "";

    return processedData
      .filter(item => {
        // Keyword Search Logic
        let matchesSearch = true;
        if (isSearching) {
          matchesSearch =
            (item.name || "").toLowerCase().includes(searchLower) ||
            (item.id || "").toLowerCase().includes(searchLower) ||
            (item.cas || "").toLowerCase().includes(searchLower) ||
            (item.hazard || "").toLowerCase().includes(searchLower) ||
            (item.expirationNote || "").toLowerCase().includes(searchLower);
        }

        // Categorical Filters
        const matchesLocation = filterLocation === "All" || item.location === filterLocation;
        const matchesStatus = filterStatus === "All" || item.status === filterStatus;
        const matchesGHS = filterGHS === "All" || (item.ghs && item.ghs[filterGHS]);
        const matchesExpNote = filterExpNote === "All" || item.expirationNote === filterExpNote;
        const matchesSignalWord = filterSignalWord === "All" || item.signalWord === filterSignalWord;

        return matchesSearch && matchesLocation && matchesStatus && matchesGHS && matchesExpNote && matchesSignalWord;
      })
      .sort((a, b) => (a.id || "").localeCompare(b.id || "", undefined, { numeric: true, sensitivity: 'base' }));
  }, [processedData, searchTerm, filterLocation, filterStatus, filterGHS, filterExpNote, filterSignalWord]);

  const stats = useMemo(() => ({
    total: processedData.length,
    ready: processedData.filter(d => d.status === "Ready").length,
    dispose: processedData.filter(d => d.status === "Dispose").length,
    expired: processedData.filter(d => d.status === "Expired").length,
    flammable: processedData.filter(d => d.ghs?.flammable).length,
    danger: processedData.filter(d => d.signalWord === "Danger").length
  }), [processedData]);

  const overallLastUpdated = useMemo(() => {
    if (data.length === 0) return "-";

    // Find item with latest updatedAt timestamp
    const latest = data.reduce((max, item) => {
      return (item.updatedAt || 0) > (max.updatedAt || 0)
        ? item
        : max;
    }, { updatedAt: 0 });

    if (latest.updatedAt) {
      return formatDateTime(latest.updatedAt);
    }

    // Fallback for old data without timestamp
    return latest.lastUpdated || '-';
  }, [data]);

  // --- CRUD Handlers ---

  const handleAddNew = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({
      ...EMPTY_FORM,
      ...item,
      ghs: item.ghs || EMPTY_FORM.ghs
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLocation("All");
    setFilterStatus("All");
    setFilterGHS("All");
    setFilterExpNote("All");
    setFilterSignalWord("All");
  };

  const handleGhsToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      ghs: { ...prev.ghs, [key]: !prev.ghs[key] }
    }));
  };

  const handleStatClick = (type, value) => {
    // Reset all filters first
    setSearchTerm("");
    setFilterLocation("All");
    setFilterStatus("All");
    setFilterGHS("All");
    setFilterExpNote("All");
    setFilterSignalWord("All");

    // Apply specific filter
    if (type === 'status') setFilterStatus(value);
    if (type === 'ghs') setFilterGHS(value);
    if (type === 'signalWord') setFilterSignalWord(value);

    // Scroll to filter section
    setTimeout(() => {
      document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // --- Export Functions ---
  const exportToCSV = () => {
    const csvData = filteredData.map(item => ({
      ID: item.id,
      Name: item.name,
      CAS: item.cas,
      Quantity: item.remaining,
      Location: item.location,
      ImportDate: item.importDate || '-',
      Expiry: item.expiry || '-',
      SignalWord: item.signalWord || '-',
      Status: item.status,
      GHS: Object.keys(item.ghs || {})
        .filter(k => item.ghs[k])
        .map(k => GHS_CONFIG.find(g => g.key === k)?.label || k)
        .join('| '),
      Hazard: item.hazard,
      Note: item.expirationNote
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chemical-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const htmlTable = `
      <style>
        table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
        th { background-color: #2563eb; color: #ffffff; font-weight: bold; border: 1px solid #dee2e6; padding: 12px; text-align: left; }
        td { border: 1px solid #dee2e6; padding: 10px; text-align: left; vertical-align: middle; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .header-main { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #1e293b; }
      </style>
      <div class="header-main">Chemical & Bio Lab Inventory Report - ${new Date().toLocaleDateString('th-TH')}</div>
      <table>
        <thead>
          <tr>
            <th>Bottle ID</th>
            <th>Chemical Name</th>
            <th>CAS No.</th>
            <th>Remaining Quantity</th>
            <th>Location</th>
            <th>Date Imported</th>
            <th>Date Expiry</th>
            <th>Signal Word</th>
            <th>Current Status</th>
            <th>GHS pictograms</th>
            <th>Hazard Details</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${filteredData.map(item => `
            <tr>
              <td>${item.id}</td>
              <td>${item.name}</td>
              <td>${item.cas || '-'}</td>
              <td>${item.remaining || '-'}</td>
              <td>${item.location || '-'}</td>
              <td>${item.importDate || '-'}</td>
              <td>${item.expiry || '-'}</td>
              <td>${item.signalWord || '-'}</td>
              <td>${item.status}</td>
              <td>${Object.keys(item.ghs || {})
        .filter(k => item.ghs[k])
        .map(k => GHS_CONFIG.find(g => g.key === k)?.label || k)
        .join(', ')}</td>
              <td>${item.hazard || '-'}</td>
              <td>${item.expirationNote || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob(['\ufeff', htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chemical-inventory-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20 md:pb-0 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation Row */}
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo & Title Section */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 md:p-2.5 rounded-xl shadow-lg shadow-blue-200/20 dark:shadow-none transition-transform active:scale-95 cursor-pointer">
                <Beaker className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base md:text-xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight truncate max-w-[140px] xs:max-w-[180px] md:max-w-none">
                  Chemical & Bio <span className="hidden xs:inline">☣️</span>
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Lab Inventory System</p>
              </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Desktop Status (Hidden on Mobile) */}
              <div className="hidden lg:flex flex-col items-end mr-2">
                {isSaving ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/30">
                    <Loader2 size={12} className="animate-spin" /> Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-100 dark:border-green-800/30">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                  </div>
                )}
                <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={10} /> Updated: {overallLastUpdated}
                </div>
              </div>

              {/* View Switcher */}
              <button
                onClick={() => setViewMode(viewMode === "inventory" ? "history" : "inventory")}
                className={`flex items-center gap-2 p-2 md:p-2.5 rounded-xl transition-all active:scale-95 ${viewMode === "history" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                title={viewMode === "history" ? "Back to Inventory" : "View History"}
              >
                <Clock size={18} />
                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">{viewMode === "history" ? "Inventory" : "History"}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 md:p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Export - Desktop */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                  <Download size={18} />
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1.5">
                  <button onClick={exportToCSV} className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors">
                    📄 Export as CSV
                  </button>
                  <button onClick={exportToExcel} className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-colors">
                    📊 Export as Excel
                  </button>
                </div>
              </div>

              {/* Export - Mobile */}
              <div className="md:hidden relative">
                <button
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    menu.classList.toggle('hidden');
                  }}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <Download size={18} />
                </button>
                <div className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 p-1.5 animate-in slide-in-from-top-2 duration-200">
                  <button onClick={exportToCSV} className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl">📄 Export CSV</button>
                  <button onClick={() => {
                    if (window.confirm('ดาวน์โหลด Excel ต่อหรือไม่?')) exportToExcel();
                  }} className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl mt-1">📊 Export Excel</button>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-2 md:px-5 md:py-2.5 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <Plus size={20} />
                <span className="hidden sm:inline font-bold text-sm">Add Chemical</span>
              </button>
            </div>
          </div>

          {/* Mobile Status Row (Dynamic) */}
          <div className="lg:hidden flex items-center justify-center gap-4 py-2 border-t border-gray-100 dark:border-gray-800/50">
            {isSaving ? (
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Loader2 size={10} className="animate-spin" /> Saving...
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-green-600 dark:text-green-400">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span> Online
              </div>
            )}
            <div className="h-3 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} /> Sync: {overallLastUpdated}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12">

        {viewMode === "history" ? (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Activity Logs</h2>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">ประวัติการใช้งานระบบทั้งหมด</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleClearHistory}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl font-black text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
                >
                  <Trash2 size={18} /> Clear All History
                </button>
                <button
                  onClick={() => setViewMode("inventory")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <ArrowRight size={18} /> Back to Inventory
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-700/50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Action</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Item Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">ID</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Details</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Time</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-20 text-center text-gray-400 dark:text-gray-500 font-bold">
                          No activity history found.
                        </td>
                      </tr>
                    ) : (
                      history.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${log.action === 'ADD' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                              log.action === 'EDIT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                log.action === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30'
                              }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">{log.itemName}</td>
                          <td className="px-6 py-4 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 tracking-tighter">{log.itemId}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 italic">"{log.details}"</td>
                          <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Safety Awareness Banner */}
            {stats.danger > 0 && (
              <div className="mb-6 p-4 bg-red-600 border border-red-700 rounded-xl text-white flex items-center justify-between shadow-lg shadow-red-200 dark:shadow-none animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="shrink-0" />
                  <div>
                    <h4 className="font-black text-lg leading-tight">DANGER ALERT: {stats.danger} ITEMS</h4>
                    <p className="text-sm text-red-100 opacity-90">พบสารเคมีอันตรายระดับสูง โปรดปฏิบัติตามระเบียบความปลอดภัยอย่างเคร่งครัด</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStatClick('signalWord', 'Danger')}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors hidden sm:block shadow-sm"
                >
                  See All Danger Items
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2 text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Stats Grid - Ultra Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <button
                onClick={() => handleStatClick('all', null)}
                className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[40px] flex items-center justify-center transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30">
                  <Beaker size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Inventory</div>
                <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{stats.total}</div>
              </button>

              <button
                onClick={() => handleStatClick('status', 'Ready')}
                className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden border-l-4 border-l-green-500"
              >
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Available</div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400">{stats.ready}</div>
                <div className="mt-2 h-1 w-full bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(stats.ready / (stats.total || 1)) * 100}%` }}></div>
                </div>
              </button>

              <button
                onClick={() => handleStatClick('status', 'Dispose')}
                className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden border-l-4 border-l-yellow-500"
              >
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">To Dispose</div>
                <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{stats.dispose}</div>
                <div className="mt-2 h-1 w-full bg-yellow-100 dark:bg-yellow-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${(stats.dispose / (stats.total || 1)) * 100}%` }}></div>
                </div>
              </button>

              <button
                onClick={() => handleStatClick('ghs', 'flammable')}
                className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden border-l-4 border-l-red-500"
              >
                <div className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Flame size={12} /> Flammable
                </div>
                <div className="text-3xl font-black text-red-600 dark:text-red-400">{stats.flammable}</div>
              </button>

              <button
                onClick={() => handleStatClick('signalWord', 'Danger')}
                className="group relative bg-red-600 p-5 rounded-2xl shadow-lg border border-red-700 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 text-left overflow-hidden ring-offset-2 hover:ring-2 hover:ring-red-500">
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:scale-110">
                  <AlertTriangle size={24} className="text-white opacity-40" />
                </div>
                <div className="text-red-100 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Safety: Danger</div>
                <div className="text-3xl font-black text-white relative z-10">{stats.danger}</div>
                <div className="mt-2 text-[10px] text-red-100 font-bold flex items-center gap-1 italic relative z-10">
                  Check High Risk Items <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleStatClick('status', 'Expired')}
                className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden border-l-4 border-l-red-800"
              >
                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Expired</div>
                <div className="text-3xl font-black text-red-800 dark:text-red-500">{stats.expired}</div>
              </button>
            </div>

            {/* Stats Dashboard */}
            {showDashboard && data.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-all">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-start gap-2">
                    <BarChart3 size={20} className="text-blue-600 dark:text-blue-400 mt-1" />
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Statistics Overview</h3>
                      {overallLastUpdated && overallLastUpdated !== '-' && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock size={10} className="text-gray-400" />
                          <span className="font-medium italic">Data Updated: {overallLastUpdated}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDashboard(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Location Distribution</h4>
                    {(() => {
                      const locationCounts = data.reduce((acc, item) => {
                        acc[item.location] = (acc[item.location] || 0) + 1;
                        return acc;
                      }, {});
                      const maxCount = Math.max(...Object.values(locationCounts));

                      return (
                        <div className="space-y-2">
                          {Object.entries(locationCounts).map(([loc, count]) => (
                            <div key={loc} className="flex items-center gap-2">
                              <div className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate" title={loc}>{loc}</div>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-blue-500 dark:bg-blue-400 h-full transition-all duration-500 flex items-center justify-end pr-2"
                                  style={{ width: `${(count / maxCount) * 100}%` }}
                                >
                                  <span className="text-xs text-white font-medium">{count}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Hazard Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">GHS Distribution</h4>
                    {(() => {
                      const ghsCounts = GHS_CONFIG.map(g => ({
                        ...g,
                        count: data.filter(item => item.ghs && item.ghs[g.key]).length
                      })).filter(g => g.count > 0).sort((a, b) => b.count - a.count);
                      const maxCount = Math.max(...ghsCounts.map(g => g.count));

                      return (
                        <div className="space-y-2">
                          {ghsCounts.map((ghs) => (
                            <div key={ghs.key} className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <ghs.icon size={14} className={ghs.color} />
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 w-20 truncate" title={ghs.label}>{ghs.label}</div>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${ghs.bg}`}
                                  style={{ width: `${(ghs.count / maxCount) * 100}%` }}
                                >
                                  <span className="text-xs text-gray-900 dark:text-black-800 font-bold drop-shadow-sm">{ghs.count}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {!showDashboard && data.length > 0 && (
              <button
                onClick={() => setShowDashboard(true)}
                className="mb-6 w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <BarChart3 size={18} />
                <span className="text-sm font-medium">Show Statistics Overview</span>
              </button>
            )}

            {/* Filters - Glass Panel */}
            <div id="filter-section" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg border border-white dark:border-gray-700/50 mb-8 flex flex-col gap-4 sticky top-20 z-20 md:static transition-all ring-1 ring-black/5 dark:ring-white/5">

              {/* Top Row: Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสาร, ID, CAS, Hazard หรือหมายเหตุ..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-600 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Bottom Row: Dropdowns - Ultra Responsive */}
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">

                {/* Location Filter */}
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  >
                    <option value="All">ทุกที่ (All Locations)</option>
                    {locations.filter(l => l !== 'All').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">สถานะ (Status)</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                {/* Signal Word Filter */}
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                    value={filterSignalWord}
                    onChange={(e) => setFilterSignalWord(e.target.value)}
                  >
                    <option value="All">กลุ่มความปลอดภัย</option>
                    {SIGNAL_WORD_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                {/* GHS Filter */}
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                    value={filterGHS}
                    onChange={(e) => setFilterGHS(e.target.value)}
                  >
                    <option value="All">อันตราย (GHS)</option>
                    {GHS_CONFIG.map(ghs => (
                      <option key={ghs.key} value={ghs.key}>{ghs.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                {/* Expiration Note Filter */}
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                    value={filterExpNote}
                    onChange={(e) => setFilterExpNote(e.target.value)}
                  >
                    <option value="All">หมายเหตุ (Notes)</option>
                    {uniqueExpirationNotes.filter(n => n !== 'All').map(note => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                {/* Refresh & Reset Group */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      const minDelay = new Promise(resolve => setTimeout(resolve, 800));
                      Promise.all([firebaseService.fetchDataOnce(), minDelay])
                        .then(([newData]) => {
                          setData(newData);
                          setIsLoading(false);
                        })
                        .catch(err => {
                          console.error("Error refreshing data:", err);
                          setError("รีเฟรชไม่สำเร็จ");
                          setIsLoading(false);
                        });
                    }}
                    className="flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl hover:bg-blue-100 transition-all active:scale-90 focus:ring-4 focus:ring-blue-500/10"
                    title="รีเฟรชข้อมูล"
                  >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                  </button>

                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 focus:ring-4 focus:ring-red-500/10"
                    title="ล้างตัวกรองทั้งหมด"
                  >
                    <X size={18} />
                  </button>
                </div>

              </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-500 dark:text-blue-400" />
                <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <>
                {/* Mobile View: Cards */}
                <div className="md:hidden">
                  {filteredData.map((item) => (
                    <ChemicalCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleDanger={toggleDanger}
                    />
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ring-1 ring-black/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f1f5f9] dark:bg-slate-900 text-gray-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-5 w-[8%]">Asset ID</th>
                          <th className="p-5 w-[25%]">Specification / Identification</th>
                          <th className="p-5 w-[10%] text-center">Qty</th>
                          <th className="p-5 w-[15%]">Timeline (In/Out)</th>
                          <th className="p-5 w-[12%]">Station</th>
                          <th className="p-5 w-[10%] text-center">Logistics</th>
                          <th className="p-5 w-[10%] text-center">Compliance</th>
                          <th className="p-5 w-[5%] text-center">Status</th>
                          <th className="p-5 w-[5%] text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                            <td className="p-4 font-mono font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">{item.id}</td>
                            <td className="p-4">
                              <div className="font-bold text-gray-800 dark:text-gray-100">{item.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{item.cas}</div>
                              {item.hazard !== '-' && <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 bg-orange-50 dark:bg-orange-900/30 inline-block px-1 rounded">{item.hazard}</div>}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="text-gray-900 dark:text-gray-100 font-medium">{item.remaining}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="text-xs text-gray-500 dark:text-gray-400">In:  <span className="text-gray-700 dark:text-gray-200 font-medium">{item.importDate || '-'}</span></div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Exp: <span className={`font-medium ${item.status === 'Expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{item.expiry || '-'}</span></div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-700 dark:text-gray-300">{item.location}</td>
                            <td className="p-4 text-center">
                              {item.expirationNote && item.expirationNote !== '-' ? (
                                <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block max-w-[150px] truncate" title={item.expirationNote}>
                                  {item.expirationNote}
                                </div>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                              )}
                            </td>
                            <td className="p-4 text-center min-w-[120px]">
                              <div className="flex justify-center">
                                <GHSIcons ghs={item.ghs} />
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => toggleDanger(item)}
                                  className={`p-1.5 rounded-lg transition-all border ${item.signalWord === 'Danger'
                                    ? 'text-white bg-red-600 border-red-700 shadow-sm'
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 border-transparent'
                                    }`}
                                  title={item.signalWord === 'Danger' ? "Remove Danger Status" : "Mark as Danger"}
                                >
                                  <AlertTriangle size={18} />
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  title="แก้ไข"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <span>แสดง {filteredData.length} รายการ จากทั้งหมด {processedData.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all overflow-hidden group">
                <div className="p-8 bg-gray-50 dark:bg-slate-900 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Search size={64} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">No Chemicals Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8">
                  We couldn't find any results matching your current filters or search query. Try adjusting your search or clearing filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Footer with Info */}
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 dark:text-gray-500 mb-8">
              <p className="text-xs font-bold uppercase tracking-wider">© 2025 Lab Inventory System v4.5</p>
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => setViewMode('inventory')}>Inventory</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => setViewMode('history')}>History Log</span>
              </div>
            </div>
          </>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-800 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl shadow-2xl md:rounded-3xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out transition-all">

              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white dark:bg-slate-800 md:rounded-t-3xl sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isEditing ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                    {isEditing ? <Edit className="text-amber-600" size={24} /> : <Plus className="text-blue-600" size={24} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                      {isEditing ? 'Edit Record' : 'Create Entry'}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Chemical Information System v4.0</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-2.5 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col h-full min-h-0">
                {/* Modal Body - Scrollable */}
                <div className="p-4 md:p-6 overflow-y-auto flex-1 min-h-0">
                  {/* Error in Modal */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ID */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">รหัสขวด (Bottle ID) ⚠️ใส่แล้วเปลี่ยนไม่ได้ <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleFormChange}
                        required
                        disabled={isEditing}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300'}`}
                        placeholder="เช่น A001"
                      />
                    </div>

                    {/* CAS No */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                        CAS No.
                      </label>
                      <input
                        type="text"
                        name="cas"
                        value={formData.cas}
                        onChange={handleFormChange}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 outline-none transition-all font-normal border-gray-300 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="เช่น 7783-20-2"
                      />
                    </div>

                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">ชื่อสารเคมี (Chemical Name) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                        placeholder="ระบุชื่อสารเคมีภาษาอังกฤษ"
                      />
                    </div>

                    {/* Location */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">สถานที่จัดเก็บ</label>
                      <input
                        type="text"
                        name="location"
                        list="location-list"
                        value={formData.location}
                        onChange={handleFormChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                        placeholder="เช่น Storage 1, ห้องเก็บของ 2"
                      />
                      <datalist id="location-list">
                        {formLocations.map(loc => <option key={loc} value={loc} />)}
                      </datalist>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">สถานะ</label>
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleFormChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white appearance-none font-normal"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* GHS Signal Word - Quick Selection Buttons */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-black text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">
                        Signal Word (ระดับความรุนแรง)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {SIGNAL_WORD_OPTIONS.map(opt => {
                          const isActive = formData.signalWord === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, signalWord: opt.value }))}
                              className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 flex items-center justify-center text-center shadow-sm active:scale-90 ${isActive
                                ? `${opt.color} border-current scale-105 shadow-md`
                                : 'bg-gray-50 dark:bg-slate-700/50 text-gray-400 border-transparent dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600'
                                }`}
                            >
                              {opt.label.split(' (')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Remaining & Expiry */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">ปริมาณคงเหลือ</label>
                      <input
                        type="text"
                        name="remaining"
                        value={formData.remaining}
                        onChange={handleFormChange}
                        placeholder="เช่น 500/500 g หรือ 300/500 ml"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">วันนำเข้า (Import Date)</label>
                      <input
                        type="text"
                        name="importDate"
                        value={formData.importDate}
                        onChange={handleFormChange}
                        placeholder="เช่น 18/12/2025"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">วันหมดอายุ (Expiry Date)</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleFormChange}
                        placeholder="เช่น พ.ค.-26 หรือ 9/11/2026"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                    </div>

                    {/* Expiration Note */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <FileText size={14} className="text-gray-400" />
                        กรณีสารหมดอายุ/หมายเหตุ/Note
                      </label>
                      <input
                        type="text"
                        name="expirationNote"
                        list="expirationNote-list"
                        value={formData.expirationNote}
                        onChange={handleFormChange}
                        placeholder="เช่น ส่งกำจัดที่ตึก B, รอการบริจาค, หมายเหตุ/Noteเพิ่มเติม"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                      <datalist id="expirationNote-list">
                        {formExpirationNotes.map(note => <option key={note} value={note} />)}
                      </datalist>
                    </div>

                    {/* Hazard Text */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">คำอธิบายความเป็นอันตราย (Hazard Text)/highlight</label>

                      <input
                        type="text"
                        name="hazard"
                        list="hazard-list"
                        value={formData.hazard}
                        onChange={handleFormChange}
                        placeholder="เช่น ระวังเข้าตา, ห้ามสูดดม, highlight ต่างๆที่อยากเพิ่ม"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                      <datalist id="hazard-list">
                        {formHazards.map(h => <option key={h} value={h} />)}
                      </datalist>
                    </div>

                    {/* GHS Checkboxes */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="block text-sm font-bold text-gray-800 mb-3">สัญลักษณ์ GHS (เลือกตามจริง)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GHS_CONFIG.map((ghs) => (
                          <div
                            key={ghs.key}
                            onClick={() => handleGhsToggle(ghs.key)}
                            className={`
                              cursor-pointer flex items-center gap-2 p-2 rounded-lg border text-xs sm:text-sm transition-all select-none
                              ${formData.ghs[ghs.key]
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'}
                            `}
                          >
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${formData.ghs[ghs.key] ? 'bg-white/20' : 'bg-gray-100'}`}>
                              <ghs.icon size={14} className={formData.ghs[ghs.key] ? 'text-white' : ghs.color} />
                            </div>
                            <span className="truncate">{ghs.label}</span>
                            {formData.ghs[ghs.key] && <Check size={14} className="ml-auto" />}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-900/50 md:rounded-b-3xl flex justify-end gap-4 shrink-0 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-6 py-3 text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-black text-sm active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !formData.id || !formData.name}
                    className={`px-8 py-3 text-white rounded-2xl shadow-xl transition-all active:scale-95 font-black text-sm flex items-center gap-3 disabled:opacity-50 ${isEditing ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200/50' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200/50'}`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {isEditing ? 'Update Entry' : 'Save Entry'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChemicalInventoryApp;
