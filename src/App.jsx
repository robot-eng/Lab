import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, AlertTriangle, Beaker, Flame, Skull, Droplet, Wind, CircleDot, Bug, AlertCircle,
  Plus, Trash2, Edit, X, ChevronDown, ChevronUp, Loader2, RefreshCw, FileText, Check, Save, FileSpreadsheet,
  Bomb, Fish, Moon, Sun, Download, BarChart3, Clock, AlertCircle, AlertTriangle, Beaker, Flame, Skull, Wind, CircleDot
} from 'lucide-react';
import { firebaseService } from './services/firebaseService';
import { GHS_CONFIG, STATUS_OPTIONS, EMPTY_FORM, SIGNAL_WORD_OPTIONS } from './constants';
import { checkIsExpired, formatDateTime, isValidCAS } from './utils';

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
const ChemicalCard = ({ item, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 flex flex-col gap-3 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 whitespace-nowrap">{item.id}</span>
            <StatusBadge status={item.status} />
            <SignalWordBadge word={item.signalWord} />
          </div>
          <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1">{item.name}</h3>
          <div className={`text-xs font-mono flex items-center gap-1 ${item.cas && !isValidCAS(item.cas) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            <FileText size={10} /> CAS: {item.cas || "N/A"}
            {item.cas && !isValidCAS(item.cas) && <AlertCircle size={10} title="Invalid CAS Format" />}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-100 dark:border-gray-600">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block">Quantity</span>
          <span className="font-medium">{item.remaining || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block">Location</span>
          <span className="font-medium">{item.location}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block">Import Date</span>
          <span className="font-medium">{item.importDate || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block">Expiry Date</span>
          <span className={`font-medium ${item.status === 'Expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.expiry || "-"}
          </span>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.hazard !== '-' && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">Hazard</span>
              <span className="text-sm text-orange-700 dark:text-orange-400">{item.hazard}</span>
            </div>
          )}
          {item.expirationNote && item.expirationNote !== '-' && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">Expiration Note</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded inline-block">{item.expirationNote}</span>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">GHS</span>
            <GHSIcons ghs={item.ghs} size={20} />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-1 transition-colors"
      >
        {isExpanded ? (
          <>Hide Details <ChevronUp size={14} /></>
        ) : (
          <>Show More <ChevronDown size={14} /></>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

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

  // --- Dark Mode Effect ---
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Processed Data (Auto-Expiry) ---
  const processedData = useMemo(() => {
    return data.map(item => {
      // If status is 'Ready' AND it is expired -> Override to 'Expired'
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
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const currentDateTime = `${day}/${month}/${year} at ${hours}:${minutes}`;

      let finalFormData = {
        ...formData,
        lastUpdated: currentDateTime,
        updatedAt: Date.now()
      };

      // Enforce Auto-Expiry Logic on Save
      if (checkIsExpired(finalFormData.expiry)) {
        finalFormData.status = "Expired";
      } else if (finalFormData.status === "Expired") {
        // If date is valid (not expired) but status is 'Expired', reset to 'Ready'
        finalFormData.status = "Ready";
      }

      if (isEditing) {
        // Atomic Update
        await firebaseService.saveItem(finalFormData);
      } else {
        // Check if ID exists before adding new
        if (data.some(item => item.id === formData.id)) {
          throw new Error(`ID ${formData.id} already exists. Please use a different ID.`);
        }
        await firebaseService.saveItem(finalFormData);
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

    setIsSaving(true);
    try {
      await firebaseService.deleteItem(id);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting data");
    } finally {
      setIsSaving(false);
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

  const filteredData = processedData.filter(item => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.cas || "").includes(searchTerm);
    const matchesLocation = filterLocation === "All" || item.location === filterLocation;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesGHS = filterGHS === "All" || (item.ghs && item.ghs[filterGHS]);
    const matchesExpNote = filterExpNote === "All" || item.expirationNote === filterExpNote;

    return matchesSearch && matchesLocation && matchesStatus && matchesGHS && matchesExpNote;
  });

  const stats = {
    total: processedData.length,
    ready: processedData.filter(d => d.status === "Ready").length,
    dispose: processedData.filter(d => d.status === "Dispose").length,
    expired: processedData.filter(d => d.status === "Expired").length,
    flammable: processedData.filter(d => d.ghs?.flammable).length,
    danger: processedData.filter(d => d.signalWord === "Danger").length
  };

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

    // Apply specific filter
    if (type === 'status') setFilterStatus(value);
    if (type === 'ghs') setFilterGHS(value);

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
      Location: item.location,
      Remaining: item.remaining,
      ImportDate: item.importDate || '-',
      Expiry: item.expiry || '-',

      Status: item.status,
      GHS: Object.keys(item.ghs || {})
        .filter(k => item.ghs[k])
        .map(k => GHS_CONFIG.find(g => g.key === k)?.label || k)
        .join(', '),
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
      <table>
        <tr>
          <th>ID</th><th>Name</th><th>CAS</th><th>Location</th><th>Remaining</th>
          <th>Import Date</th><th>Expiry</th><th>Status</th><th>GHS</th><th>Hazard</th><th>Note</th>
        </tr>
        ${filteredData.map(item => `
          <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.cas}</td>
            <td>${item.location}</td>
            <td>${item.remaining}</td>
            <td>${item.importDate || '-'}</td>
            <td>${item.expiry || '-'}</td>
            <td>${item.status}</td>
            <td>${Object.keys(item.ghs || {})
        .filter(k => item.ghs[k])
        .map(k => GHS_CONFIG.find(g => g.key === k)?.label || k)
        .join(', ')}</td>
            <td>${item.hazard}</td>
            <td>${item.expirationNote}</td>
          </tr>
        `).join('')}
      </table>
      `;

    const blob = new Blob(['\ufeff', htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chemical-inventory-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20 md:pb-0 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-lg transition-colors">
                <Beaker className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">chemical & Bio ☣️</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Lab Inventory System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              {isSaving ? (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </div>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Export Dropdown - Desktop */}
              <div className="hidden md:block relative group">
                <button
                  className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Export ข้อมูล"
                >
                  <Download size={18} />
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    📄 Export CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    📊 Export Excel
                  </button>
                </div>
              </div>

              {/* Export Dropdown - Mobile */}
              <div className="md:hidden relative">
                <button
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    menu.classList.toggle('hidden');
                  }}
                  className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Export ข้อมูล"
                >
                  <Download size={18} />
                </button>
                <div className="hidden absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    📄 Export CSV
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('การดาวน์โหลด Excel บนมือถืออาจมีข้อจำกัด\n\nหากดาวน์โหลดไม่สำเร็จ แนะนำให้ใช้คอมพิวเตอร์ หรือเลือก Export CSV แทน\n\nต้องการดาวน์โหลด Excel ต่อหรือไม่?')) {
                        exportToExcel();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    📊 Export Excel
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddNew}
                className="md:hidden flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={handleAddNew}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
                Add New Chemical
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">

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
              onClick={() => {
                setFilterStatus("All");
                setFilterGHS("All");
                setSearchTerm("");
                // We don't have a signal word filter yet, but we'll show all and highlight
              }}
              className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors hidden sm:block"
            >
              See All
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => handleStatClick('all', null)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Inventory</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.total}</div>
          </button>
          <button
            onClick={() => handleStatClick('status', 'Ready')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Available</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.ready}</div>
          </button>
          <button
            onClick={() => handleStatClick('status', 'Dispose')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">To Dispose</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.dispose}</div>
          </button>
          <button
            onClick={() => handleStatClick('ghs', 'flammable')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Flame size={12} /> Flammable
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.flammable}</div>
          </button>

          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col justify-between transition-all">
            <div className="text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">Safety: Danger</div>
            <div className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{stats.danger}</div>
          </div>
          <button
            onClick={() => handleStatClick('status', 'Expired')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Expired</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.expired}</div>
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

        {/* Filters */}
        <div id="filter-section" className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col gap-2 md:gap-3 sticky top-16 z-20 md:static transition-all">

          {/* Top Row: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="ค้นหา keyword ชื่อสาร, ID, และ CAS เท่านั้น"
              className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-600 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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

          {/* Bottom Row: Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">

            {/* Location Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'ทุกสถานที่' : loc}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">ทุกสถานะ</option>
                <option value="Ready">พร้อมใช้งาน</option>
                <option value="Not Ready">ไม่พร้อมใช้งาน</option>
                <option value="Expired">หมดอายุ</option>
                <option value="Dispose">ส่งกำจัด</option>
                <option value="Donate">บริจาค</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {/* GHS Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                value={filterGHS}
                onChange={(e) => setFilterGHS(e.target.value)}
              >
                <option value="All">ทุกอันตราย (GHS)</option>
                <option value="explosive">วัตถุระเบิด</option>
                <option value="flammable">สารไวไฟ</option>
                <option value="oxidizing">สารออกซิไดส์</option>
                <option value="gas">ก๊าซภายใต้ความดัน</option>
                <option value="corrosive">สารกัดกร่อน</option>
                <option value="toxic">สารมีพิษ</option>
                <option value="irritant">สารระคายเคือง</option>
                <option value="health">อันตรายต่อสุขภาพ</option>
                <option value="env">อันตรายต่อสิ่งแวดล้อม</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {/* Expiration Note Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                value={filterExpNote}
                onChange={(e) => setFilterExpNote(e.target.value)}
              >
                <option value="All">ทุกหมายเหตุ</option>
                {uniqueExpirationNotes.filter(n => n !== 'All').map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setIsLoading(true);
                // Add minimum delay to show spinner
                const minDelay = new Promise(resolve => setTimeout(resolve, 800));

                Promise.all([firebaseService.fetchDataOnce(), minDelay])
                  .then(([newData]) => {
                    setData(newData);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    console.error("Error refreshing data:", err);
                    setError("ไม่สามารถรีเฟรชข้อมูลได้ (Timeout)");
                    setIsLoading(false);
                  });
              }}
              className="flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 col-span-1"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span className="md:hidden text-xs font-medium">รีเฟรช</span>
            </button>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 col-span-1"
              title="ล้างตัวกรอง"
            >
              <X size={16} />
              <span className="md:hidden text-xs font-medium">ล้างตัวกรอง</span>
            </button>

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
                />
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 w-[10%]">ID</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 w-[25%]">ชื่อสารเคมี / CAS</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 w-[10%]">ปริมาณ</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 w-[15%]">รับเข้า / หมดอายุ</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 w-[10%]">ที่เก็บ</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 text-center w-[10%]">หมายเหตุ</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 text-center w-[10%]">GHS</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 text-center w-[5%]">สถานะ</th>
                      <th className="p-4 border-b border-gray-200 dark:border-gray-600 text-right w-[5%]">จัดการ</th>
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
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 transition-colors">
            <FileSpreadsheet size={48} className="mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

              <form onSubmit={handleSave} className="flex flex-col h-full min-h-0">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 shrink-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {isEditing ? 'แก้ไขข้อมูลสารเคมี' : 'เพิ่มสารเคมีใหม่'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">กรอกข้อมูลให้ครบถ้วนเพื่อความถูกต้อง</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

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
                        {formData.cas && !isValidCAS(formData.cas) && (
                          <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold animate-bounce">
                            <AlertCircle size={10} /> รูปแบบไม่ถูกต้อง
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="cas"
                        value={formData.cas}
                        onChange={handleFormChange}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none transition-all font-normal ${formData.cas && !isValidCAS(formData.cas) ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
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

                    {/* GHS Signal Word */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">GHS Signal Word (ความรุนแรง)</label>
                      <div className="relative">
                        <select
                          name="signalWord"
                          value={formData.signalWord}
                          onChange={handleFormChange}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none appearance-none font-bold ${SIGNAL_WORD_OPTIONS.find(o => o.value === formData.signalWord)?.color.includes('red') ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                        >
                          {SIGNAL_WORD_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
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
                <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 md:rounded-b-2xl flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !formData.id || !formData.name}
                    className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        บันทึกข้อมูล
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
