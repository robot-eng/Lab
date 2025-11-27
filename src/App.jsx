import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, AlertTriangle, Beaker, Flame, Skull, Droplet, Wind, CircleDot, Bug, AlertCircle,
  Plus, Trash2, Edit, X, ChevronDown, ChevronUp, Loader2, RefreshCw, FileText, Check, Save, FileSpreadsheet,
  Bomb, Fish
} from 'lucide-react';
import { firebaseService } from './services/firebaseService';

const EMPTY_FORM = {
  id: "",
  name: "",
  cas: "",
  hazard: "",
  remaining: "",
  location: "",
  expiry: "",
  expirationNote: "",
  status: "Ready",
  ghs: { explosive: false, flammable: false, oxidizing: false, gas: false, corrosive: false, toxic: false, irritant: false, health: false, env: false }
};

// --- 1. Constants ---

const GHS_CONFIG = [
  { key: 'explosive', label: 'วัตถุระเบิด', icon: Bomb, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'flammable', label: 'สารไวไฟ', icon: Flame, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { key: 'oxidizing', label: 'สารออกซิไดส์', icon: CircleDot, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { key: 'gas', label: 'ก๊าซภายใต้ความดัน', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'corrosive', label: 'สารกัดกร่อน', icon: Beaker, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  { key: 'toxic', label: 'สารมีพิษ', icon: Skull, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'irritant', label: 'สารระคายเคือง', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'health', label: 'อันตรายต่อสุขภาพ', icon: AlertTriangle, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  { key: 'env', label: 'อันตรายต่อสิ่งแวดล้อม', icon: Fish, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
];

// --- 2. Utility Components ---

const StatusBadge = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let label = status;

  if (status === "Ready" || status === "TRUE") {
    colorClass = "bg-green-100 text-green-800 border border-green-200";
    label = "พร้อมใช้งาน";
  } else if (status === "Not Ready") {
    colorClass = "bg-red-100 text-red-800 border border-red-200";
    label = "ไม่พร้อมใช้งาน";
  } else if (status === "Dispose") {
    colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    label = "ส่งกำจัด";
  } else if (status === "Donate") {
    colorClass = "bg-blue-100 text-blue-800 border border-blue-200";
    label = "บริจาค";
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colorClass}`}>
      {label}
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
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{item.id}</span>
            <StatusBadge status={item.status} />
          </div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
          <div className="text-xs text-gray-500 font-mono mt-1">CAS: {item.cas}</div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
        <div>
          <span className="text-xs text-gray-500 block">ปริมาณ</span>
          <span className="font-medium">{item.remaining || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">วันหมดอายุ</span>
          <span className="font-medium">{item.expiry || "-"}</span>
        </div>
        <div className="col-span-2">
          <span className="text-xs text-gray-500 block">สถานที่เก็บ</span>
          <span className="font-medium">{item.location}</span>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.hazard !== '-' && (
            <div>
              <span className="text-xs text-gray-500 block">อันตราย</span>
              <span className="text-sm text-orange-700">{item.hazard}</span>
            </div>
          )}
          {item.expirationNote && item.expirationNote !== '-' && (
            <div>
              <span className="text-xs text-gray-500 block">หมายเหตุหมดอายุ</span>
              <span className="text-sm text-gray-700 bg-yellow-50 px-2 py-1 rounded inline-block">{item.expirationNote}</span>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500 block mb-1">GHS</span>
            <GHSIcons ghs={item.ghs} size={20} />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1 text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors"
      >
        {isExpanded ? (
          <>ซ่อนรายละเอียด <ChevronUp size={14} /></>
        ) : (
          <>ดูรายละเอียดเพิ่มเติม <ChevronDown size={14} /></>
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

  // --- Data Loading (Realtime) ---
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeToData((newData) => {
      setData(newData || []);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- Handlers ---

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let newData;
      if (isEditing) {
        newData = data.map(item => item.id === formData.id ? formData : item);
      } else {
        if (data.some(item => item.id === formData.id)) {
          throw new Error(`รหัสขวด ${formData.id} มีอยู่แล้ว กรุณาใช้รหัสอื่น`);
        }
        newData = [...data, formData];
      }

      // Save to Firebase
      await firebaseService.saveData(newData);

      // Success
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) return;

    setIsSaving(true);
    try {
      const newData = data.filter(item => item.id !== id);
      await firebaseService.saveData(newData);
    } catch (err) {
      console.error("Delete error:", err);
      setError("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Derived Data ---
  const locations = useMemo(() => {
    const locs = new Set(data.map(d => d.location));
    return ["All", ...Array.from(locs)];
  }, [data]);

  const formLocations = useMemo(() => {
    const locs = new Set(data.map(d => d.location));
    if (formData.location && !locs.has(formData.location)) locs.add(formData.location);
    return Array.from(locs).sort();
  }, [data, formData.location]);

  const formExpirationNotes = useMemo(() => {
    const notes = new Set(data.map(d => d.expirationNote).filter(n => n && n !== '-'));
    return Array.from(notes).sort();
  }, [data]);

  const uniqueExpirationNotes = useMemo(() => {
    const notes = new Set(data.map(d => d.expirationNote).filter(n => n && n !== '-'));
    return ["All", ...Array.from(notes).sort()];
  }, [data]);

  const formHazards = useMemo(() => {
    const hazards = new Set(data.map(d => d.hazard).filter(h => h && h !== '-'));
    return Array.from(hazards).sort();
  }, [data]);

  const filteredData = data.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cas.includes(searchTerm);
    const matchesLocation = filterLocation === "All" || item.location === filterLocation;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesGHS = filterGHS === "All" || (item.ghs && item.ghs[filterGHS]);
    const matchesExpNote = filterExpNote === "All" || item.expirationNote === filterExpNote;

    return matchesSearch && matchesLocation && matchesStatus && matchesGHS && matchesExpNote;
  });

  const stats = {
    total: data.length,
    ready: data.filter(d => d.status === "Ready").length,
    dispose: data.filter(d => d.status === "Dispose").length,
    flammable: data.filter(d => d.ghs?.flammable).length
  };

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

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Beaker className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">Chemical DB</h1>
                <p className="text-[10px] text-gray-500">Lab Inventory System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              {isSaving ? (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Loader2 size={12} className="animate-spin" /> บันทึก...
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </div>
              )}

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
                เพิ่มสารเคมีใหม่
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">สารเคมีทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">พร้อมใช้งาน</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.ready}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">รอส่งกำจัด</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.dispose}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">สารไวไฟ</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.flammable}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-2 md:gap-3 sticky top-16 z-20 md:static">

          {/* Top Row: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, ID, หรือ CAS..."
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
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
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'ทุกสถานที่' : loc}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">ทุกสถานะ</option>
                <option value="Ready">พร้อมใช้งาน</option>
                <option value="Not Ready">ไม่พร้อมใช้งาน</option>
                <option value="Dispose">ส่งกำจัด</option>
                <option value="Donate">บริจาค</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* GHS Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
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
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Expiration Note Filter */}
            <div className="relative">
              <select
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                value={filterExpNote}
                onChange={(e) => setFilterExpNote(e.target.value)}
              >
                <option value="All">ทุกหมายเหตุ</option>
                {uniqueExpirationNotes.filter(n => n !== 'All').map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setIsLoading(true);
                // Add minimum delay to show spinner
                const minDelay = new Promise(resolve => setTimeout(resolve, 800));

                Promise.all([firebaseService.fetchDataOnce(), minDelay])
                  .then(([data]) => {
                    setData(data || []);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    console.error("Error refreshing data:", err);
                    setError("ไม่สามารถรีเฟรชข้อมูลได้ (Timeout)");
                    setIsLoading(false);
                  });
              }}
              className="flex items-center justify-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-gray-50 col-span-1"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span className="md:hidden text-xs font-medium">รีเฟรช</span>
            </button>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white col-span-1"
              title="ล้างตัวกรอง"
            >
              <X size={16} />
              <span className="md:hidden text-xs font-medium">ล้างตัวกรอง</span>
            </button>

          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
            <p>กำลังโหลดข้อมูล...</p>
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
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-4 border-b w-[10%]">ID</th>
                      <th className="p-4 border-b w-[25%]">ชื่อสารเคมี / CAS</th>
                      <th className="p-4 border-b w-[15%]">ปริมาณ</th>
                      <th className="p-4 border-b w-[15%]">ที่เก็บ</th>
                      <th className="p-4 border-b text-center w-[10%]">หมายเหตุ</th>
                      <th className="p-4 border-b text-center w-[10%]">GHS</th>
                      <th className="p-4 border-b text-center w-[10%]">สถานะ</th>
                      <th className="p-4 border-b text-right w-[5%]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 font-mono font-medium text-blue-600 whitespace-nowrap">{item.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{item.cas}</div>
                          {item.hazard !== '-' && <div className="text-xs text-orange-600 mt-1 bg-orange-50 inline-block px-1 rounded">{item.hazard}</div>}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-gray-900 font-medium">{item.remaining}</div>
                          <div className="text-xs text-gray-400">Exp: {item.expiry}</div>
                        </td>
                        <td className="p-4">{item.location}</td>
                        <td className="p-4 text-center">
                          {item.expirationNote && item.expirationNote !== '-' ? (
                            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block max-w-[150px] truncate" title={item.expirationNote}>
                              {item.expirationNote}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
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
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
              <div className="p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center bg-gray-50">
                <span>แสดง {filteredData.length} รายการ จากทั้งหมด {data.length}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            <FileSpreadsheet size={48} className="mb-3 opacity-50" />
            <p>ไม่พบข้อมูลที่ค้นหา</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ID */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">รหัสขวด (Bottle ID) <span className="text-red-500">*</span></label>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">CAS No.</label>
                      <input
                        type="text"
                        name="cas"
                        value={formData.cas}
                        onChange={handleFormChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
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
                        value={formData.location}
                        onChange={handleFormChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                        placeholder="เช่น Storage 1, ห้องเก็บของ 2"
                      />
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
                          <option value="Ready">พร้อมใช้งาน</option>
                          <option value="Not Ready">ไม่พร้อมใช้งาน</option>
                          <option value="Dispose">ส่งกำจัด</option>
                          <option value="Donate">บริจาค</option>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">วันหมดอายุ</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleFormChange}
                        placeholder="เช่น พ.ค.-26 หรือ 9/11/2024"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                    </div>

                    {/* Expiration Note */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <FileText size={14} className="text-gray-400" />
                        กรณีสารหมดอายุ/หมายเหตุ
                      </label>
                      <input
                        type="text"
                        name="expirationNote"
                        value={formData.expirationNote}
                        onChange={handleFormChange}
                        placeholder="เช่น ส่งกำจัดที่ตึก B, รอการบริจาค, หมายเหตุเพิ่มเติม"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
                    </div>

                    {/* Hazard Text */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">คำอธิบายความเป็นอันตราย (Hazard Text)</label>

                      <input
                        type="text"
                        name="hazard"
                        value={formData.hazard}
                        onChange={handleFormChange}
                        placeholder="เช่น ระวังเข้าตา, ห้ามสูดดม"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal"
                      />
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
