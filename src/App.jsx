import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, AlertTriangle, Beaker, Flame, Skull, Droplet, Wind, CircleDot, Bug, AlertCircle,
  FileSpreadsheet, Plus, Trash2, Edit, X, Save, Check, FileText, ChevronDown, ChevronUp, Settings, Loader2, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { githubService } from './services/githubService';

// --- 1. Constants & Config ---
const DEFAULT_CONFIG = {
  owner: "",
  repo: "",
  token: "",
  path: "public/data.json"
};

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

const HAZARD_OPTIONS = [
  "สารกัดกร่อน", "สารไวไฟ", "สารมีพิษ", "สารระคายเคือง",
  "วัตถุระเบิด", "สารออกซิไดส์", "ก๊าซภายใต้ความดัน",
  "อันตรายต่อสุขภาพ", "อันตรายต่อสิ่งแวดล้อม"
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

  const icons = [
    { key: 'explosive', title: "วัตถุระเบิด", icon: <div className="text-orange-600">💥</div> },
    { key: 'flammable', title: "สารไวไฟ", icon: <div className="text-red-600"><Flame size={size} /></div> },
    { key: 'oxidizing', title: "สารออกซิไดส์", icon: <div className="text-yellow-600"><CircleDot size={size} /></div> },
    { key: 'gas', title: "ก๊าซภายใต้ความดัน", icon: <div className="text-blue-600"><Wind size={size} /></div> },
    { key: 'corrosive', title: "สารกัดกร่อน", icon: <div className="text-gray-600"><Beaker size={size} /></div> },
    { key: 'toxic', title: "สารมีพิษ", icon: <div className="text-purple-600"><Skull size={size} /></div> },
    { key: 'irritant', title: "สารระคายเคือง", icon: <div className="text-orange-500"><AlertCircle size={size} /></div> },
    { key: 'health', title: "อันตรายต่อสุขภาพ", icon: <div className="text-pink-600"><AlertTriangle size={size} /></div> },
    { key: 'env', title: "อันตรายต่อสิ่งแวดล้อม", icon: <div className="text-teal-600"><Bug size={size} /></div> },
  ];

  return (
    <div className="flex gap-1 flex-wrap">
      {icons.map((item) => (
        ghs[item.key] ? <div key={item.key} title={item.title} className="p-1 bg-gray-50 rounded border border-gray-200">{item.icon}</div> : null
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

// --- Settings Modal ---
const SettingsModal = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (isOpen) setLocalConfig(config);
  }, [isOpen, config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings size={20} className="text-gray-500" />
            ตั้งค่าการเชื่อมต่อ GitHub
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
            ข้อมูลนี้จะถูกเก็บไว้ในเครื่องของคุณเท่านั้น (Browser Storage) เพื่อใช้ในการบันทึกข้อมูลลง GitHub
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Username (Owner)</label>
            <input
              type="text" name="owner" value={localConfig.owner} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-normal" placeholder="e.g. yourusername"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
            <input
              type="text" name="repo" value={localConfig.repo} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-normal" placeholder="e.g. chemical-inventory"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token</label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                name="token"
                value={localConfig.token}
                onChange={handleChange}
                className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-normal"
                placeholder="ghp_xxxxxxxxxxxx"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">ต้องมีสิทธิ์ (Scope) 'repo' หรือ 'public_repo'</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">บันทึกตั้งค่า</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 3. Main Application ---

const ChemicalInventoryApp = () => {
  // Config State
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('github_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data State
  const [data, setData] = useState([]);
  const [fileSha, setFileSha] = useState(null);
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

  // --- Data Loading ---
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (config.owner && config.repo) {
        // Load from GitHub
        const result = await githubService.fetchData(config.owner, config.repo, config.path, config.token);
        setData(result.data);
        setFileSha(result.sha);
      } else {
        // Load local fallback or empty
        const saved = localStorage.getItem('chemical_inventory_data');
        if (saved) {
          setData(JSON.parse(saved));
        } else {
          // Try to load from public folder directly if no config yet (initial view)
          try {
            const res = await fetch('data.json');
            if (res.ok) {
              const jsonData = await res.json();
              setData(jsonData);
            }
          } catch (e) {
            console.log("Could not load initial data.json", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลจาก GitHub ได้ กรุณาตรวจสอบการตั้งค่า");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [config]);

  // --- Handlers ---

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('github_config', JSON.stringify(newConfig));
    setIsSettingsOpen(false);
  };

  const handleSaveData = async (newData) => {
    // Optimistic Update
    setData(newData);
    localStorage.setItem('chemical_inventory_data', JSON.stringify(newData)); // Local backup

    if (config.token && config.owner && config.repo) {
      setIsSaving(true);
      try {
        const newSha = await githubService.saveData(config.owner, config.repo, config.path, config.token, newData, fileSha);
        setFileSha(newSha);
        // alert("บันทึกข้อมูลลง GitHub เรียบร้อยแล้ว");
      } catch (err) {
        console.error(err);
        alert(`เกิดข้อผิดพลาดในการบันทึกไปยัง GitHub: ${err.message}`);
        // Revert or keep local? We keep local for now.
      } finally {
        setIsSaving(false);
      }
    } else {
      // alert("บันทึกในเครื่องเรียบร้อย (ยังไม่ได้เชื่อมต่อ GitHub)");
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
    setFormData(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`ยืนยันการลบรายการ ${id}?`)) {
      const newData = data.filter(item => item.id !== id);
      await handleSaveData(newData);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let newData;
    if (isEditing) {
      newData = data.map(item => item.id === formData.id ? formData : item);
    } else {
      if (data.some(item => item.id === formData.id)) {
        alert("รหัส Bottle ID นี้มีอยู่แล้ว กรุณาใช้รหัสอื่น");
        return;
      }
      newData = [formData, ...data];
    }
    await handleSaveData(newData);
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHazardToggle = (hazard) => {
    const currentHazards = formData.hazard ? formData.hazard.split(',').map(s => s.trim()).filter(Boolean) : [];
    let newHazards;
    if (currentHazards.includes(hazard)) {
      newHazards = currentHazards.filter(h => h !== hazard);
    } else {
      newHazards = [...currentHazards, hazard];
    }
    setFormData(prev => ({ ...prev, hazard: newHazards.join(', ') }));
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
              ) : config.token ? (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Offline
                </div>
              )}

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                title="ตั้งค่าการเชื่อมต่อ"
              >
                <Settings size={20} />
              </button>

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
        <div className="flex md:grid md:grid-cols-4 gap-3 mb-6 overflow-x-auto pb-2 md:pb-0 snap-x">
          <div className="min-w-[140px] snap-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">สารเคมีทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</div>
          </div>
          <div className="min-w-[140px] snap-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">พร้อมใช้งาน</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.ready}</div>
          </div>
          <div className="min-w-[140px] snap-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">รอส่งกำจัด</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.dispose}</div>
          </div>
          <div className="min-w-[140px] snap-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">สารไวไฟ</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.flammable}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-3 sticky top-16 z-20 md:static">

          {/* Top Row: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, ID, หรือ CAS..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bottom Row: Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">

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
              onClick={loadData}
              className="flex items-center justify-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-gray-50 col-span-2 md:col-span-1"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span className="md:hidden text-xs font-medium">รีเฟรชข้อมูล</span>
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
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="p-4 border-b">ID</th>
                      <th className="p-4 border-b">ชื่อสารเคมี / CAS</th>
                      <th className="p-4 border-b">ปริมาณ</th>
                      <th className="p-4 border-b">ที่เก็บ</th>
                      <th className="p-4 border-b text-center">หมายเหตุ</th>
                      <th className="p-4 border-b text-center">GHS</th>
                      <th className="p-4 border-b text-center">สถานะ</th>
                      <th className="p-4 border-b text-right">จัดการ</th>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
            <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

              <form onSubmit={handleFormSubmit} className="flex flex-col h-full min-h-0">
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
                        placeholder="เช่น 500 g"
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
                        {[
                          { key: 'explosive', label: 'วัตถุระเบิด', icon: '💥' },
                          { key: 'flammable', label: 'สารไวไฟ', icon: '🔥' },
                          { key: 'oxidizing', label: 'สารออกซิไดส์', icon: '⭕' },
                          { key: 'gas', label: 'ก๊าซภายใต้ความดัน', icon: '💨' },
                          { key: 'corrosive', label: 'สารกัดกร่อน', icon: '🧪' },
                          { key: 'toxic', label: 'สารมีพิษ', icon: '☠️' },
                          { key: 'irritant', label: 'สารระคายเคือง', icon: '⚠️' },
                          { key: 'health', label: 'อันตรายต่อสุขภาพ', icon: '👤' },
                          { key: 'env', label: 'อันตรายต่อสิ่งแวดล้อม', icon: '🐟' },
                        ].map((ghs) => (
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
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${formData.ghs[ghs.key] ? 'bg-white/20' : 'bg-gray-100'}`}>
                              {formData.ghs[ghs.key] && <Check size={12} />}
                            </div>
                            <span className="truncate">{ghs.label}</span>
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
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 font-medium text-sm"
                  >
                    <Save size={18} />
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onSave={handleSaveConfig}
        />

      </div>
    </div>
  );
};

export default ChemicalInventoryApp;