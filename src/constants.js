import { Bomb, Flame, CircleDot, Wind, Beaker, Skull, AlertCircle, AlertTriangle, Fish } from 'lucide-react';

export const GHS_CONFIG = [
    { key: 'explosive', label: 'Explosive', icon: Bomb, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { key: 'flammable', label: 'Flammable', icon: Flame, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { key: 'oxidizing', label: 'Oxidizing', icon: CircleDot, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { key: 'gas', label: 'Compressed Gas', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { key: 'corrosive', label: 'Corrosive', icon: Beaker, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    { key: 'toxic', label: 'Toxic', icon: Skull, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { key: 'irritant', label: 'Irritant', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { key: 'health', label: 'Health Hazard', icon: AlertTriangle, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { key: 'env', label: 'Environmental Hazard', icon: Fish, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
];

export const STATUS_OPTIONS = [
    { value: 'Ready', label: 'พร้อมใช้งาน', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Not Ready', label: 'ไม่พร้อมใช้งาน', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'Expired', label: 'หมดอายุ', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'Dispose', label: 'ส่งกำจัด', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'Donate', label: 'บริจาค', color: 'bg-blue-100 text-blue-800 border-blue-200' },
];

export const EMPTY_FORM = {
    id: "",
    name: "",
    cas: "",
    hazard: "",
    remaining: "",
    location: "",
    importDate: "",
    expiry: "",
    expirationNote: "",
    status: "Ready",
    lastUpdated: null,
    ghs: { explosive: false, flammable: false, oxidizing: false, gas: false, corrosive: false, toxic: false, irritant: false, health: false, env: false }
};
