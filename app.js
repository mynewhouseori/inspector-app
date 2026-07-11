import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const baseChecks = {
  structureEnvelope: [
    { code: "1.1.1", name: "בדיקת סדקים", category: "שלד ומעטפת" },
    { code: "1.1.5", name: "איטומים", category: "שלד ומעטפת" },
    { code: "1.1.6", name: "איתור סימני חדירת מים", category: "שלד ומעטפת" }
  ],
  interiorFinishes: [
    { code: "2.1.1", name: "בדיקות ריצוף (שיפועים, חללים, הפרשי גובה)", category: "גמר פנים" },
    { code: "2.1.2", name: "צבע", category: "גמר פנים" },
    { code: "2.1.2R", name: "רשתות", category: "גמר פנים" },
    { code: "2.1.3", name: "טיח", category: "גמר פנים" },
    { code: "2.1.4", name: "גבס", category: "גמר פנים" },
    { code: "2.1.5", name: "מדרגות וגמרים", category: "גמר פנים" }
  ],
  wetRoomFinishes: [
    { code: "2.1.4W", name: "חיפוי", category: "גמר פנים" }
  ],
  openingsDoors: [
    { code: "3.1.1", name: "זיגוג", category: "פתחים ודלתות" },
    { code: "3.1.2", name: "דלתות", category: "פתחים ודלתות" },
    { code: "3.1.3", name: "אלומיניום", category: "פתחים ודלתות" },
    { code: "3.1.4", name: "איטומים", category: "פתחים ודלתות" }
  ],
  plumbingDrainage: [
    { code: "4.1.2", name: "נזילות", category: "אינסטלציה וניקוז" },
    { code: "4.1.3", name: "שיפועים", category: "אינסטלציה וניקוז" },
    { code: "4.1.4", name: "ניקוזים ותפקוד מערכות", category: "אינסטלציה וניקוז" }
  ],
  electricityCommunication: [
    { code: "5.1.1", name: "סורגים", category: "חשמל ותקשורת" },
    { code: "5.1.2", name: "ספק תקשורת", category: "חשמל ותקשורת" }
  ],
  dryRoomSystems: [
    { code: "5.1.5", name: "מזגן", category: "חשמל ותקשורת" }
  ],
  outdoorRoof: [
    { code: "6.1.1", name: "בדיקות איטום", category: "גג, מרפסות ופיתוח חוץ" },
    { code: "6.1.2", name: "שיפועים", category: "גג, מרפסות ופיתוח חוץ" },
    { code: "6.1.3", name: "ניקוזים", category: "גג, מרפסות ופיתוח חוץ" },
    { code: "6.1.4", name: "חצר", category: "גג, מרפסות ופיתוח חוץ" },
    { code: "6.1.5", name: "שבילים", category: "גג, מרפסות ופיתוח חוץ" },
    { code: "6.1.6", name: "גדרות ומעקות", category: "גג, מרפסות ופיתוח חוץ" }
  ],
  safetyRegulations: [
    { code: "7.1.2", name: "מעקות", category: "בטיחות ותקנות" }
  ]
};

const checkSets = {
  dry: [
    ...baseChecks.structureEnvelope.filter((check) => check.code !== "1.1.5"),
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
    ...baseChecks.openingsDoors.filter((check) => check.code !== "3.1.4"),
    ...baseChecks.electricityCommunication,
    ...baseChecks.dryRoomSystems,
    ...baseChecks.safetyRegulations.filter((check) => check.code !== "7.1.2")
  ],
  wet: [
    ...baseChecks.structureEnvelope,
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
    ...baseChecks.wetRoomFinishes,
    ...baseChecks.openingsDoors.filter((check) => check.code !== "3.1.4"),
    ...baseChecks.plumbingDrainage,
    ...baseChecks.electricityCommunication,
    ...baseChecks.safetyRegulations.filter((check) => check.code !== "7.1.2")
  ],
  outdoor: [
    ...baseChecks.structureEnvelope,
    ...baseChecks.outdoorRoof,
    ...baseChecks.openingsDoors.filter((check) => check.code !== "3.1.2"),
    ...baseChecks.safetyRegulations
  ]
};

const areaTypeLabels = {
  dry: "חדר יבש",
  wet: "חדר רטוב",
  outdoor: "אזור חוץ"
};

const defaultAreaPreset = [
  "חדר שינה 01",
  "חדר שינה 02",
  "חדר שינה 03",
  "חדר שינה 04",
  "רחצה הורים",
  "רחצה כללי",
  "מבואה 01",
  "מבואה 02",
  "מרפסת שרות",
  "סלון",
  "מטבח",
  "ש.אורחים",
  "ממד",
  "מרפסת",
  "חלל 05",
  "חלל 06",
  "מדרגות",
  "גג"
];

const ownerAreaPreset = [
  "חדר שינה 01",
  "חדר שינה 02",
  "חדר שינה 03",
  "רחצה הורים",
  "רחצה כללי",
  "מבואה 01",
  "מטבח",
  "סלון",
  "מרפסת שרות",
  "מרפסת",
  "ממד",
  "ש.אורחים"
];

const removedCheckCodes = new Set(["1.1.2", "1.1.3", "1.1.4", "3.1.5", "7.1.3"]);
const SETTINGS = window.APP_CONFIG || window.DEFAULT_APP_CONFIG || {};
const hasFirebaseConfig = Boolean(SETTINGS?.firebase?.apiKey);
const firebaseApp = hasFirebaseConfig ? initializeApp(SETTINGS.firebase) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const storage = firebaseApp ? getStorage(firebaseApp) : null;
const PROJECTS_COLLECTION = SETTINGS?.firestoreCollections?.projects || "inspector_projects";

let projectsUnsubscribe = null;
let cloudSyncTimer = null;
let lastLocalMutationAt = 0;
let lastCloudAppliedAt = 0;
let hasBootstrappedCloud = false;
let isApplyingCloudProject = false;
let isPickerOpen = false;
let pendingCloudSync = false;
let pendingFocusAreaId = null;

const inspectionModeLabels = {
  new: "בדיקת נכס חדש",
  owner: "תסקיר דירות בעלים"
};

const ownerApartmentLabels = [
  "כניסה-17 דירה-01",
  "כניסה-17 דירה-02",
  "כניסה-17 דירה-03",
  "כניסה-17 דירה-04",
  "כניסה-17 דירה-05",
  "כניסה-17 דירה-06",
  "כניסה-17 דירה-07",
  "כניסה-17 דירה-08",
  "כניסה-19 דירה-01",
  "כניסה-19 דירה-02",
  "כניסה-19 דירה-03",
  "כניסה-19 דירה-04",
  "כניסה-19 דירה-05",
  "כניסה-19 דירה-06",
  "כניסה-19 דירה-07",
  "כניסה-19 דירה-08"
];

const MAX_CHECK_PHOTOS = 3;
const APP_VERSION = "2026.07.11.173";
const pendingPhotoUploads = new Map();
const PHOTO_UPLOAD_MAX_DIMENSION = 1600;
const PHOTO_UPLOAD_QUALITY = 0.72;
const DEFAULT_PROPERTY_ADDRESS = "מגן אברהם-יפו";

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeInspectionDate(value) {
  const normalized = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : getTodayInputValue();
}

function normalizePropertyAddress(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return DEFAULT_PROPERTY_ADDRESS;
  if (
    normalized === "מגן אברהם"
    || normalized === "מגן אברהם -יפו"
    || normalized === "מגן אברהם- יפו"
    || normalized === "מגן אברהם - יפו"
  ) {
    return DEFAULT_PROPERTY_ADDRESS;
  }
  return normalized;
}

function getOwnerApartmentProjectId(apartmentName) {
  const apartmentIndex = ownerApartmentLabels.indexOf(apartmentName);
  const suffix = apartmentIndex >= 0 ? String(apartmentIndex + 1).padStart(2, "0") : "00";
  return `owner-apartment-${suffix}`;
}

function isOwnerApartmentName(value) {
  return ownerApartmentLabels.includes(String(value || "").trim());
}

const AREA_ICON_MARKUP = {
  dry: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5h16v1.5H4zM6 11.5h4.5c1.9 0 2.9.8 3.3 2H18V8.8c0-.9-.7-1.6-1.6-1.6H7.6C6.7 7.2 6 7.9 6 8.8v2.7Zm12 3.5h-3.8c-.4 1.1-1.4 1.8-3 1.8H6v-1.8H4v-1.5h14v3.3Z"></path></svg>`,
  wet: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c2.4 3 4.8 5.8 4.8 8.9A4.8 4.8 0 1 1 7.2 12.4c0-3.1 2.4-5.9 4.8-8.9Zm0 14.2c1.5 0 2.8-1 3.2-2.4-.8.6-1.7.9-2.7.9-1.5 0-2.9-.7-3.8-1.9.2 1.9 1.7 3.4 3.3 3.4Z"></path></svg>`,
  outdoor: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5h14v1.5H5zm7-15 1.1 3.1 3.3.3-2.5 2.1.8 3.2L12 10.8l-2.7 1.4.8-3.2-2.5-2.1 3.3-.3L12 3.5Zm-5.7 10h11.4l1.3 3H5l1.3-3Z"></path></svg>`
};

const STATUS_ICON_MARKUP = {
  areas: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7v6H4zm9 0h7v6h-7zM4 13h7v6H4zm9 0h7v6h-7z"></path></svg>`,
  checks: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 16.6 5.8 13.2l1.4-1.4 2 2 7.6-7.6 1.4 1.4-9 9Z"></path></svg>`,
  ok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 21 7v5.4c0 4.2-2.7 8-9 8.8-6.3-.8-9-4.6-9-8.8V7l9-4.2Zm-1.2 12.8 5.6-5.6-1.4-1.4-4.2 4.2-1.8-1.8-1.4 1.4 3.2 3.2Z"></path></svg>`,
  issues: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Zm1 12h-2v2h2v-2Zm0-6h-2v4h2V9Z"></path></svg>`,
  pending: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm1 4h-2v5l4 2 .8-1.8-2.8-1.4V8Z"></path></svg>`,
  high: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8.5 15H3.5L12 2Zm1 11h-2v2h2v-2Zm0-6h-2v4h2V7Z"></path></svg>`,
  saved: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h10l4 4v12H6V4Zm2 2v4h8V6H8Zm0 8v4h8v-4H8Z"></path></svg>`,
  summary: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14v1.5H5zm1-3h3v3H6zm5-5h3v8h-3zm5-4h3v12h-3z"></path></svg>`
};

function getAreaIconMarkup(area) {
  if (area.name.includes("חדר שינה")) return AREA_ICON_MARKUP.dry;
  if (area.name.includes("רחצה") || area.name.includes("ש.אורחים")) return AREA_ICON_MARKUP.wet;
  if (area.name.includes("מרפסת") || area.name.includes("גג")) return AREA_ICON_MARKUP.outdoor;
  return AREA_ICON_MARKUP[area.type] || AREA_ICON_MARKUP.dry;
}

const CHECK_VISUALS_BY_CODE = {
  "1.1.1": {
    tone: "tone-structure",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="chk-crack" x1="0" x2="1"><stop offset="0" stop-color="#ffd3cb"/><stop offset="1" stop-color="#ff7064"/></linearGradient></defs><path d="M34 8 22 24l8 2-10 13 7 3-8 13" fill="none" stroke="url(#chk-crack)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M31 10 24 22l8 2-9 12 7 3-6 11" fill="none" stroke="#8e2f2a" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 16h10M44 19h11M15 36h8M44 41h10M18 56h12" fill="none" stroke="#f6b7ae" stroke-width="3.2" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 8 9l4 1-4 11 8-11-4-1 2-6Z" fill="currentColor"></path></svg>`
  },
  "1.1.5": {
    tone: "tone-structure",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 20h36l-4 28H22Z" fill="#ffe3db" stroke="#cf6b57" stroke-width="3" stroke-linejoin="round"></path><path d="M26 16h20l8 8H18Z" fill="#ffb9aa" stroke="#cf6b57" stroke-width="3" stroke-linejoin="round"></path><path d="M36 27c6 7 10 12 10 18a10 10 0 1 1-20 0c0-6 4-11 10-18Z" fill="#6fd2ff" stroke="#1781b0" stroke-width="2.8"></path><path d="M33 36c-1.8 1.8-3.1 4.1-3.4 6.5" fill="none" stroke="#e8fbff" stroke-width="2.4" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10h14l-2 9H7zM8 7h8l3 3H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 11c2 2.3 3.5 4 3.5 5.8a3.5 3.5 0 1 1-7 0C8.5 15 10 13.3 12 11Z" fill="currentColor"></path></svg>`
  },
  "1.1.6": {
    tone: "tone-structure",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M24 14h24l6 7v29a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V22Z" fill="#fff4eb" stroke="#c97d5b" stroke-width="3"></path><path d="M48 14v11h11" fill="#ffd7c3" stroke="#c97d5b" stroke-width="3" stroke-linejoin="round"></path><path d="M29 36c3-5 10-7 15-4 4 2 7 6 7 11" fill="none" stroke="#63b8e6" stroke-width="4" stroke-linecap="round"></path><path d="M30 47c2 3 5 5 9 5 5 0 9-3 11-7" fill="none" stroke="#3b8db8" stroke-width="3.2" stroke-linecap="round"></path><circle cx="28" cy="50" r="7" fill="#fff" stroke="#567891" stroke-width="3"></circle><path d="m33 55 7 7" fill="none" stroke="#567891" stroke-width="3.4" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m14 14 6 6M8 11c1-2 3-3 5-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "2.1.1": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M15 24h42v26H15z" fill="#fff7ea" stroke="#ca8521" stroke-width="3" rx="4"></path><path d="M29 24v26M43 24v26M15 37h42" fill="none" stroke="#e1a54b" stroke-width="2.6"></path><path d="m19 16 11-7 11 7" fill="none" stroke="#ff9f1c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="m41 14 12 0-6 8" fill="none" stroke="#7d6b52" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v10H4zM10 9v10M16 9v10M4 14h16" fill="none" stroke="currentColor" stroke-width="2"></path><path d="m6 6 4-2 4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "2.1.2": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 18h22a8 8 0 0 1 8 8v8H18z" fill="#ff9a7c" stroke="#c7634d" stroke-width="3"></path><path d="M48 28h6a7 7 0 0 1 7 7v4H48z" fill="#ffd0c2" stroke="#c7634d" stroke-width="3"></path><path d="M34 42h8v14h-8z" fill="#d8c3a6" stroke="#8f6e42" stroke-width="2.6"></path><path d="M24 56h28" fill="none" stroke="#8f6e42" stroke-width="3.2" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h9a3 3 0 0 1 3 3v3H4zM16 11h4a2 2 0 0 1 2 2v1h-6zM11 14v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`
  },
  "2.1.2R": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><rect x="17" y="14" width="38" height="44" rx="6" fill="#f6fbff" stroke="#6c9fc7" stroke-width="3"></rect><path d="M24 20v32M33 20v32M42 20v32M18 28h36M18 38h36M18 48h36" fill="none" stroke="#9fd0f0" stroke-width="2.6"></path><path d="m20 20 32 32M52 20 20 52" fill="none" stroke="#4f7997" stroke-width="2.3" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM10 5v14M14 5v14M5 10h14M5 14h14" fill="none" stroke="currentColor" stroke-width="2"></path></svg>`
  },
  "2.1.3": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="m17 44 20-20 18 18-20 20H17z" fill="#ffe4bf" stroke="#c9842f" stroke-width="3" stroke-linejoin="round"></path><path d="m38 23 7-7 13 13-7 7" fill="#d59f63" stroke="#8d5d28" stroke-width="3" stroke-linejoin="round"></path><path d="M25 52h14" fill="none" stroke="#fff2dd" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16 8-8 8 8-8 4zM12 8l4-4 4 4-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`
  },
  "2.1.4": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><rect x="15" y="14" width="42" height="44" rx="5" fill="#f7f3ff" stroke="#8a74b8" stroke-width="3"></rect><path d="M25 22h22M25 30h22M25 38h22M25 46h14" fill="none" stroke="#bcaee0" stroke-width="3" stroke-linecap="round"></path><path d="M15 22h8M15 38h8M49 30h8M49 46h8" fill="none" stroke="#6f5a97" stroke-width="3" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M9 8h6M9 12h6M9 16h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "2.1.4W": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><rect x="14" y="15" width="44" height="42" rx="6" fill="#f7fffd" stroke="#2f9e87" stroke-width="3"></rect><path d="M14 29h44M29 15v42M43 15v42" fill="none" stroke="#7fd9c7" stroke-width="2.8"></path><path d="M20 23h8M34 37h8M46 23h6M22 45h10" fill="none" stroke="#2f9e87" stroke-width="3" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2"></path><circle cx="8" cy="8" r="1.3" fill="currentColor"></circle></svg>`
  },
  "2.1.5": {
    tone: "tone-finishes",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M16 51h12V39h10V27h10V15h8v36H16z" fill="#ffd68c" stroke="#a66a1e" stroke-width="3" stroke-linejoin="round"></path><path d="M28 39h10M38 27h10M48 15h8" fill="none" stroke="#fff0cf" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h4v-4h4v-4h4V6h4v12H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`
  },
  "3.1.1": {
    tone: "tone-openings",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="chk-glass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#dff6ff"/><stop offset="1" stop-color="#b7dcff"/></linearGradient></defs><path d="M14 13h44v46H14z" fill="#eef7ff" stroke="#375a76" stroke-width="3"></path><path d="M19 18h16v36H19zM37 18h16v36H37z" fill="url(#chk-glass)" stroke="#5a80a0" stroke-width="2.5"></path><path d="M36 13v46" fill="none" stroke="#32526d" stroke-width="3"></path><path d="M24 24c3 2 4 5 5 8M44 21c-2 2-4 6-5 10" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></path><path d="M18 54h36" fill="none" stroke="#6a8dab" stroke-width="2.5" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM12 4v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`
  },
  "3.1.2": {
    tone: "tone-openings",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M22 12h26v48H22z" fill="#c78a54" stroke="#7a4d25" stroke-width="3"></path><path d="M27 18h16v36H27z" fill="#edc79e"></path><circle cx="39" cy="36" r="2.7" fill="#7a4d25"></circle></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16H7z" fill="none" stroke="currentColor" stroke-width="2"></path><circle cx="14" cy="12" r="1.2" fill="currentColor"></circle></svg>`
  },
  "3.1.3": {
    tone: "tone-openings",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 15h12v42H18zM42 15h12v42H42z" fill="#d9e2ea" stroke="#60758a" stroke-width="3"></path><path d="M30 21h12v8H30zM30 35h12v22H30z" fill="#aebdca" stroke="#60758a" stroke-width="3"></path><path d="M24 21h24M24 51h24" fill="none" stroke="#f5fbff" stroke-width="2.4" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h4v14H5zM15 5h4v14h-4zM9 9h6v6H9z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>`
  },
  "3.1.4": {
    tone: "tone-openings",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 21h36v30H18z" fill="#fffaf3" stroke="#caa45b" stroke-width="3" rx="7"></path><path d="M24 28h24v16H24z" fill="#ffd698" stroke="#caa45b" stroke-width="2.6" rx="4"></path><path d="M28 36h16" fill="none" stroke="#fff3d8" stroke-width="2.4" stroke-linecap="round"></path><path d="M14 18c8 0 8 6 16 6s8-6 16-6 8 6 16 6" fill="none" stroke="#de7f44" stroke-width="3" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="8" width="14" height="8" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M3 7c3 0 3 2 6 2s3-2 6-2 3 2 6 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "4.1.2": {
    tone: "tone-plumbing",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M19 17h24v8H29v9h13a11 11 0 0 1 0 22H26" fill="none" stroke="#1576a6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M26 41c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12Z" fill="#67d8ff" stroke="#1576a6" stroke-width="3"></path><circle cx="48" cy="45" r="6" fill="#e7fbff" stroke="#4bb8de" stroke-width="3"></circle></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h9v4h-5v4h5a4 4 0 1 1 0 8H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 13c2 2 3 3.5 3 5a3 3 0 1 1-6 0c0-1.5 1-3 3-5Z" fill="currentColor"></path></svg>`
  },
  "4.1.3": {
    tone: "tone-plumbing",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M16 47h40" fill="none" stroke="#88c8e9" stroke-width="3"></path><path d="m19 25 16 16 18-18" fill="none" stroke="#1276a8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="m48 23 5 0-1 5" fill="none" stroke="#1276a8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 8 7 7 7-7M18 8h-4m4 0v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
  },
  "4.1.4": {
    tone: "tone-plumbing",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="18" fill="#effcff" stroke="#1683b6" stroke-width="3"></circle><circle cx="36" cy="36" r="9" fill="#c5f1ff" stroke="#1683b6" stroke-width="2.8"></circle><path d="M26 36h20M36 26v20M29 29l14 14M43 29 29 43" fill="none" stroke="#6ac7ea" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" stroke-width="2"></path></svg>`
  },
  "5.1.1": {
    tone: "tone-electric",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><rect x="18" y="16" width="36" height="40" rx="5" fill="#f7fff0" stroke="#66942a" stroke-width="3"></rect><path d="M26 18v36M36 18v36M46 18v36" fill="none" stroke="#96c84a" stroke-width="4" stroke-linecap="round"></path><path d="M18 26h36M18 46h36" fill="none" stroke="#dff2bd" stroke-width="2.4"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M9 4v16M15 4v16" fill="none" stroke="currentColor" stroke-width="2"></path></svg>`
  },
  "5.1.2": {
    tone: "tone-electric",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M22 18h28a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H22z" fill="#eefbe8" stroke="#4d8a2d" stroke-width="3"></path><path d="M30 46v-8l-7-7M42 46v-8l7-7" fill="none" stroke="#76b53c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M36 14v12" fill="none" stroke="#4d8a2d" stroke-width="4" stroke-linecap="round"></path><circle cx="36" cy="30" r="5" fill="#a9db5e" stroke="#4d8a2d" stroke-width="2.5"></circle></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="2" fill="currentColor"></circle><path d="M12 4v3M8 13l-3 3M16 13l3 3M9 19h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "5.1.5": {
    tone: "tone-electric",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><rect x="16" y="20" width="40" height="16" rx="8" fill="#f4fff2" stroke="#4f8b30" stroke-width="3"></rect><circle cx="36" cy="46" r="10" fill="#dff7ca" stroke="#4f8b30" stroke-width="3"></circle><path d="M36 36v20M26 46h20M29 39c4 0 5 3 7 7M43 39c-4 0-5 3-7 7" fill="none" stroke="#78b94d" stroke-width="2.8" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "6.1.1": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="m14 34 22-18 22 18" fill="none" stroke="#9a6039" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 32h30l-4 19H25z" fill="#ffd9bf" stroke="#bf7a4b" stroke-width="3" stroke-linejoin="round"></path><path d="M31 28c6 7 10 11 10 16a10 10 0 1 1-20 0c0-5 4-9 10-16Z" fill="#7bdcff" stroke="#1380b3" stroke-width="2.8"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 8-6 8 6M7 10v8h10v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 11c2 2 3 3.2 3 4.8a3 3 0 1 1-6 0c0-1.6 1-2.8 3-4.8Z" fill="currentColor"></path></svg>`
  },
  "6.1.2": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M16 50h40" fill="none" stroke="#d8af8c" stroke-width="3"></path><path d="m18 26 16 16 20-20" fill="none" stroke="#a46536" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="m46 22 10 0-2 10" fill="none" stroke="#a46536" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 8 7 7 7-7M19 8h-5m5 0v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
  },
  "6.1.3": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 20h36v10H18z" fill="#ffe7ce" stroke="#ab6a3c" stroke-width="3"></path><path d="M36 30v20" fill="none" stroke="#ab6a3c" stroke-width="4" stroke-linecap="round"></path><circle cx="36" cy="55" r="6" fill="#a6e7ff" stroke="#1a86b7" stroke-width="3"></circle><path d="M28 38h16" fill="none" stroke="#6ebfe2" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14v4H5zM12 10v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="12" cy="20" r="1.5" fill="currentColor"></circle></svg>`
  },
  "6.1.4": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M36 16c7 0 12 5 12 12 0 6-4 11-9 13v13H33V41c-5-2-9-7-9-13 0-7 5-12 12-12Z" fill="#9fd86d" stroke="#5f8f32" stroke-width="3"></path><path d="M36 54V29" fill="none" stroke="#5f8f32" stroke-width="4" stroke-linecap="round"></path><path d="M19 54h34" fill="none" stroke="#c48a52" stroke-width="4" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c3.5 0 6 2.5 6 6 0 3-2 5.5-5 6.3V20h-2v-3.7C8 15.5 6 13 6 10c0-3.5 2.5-6 6-6Z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>`
  },
  "6.1.5": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 48c8-17 15-24 32-24" fill="none" stroke="#d29663" stroke-width="10" stroke-linecap="round"></path><path d="M18 48c8-17 15-24 32-24" fill="none" stroke="#f5d4b4" stroke-width="5" stroke-linecap="round"></path><path d="M24 32h6M33 27h6M42 24h6" fill="none" stroke="#a46b41" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18c4-7 7-10 14-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M8 14h2M12 11h2M16 9h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "6.1.6": {
    tone: "tone-outdoor",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 54V24M28 54V18M38 54V24M48 54V18M58 54V24" fill="none" stroke="#8b5d39" stroke-width="4" stroke-linecap="round"></path><path d="M16 29h44M16 45h44" fill="none" stroke="#c78d59" stroke-width="4" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20V6M12 20V4M18 20V6M4 10h16M4 16h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  "7.1.2": {
    tone: "tone-safety",
    icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 54V22M30 54V16M42 54V22M54 54V16" fill="none" stroke="#b86f4a" stroke-width="4" stroke-linecap="round"></path><path d="M16 28h40M16 44h40" fill="none" stroke="#ffd7c5" stroke-width="4" stroke-linecap="round"></path><path d="M14 56h44" fill="none" stroke="#8d4d2d" stroke-width="4.5" stroke-linecap="round"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V8M12 20V5M19 20V8M4 11h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  }
};

function getCheckVisual(check) {
  const category = check.category || "";
  const code = check.code || "";
  const codeVisual = CHECK_VISUALS_BY_CODE[code];
  if (codeVisual) {
    return codeVisual;
  }
  if (category.includes("שלד")) {
    return {
      tone: "tone-structure",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="crackGlow" x1="0" x2="1"><stop offset="0" stop-color="#ff9f90"/><stop offset="1" stop-color="#ff6b59"/></linearGradient></defs><path d="M34 8 22 24l8 2-10 13 7 3-8 13" fill="none" stroke="url(#crackGlow)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M31 10 24 22l8 2-9 12 7 3-6 11" fill="none" stroke="#8e2f2a" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 16h10M44 19h11M15 36h8M44 41h10M18 56h12" fill="none" stroke="#f6b7ae" stroke-width="3.2" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 8 10h4l-3 11 7-10h-4l1-8Z" fill="currentColor"></path></svg>`
    };
  }
  if (category.includes("גמר")) {
    return {
      tone: "tone-finishes",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="m18 20 17-9 18 10-17 9z" fill="#ffd48d" stroke="#9b5b13" stroke-width="2.8" stroke-linejoin="round"></path><path d="M18 20v21l17 10V30z" fill="#ffc15a" stroke="#9b5b13" stroke-width="2.8" stroke-linejoin="round"></path><path d="M53 21v20L35 51V30z" fill="#ffdeab" stroke="#9b5b13" stroke-width="2.8" stroke-linejoin="round"></path><path d="m23 31 12 7 13-7" fill="none" stroke="#8f5a23" stroke-opacity="0.45" stroke-width="2.4" stroke-linecap="round"></path><path d="M35 11v19" fill="none" stroke="#fff1cf" stroke-width="2" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h12a2 2 0 0 1 2 2v2h2v2h-2v4h-3V9H4zM6 17h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
    };
  }
  if (category.includes("פתחים")) {
    return {
      tone: "tone-openings",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="glassFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#dff6ff"/><stop offset="1" stop-color="#b7dcff"/></linearGradient></defs><path d="M14 13h44v46H14z" fill="#eef7ff" stroke="#375a76" stroke-width="3"></path><path d="M19 18h16v36H19zM37 18h16v36H37z" fill="url(#glassFill)" stroke="#5a80a0" stroke-width="2.5"></path><path d="M36 13v46" fill="none" stroke="#32526d" stroke-width="3"></path><path d="M24 24c3 2 4 5 5 8M44 21c-2 2-4 6-5 10" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></path><path d="M18 54h36" fill="none" stroke="#6a8dab" stroke-width="2.5" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM12 4v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`
    };
  }
  if (category.includes("אינסטלציה")) {
    return {
      tone: "tone-plumbing",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="dropFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#78e7ff"/><stop offset="1" stop-color="#00a9d8"/></linearGradient></defs><path d="M36 10c8 10 14 17 14 26a14 14 0 0 1-28 0c0-9 6-16 14-26Z" fill="url(#dropFill)" stroke="#0c78b1" stroke-width="3"></path><path d="M32 24c-2 2-4 5-5 8" fill="none" stroke="#e9ffff" stroke-width="3" stroke-linecap="round"></path><path d="M15 52c5-2 10-2 15 .2 4 2 8 2 12 0 5-2.2 10-2.2 15-.2" fill="none" stroke="#0c5f98" stroke-width="3" stroke-linecap="round"></path><path d="M18 59c4-1.7 8-1.7 12 0 4 1.7 8 1.7 12 0 4-1.7 8-1.7 12 0" fill="none" stroke="#37a9d8" stroke-width="2.5" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11Z" fill="currentColor"></path></svg>`
    };
  }
  if (category.includes("חשמל")) {
    return {
      tone: "tone-electric",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M23 18h8v14h9V18h8v15a4 4 0 0 1-4 4h-5v6h4a10 10 0 1 1 0 4h-16V37h-4a4 4 0 0 1-4-4z" fill="#7fb82a"></path><path d="M29 22v14M43 22v14" fill="none" stroke="#edf9c5" stroke-width="3" stroke-linecap="round"></path><circle cx="52" cy="49" r="6" fill="#9bd03f" stroke="#5c8620" stroke-width="2.6"></circle></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v6m10-6v6M8 7h8v6H8zm4 6v6M8 19h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
    };
  }
  if (category.includes("בטיחות")) {
    return {
      tone: "tone-safety",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M36 10 53 16v13c0 12-7 22-17 27-10-5-17-15-17-27V16z" fill="#ffcfbf" stroke="#bd6545" stroke-width="3"></path><path d="M36 18v17" fill="none" stroke="#914227" stroke-width="4" stroke-linecap="round"></path><circle cx="36" cy="44" r="3.8" fill="#914227"></circle><path d="M28 12h16" fill="none" stroke="#fff0e7" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 8v5m0 3h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
    };
  }
  if (category.includes("גג") || code.startsWith("6.")) {
    return {
      tone: "tone-outdoor",
      icon: `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="m15 33 21-17 21 17v18H42v-11H30v11H15z" fill="#e6b38a" stroke="#9a6039" stroke-width="3" stroke-linejoin="round"></path><path d="M24 30h24" fill="none" stroke="#fff2e7" stroke-width="2.2" stroke-linecap="round"></path><path d="M21 52h30" fill="none" stroke="#b2774d" stroke-width="2.6" stroke-linecap="round"></path></svg>`,
      badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 8-6 8 6M7 10v8h10v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
    };
  }
  return {
    tone: "tone-neutral",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14v2H5zm0 5h14v2H5zm0 5h9v2H5z"></path></svg>`,
    badgeIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12M6 12h12M6 18h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`
  };
}

function getSummaryStatVisual(key) {
  return STATUS_ICON_MARKUP[key] || STATUS_ICON_MARKUP.summary;
}

function getCanonicalProjectId(projectLike = {}) {
  const inspectionMode = projectLike?.data?.inspectionMode || projectLike?.inspectionMode || "";
  const propertyName = String(projectLike?.data?.propertyName || projectLike?.propertyName || "").trim();
  if (inspectionMode === "owner" && isOwnerApartmentName(propertyName)) {
    return getOwnerApartmentProjectId(propertyName);
  }
  return projectLike?.id || null;
}

function dedupeProjectRecords(projects = []) {
  const sortedProjects = [...projects].sort((a, b) => (b?.updatedAtMs || 0) - (a?.updatedAtMs || 0));
  const seenProjectIds = new Set();
  const dedupedProjects = [];
  const duplicateProjects = [];

  sortedProjects.forEach((project) => {
    const canonicalId = getCanonicalProjectId(project);
    const dedupeKey = canonicalId || project?.id;
    if (!dedupeKey) return;

    if (seenProjectIds.has(dedupeKey)) {
      duplicateProjects.push(project);
      return;
    }

    seenProjectIds.add(dedupeKey);
    const normalizedProject = normalizeProjectRecord({ ...project, id: canonicalId || project.id });
    if (!normalizedProject) return;
    dedupedProjects.push(normalizedProject);
  });

  return { dedupedProjects, duplicateProjects };
}

const state = {
  currentScreen: "home",
  inspectionMode: "new",
  propertyName: "",
  propertyAddress: DEFAULT_PROPERTY_ADDRESS,
  inspectionDate: getTodayInputValue(),
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  inspectorName: "",
  currentProjectId: null,
  activeInspectionAreaId: null,
  areas: [],
  savedProjects: []
};

const storageKey = "inspector-mobile-state-v2";
const projectsKey = "inspector-mobile-projects-v1";

const els = {
  welcomeTitle: document.querySelector("#welcomeTitle"),
  selectNewPropertyBtn: document.querySelector("#selectNewPropertyBtn"),
  selectOwnerReportBtn: document.querySelector("#selectOwnerReportBtn"),
  backToHomeFromOwnerBtn: document.querySelector("#backToHomeFromOwnerBtn"),
  ownerApartmentsGrid: document.querySelector("#ownerApartmentsGrid"),
  propertyAddressField: document.querySelector("#propertyAddressField"),
  clientNameLabel: document.querySelector("#clientNameLabel"),
  inspectorNameField: document.querySelector("#inspectorNameField"),
  welcomeNavBtn: document.querySelector("#welcomeNavBtn"),
  propertyName: document.querySelector("#propertyName"),
  propertyAddress: document.querySelector("#propertyAddress"),
  inspectionDate: document.querySelector("#inspectionDate"),
  inspectionDateBadge: document.querySelector("#inspectionDateBadge"),
  clientName: document.querySelector("#clientName"),
  clientPhone: document.querySelector("#clientPhone"),
  clientEmail: document.querySelector("#clientEmail"),
  inspectorName: document.querySelector("#inspectorName"),
  cloudStatus: document.querySelector("#cloudStatus"),
  saveProjectBtn: document.querySelector("#saveProjectBtn"),
  jumpToSavedProjectsBtn: document.querySelector("#jumpToSavedProjectsBtn"),
  newProjectBtn: document.querySelector("#newProjectBtn"),
  backToWelcomeBtn: document.querySelector("#backToWelcomeBtn"),
  areaName: document.querySelector("#areaName"),
  areaType: document.querySelector("#areaType"),
  addAreaBtn: document.querySelector("#addAreaBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  printBtn: document.querySelector("#printBtn"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  screens: [...document.querySelectorAll(".screen")],
  roomsSelection: document.querySelector("#roomsSelection"),
  roomChipTemplate: document.querySelector("#roomChipTemplate"),
  selectedRoomsCount: document.querySelector("#selectedRoomsCount"),
  roomsPropertyName: document.querySelector("#roomsPropertyName"),
  savedProjectsList: document.querySelector("#savedProjectsList"),
  areasContainer: document.querySelector("#areasContainer"),
  areaTemplate: document.querySelector("#areaTemplate"),
  checkTemplate: document.querySelector("#checkTemplate"),
  summaryStats: document.querySelector("#summaryStats"),
  issueSummary: document.querySelector("#issueSummary"),
  reportAreasSummary: document.querySelector("#reportAreasSummary"),
  reportDocument: document.querySelector("#reportDocument"),
  reportDocTitle: document.querySelector("#reportDocTitle"),
  reportDocSubtitle: document.querySelector("#reportDocSubtitle"),
  reportCoverBadge: document.querySelector("#reportCoverBadge"),
  reportCoverMeta: document.querySelector("#reportCoverMeta"),
  printPages: document.querySelector("#printPages"),
  reportPageHeaderTitle: document.querySelector("#reportPageHeaderTitle"),
  reportPageHeaderInspector: document.querySelector("#reportPageHeaderInspector"),
  reportPageHeaderStatus: document.querySelector("#reportPageHeaderStatus"),
  reportPageHeaderDate: document.querySelector("#reportPageHeaderDate"),
  reportIntroTitle: document.querySelector("#reportIntroTitle"),
  reportIntroBlock: document.querySelector("#reportIntroBlock"),
  reportOverview: document.querySelector("#reportOverview"),
  reportExecutiveSummary: document.querySelector("#reportExecutiveSummary"),
  reportSummaryStats: document.querySelector("#reportSummaryStats"),
  reportCriticalFindings: document.querySelector("#reportCriticalFindings"),
  reportAreaDetails: document.querySelector("#reportAreaDetails"),
  reportClosingNote: document.querySelector("#reportClosingNote"),
  reportTitle: document.querySelector("#reportTitle"),
  reportMeta: document.querySelector("#reportMeta"),
  reportInlineDate: document.querySelector("#reportInlineDate")
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function uniqueChecks(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

function createDimensions() {
  return { planWidth: "", planLength: "", actualWidth: "", actualLength: "" };
}

function inferAreaType(name) {
  if (name.includes("רחצה") || name.includes("מטבח") || name.includes("ש.אורחים") || name.includes("שרות")) return "wet";
  if (name.includes("מרפסת") || name.includes("גג")) return "outdoor";
  return "dry";
}

function defaultChecks(type, areaName = "") {
  let checks = checkSets[type] || [];
  if (areaName.includes("מדרגות")) {
    checks = uniqueChecks([
      ...checks,
      baseChecks.interiorFinishes.find((check) => check.code === "2.1.5"),
      baseChecks.safetyRegulations.find((check) => check.code === "7.1.2"),
      baseChecks.safetyRegulations.find((check) => check.code === "7.1.4")
    ]);
  }
  if (areaName.includes("גג")) {
    checks = uniqueChecks([...checks, ...baseChecks.outdoorRoof, baseChecks.safetyRegulations.find((check) => check.code === "7.1.2")]);
  }
  if (areaName.includes("מרפסת")) {
    checks = uniqueChecks([...checks, ...baseChecks.outdoorRoof, ...baseChecks.plumbingDrainage.filter((check) => ["4.1.3", "4.1.4"].includes(check.code))]);
  }
  if (areaName.includes("מטבח")) {
    checks = uniqueChecks([...checks, ...baseChecks.plumbingDrainage]);
  }
  return checks.map((check) => ({ id: uid(), ...check, status: "pending", severity: "medium", note: "" }));
}

function sanitizeChecks(checks) {
  return (Array.isArray(checks) ? checks : [])
    .filter((check) => !removedCheckCodes.has(check.code))
    .map((check) => (check.code === "3.1.1" ? { ...check, name: "זיגוג" } : check));
}

function mergeChecksWithDefaults(existingChecks, expectedChecks) {
  const existingByCode = new Map(
    sanitizeChecks(existingChecks).map((check) => [check.code, check])
  );

  return expectedChecks.map((check) => {
    const existing = existingByCode.get(check.code);
    return existing
      ? {
          ...check,
          ...existing,
          id: existing.id || check.id
        }
      : check;
  });
}

function hydrateArea(area) {
  const expectedChecks = defaultChecks(area.type, area.name);
  const areaChecks = Array.isArray(area.checks) ? area.checks : expectedChecks;

  return {
    ...area,
    selected: area.selected !== false,
    locked: area.locked === true,
    checks: mergeChecksWithDefaults(areaChecks, expectedChecks),
    dimensions: area.dimensions || createDimensions(),
    photoCaptures: Array.isArray(area.photoCaptures)
      ? area.photoCaptures.map((photo) => ({
          ...photo,
          previewDataUrl: photo.previewDataUrl || ""
        }))
      : []
  };
}

function normalizeAreasForMode(areas = [], mode = state.inspectionMode) {
  if (mode !== "owner") {
    return Array.isArray(areas) ? areas.map((area) => hydrateArea(area)) : buildPresetAreas(mode);
  }

  const existingByName = new Map(
    (Array.isArray(areas) ? areas : []).map((area) => [area.name, hydrateArea(area)])
  );

  return ownerAreaPreset.map((name) => existingByName.get(name) || createArea(name, inferAreaType(name), true));
}

function applyProjectData(projectData) {
  state.inspectionMode = projectData.inspectionMode || state.inspectionMode || "new";
  state.propertyName = projectData.propertyName || "";
  state.propertyAddress = normalizePropertyAddress(projectData.propertyAddress);
  state.inspectionDate = normalizeInspectionDate(projectData.inspectionDate);
  state.clientName = projectData.clientName || "";
  state.clientPhone = projectData.clientPhone || "";
  state.clientEmail = projectData.clientEmail || "";
  state.inspectorName = projectData.inspectorName || "";
  state.activeInspectionAreaId = projectData.activeInspectionAreaId || null;
  state.areas = Array.isArray(projectData.areas)
    ? normalizeAreasForMode(projectData.areas, state.inspectionMode)
    : buildPresetAreas(state.inspectionMode);
  if (!state.areas.length) state.areas = buildPresetAreas();
  els.propertyName.value = state.propertyName;
  els.propertyAddress.value = state.propertyAddress;
  els.inspectionDate.value = state.inspectionDate;
  els.clientName.value = state.clientName;
  els.clientPhone.value = state.clientPhone;
  els.clientEmail.value = state.clientEmail;
  els.inspectorName.value = state.inspectorName;
  updateInspectionDateBadge();
}

function updateAppVersionLabel() {
  const topVersion = document.querySelector(".top-version");
  if (topVersion) {
    topVersion.textContent = `גרסה ${APP_VERSION}`;
  }
}

function ensureReportPlaceholders() {
  els.reportOverview = document.querySelector("#reportOverview");
  els.reportSummaryStats = document.querySelector("#reportSummaryStats");
}

function updateWelcomeTitle() {
  if (!els.welcomeTitle) return;
  els.welcomeTitle.textContent = inspectionModeLabels[state.inspectionMode] || inspectionModeLabels.new;
}

function updateWelcomeFormMode() {
  const isOwnerMode = state.inspectionMode === "owner";
  if (els.propertyAddressField) {
    els.propertyAddressField.hidden = isOwnerMode;
  }
  if (els.clientNameLabel) {
    els.clientNameLabel.textContent = isOwnerMode ? "שם הדייר" : "שם הלקוח";
  }
  if (els.clientName) {
    els.clientName.placeholder = isOwnerMode ? "הזן שם דייר" : "הזן שם לקוח";
  }
  if (els.welcomeNavBtn) {
    els.welcomeNavBtn.hidden = isOwnerMode;
  }
  if (els.newProjectBtn) {
    els.newProjectBtn.hidden = isOwnerMode;
  }
}

function updateCloudStatus(message, tone = "") {
  if (!els.cloudStatus) return;
  const compactMessage = tone === "ok"
    ? "הענן מחובר"
    : tone === "warn"
      ? "הענן בתהליך"
      : tone === "error"
        ? "שגיאת סנכרון"
        : "סנכרון ענן";
  els.cloudStatus.textContent = compactMessage;
  els.cloudStatus.classList.remove("status-ok", "status-warn", "status-error");
  if (tone) els.cloudStatus.classList.add(`status-${tone}`);
}

function getAreaPhotoCount(area) {
  return Array.isArray(area.photoCaptures) ? area.photoCaptures.length : 0;
}

function getCheckPhotoCount(area, checkCode) {
  return (Array.isArray(area.photoCaptures) ? area.photoCaptures : [])
    .filter((photo) => photo.checkCode === checkCode)
    .length;
}

function getPhotoUploadKey(areaId, checkCode) {
  return `${areaId}::${checkCode}`;
}

function isPhotoUploadPending(areaId, checkCode) {
  return (pendingPhotoUploads.get(getPhotoUploadKey(areaId, checkCode)) || 0) > 0;
}

function startPhotoUpload(areaId, checkCode) {
  const key = getPhotoUploadKey(areaId, checkCode);
  pendingPhotoUploads.set(key, (pendingPhotoUploads.get(key) || 0) + 1);
}

function finishPhotoUpload(areaId, checkCode) {
  const key = getPhotoUploadKey(areaId, checkCode);
  const nextCount = (pendingPhotoUploads.get(key) || 0) - 1;
  if (nextCount > 0) {
    pendingPhotoUploads.set(key, nextCount);
  } else {
    pendingPhotoUploads.delete(key);
  }
}

function applyCameraButtonState(button, count) {
  const safeCount = Math.max(0, Math.min(MAX_CHECK_PHOTOS, Number(count) || 0));
  const fillPercent = (safeCount / MAX_CHECK_PHOTOS) * 100;
  button.style.setProperty("--camera-fill", `${fillPercent}%`);
  button.classList.toggle("is-complete", safeCount >= MAX_CHECK_PHOTOS);
}

function isCameraAllowedForCheck(area, check) {
  return !area.locked && getCheckPhotoCount(area, check.code) < MAX_CHECK_PHOTOS;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function sanitizeFileSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

function buildCapturedPhotoName(area, check, file) {
  const apartmentName = sanitizeFileSegment(state.propertyName || "דירה");
  const roomName = sanitizeFileSegment(area.name || "חדר");
  const checkCode = sanitizeFileSegment(check.code || "בדיקה");
  const timestamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
  const typePart = (file?.type || "").split("/")[1] || "jpg";
  const extension = typePart === "jpeg" ? "jpg" : typePart.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${apartmentName}__${roomName}__${checkCode}__${timestamp}.${extension}`;
}

function buildCapturedPhotoPath(area, check, fileName) {
  const apartmentName = sanitizeFileSegment(state.propertyName || "דירה");
  const roomName = sanitizeFileSegment(area.name || "חדר");
  const checkCode = sanitizeFileSegment(check.code || "בדיקה");
  return `inspections/${apartmentName}/${roomName}/${checkCode}/${fileName}`;
}

async function compressImageForUpload(file) {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = objectUrl;
    });

    const sourceWidth = image.naturalWidth || image.width || 0;
    const sourceHeight = image.naturalHeight || image.height || 0;
    const longestSide = Math.max(sourceWidth, sourceHeight);
    const scale = longestSide > PHOTO_UPLOAD_MAX_DIMENSION ? PHOTO_UPLOAD_MAX_DIMENSION / longestSide : 1;
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))),
        "image/jpeg",
        PHOTO_UPLOAD_QUALITY
      );
    });
    URL.revokeObjectURL(objectUrl);

    if (!compressedBlob || compressedBlob.size >= file.size) {
      return file;
    }

    return new File([compressedBlob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  } catch (error) {
    console.error(error);
    return file;
  }
}

async function uploadCapturedPhoto(file, area, check, fileName) {
  if (!storage) {
    throw new Error("Cloud storage is not configured.");
  }

  const path = buildCapturedPhotoPath(area, check, fileName);
  const photoRef = storageRef(storage, path);
  await uploadBytes(photoRef, file, { contentType: file.type || "image/jpeg" });
  const downloadURL = await getDownloadURL(photoRef);
  return { storagePath: path, downloadURL };
}

async function handleCheckCameraFile(area, check, file) {
  if (!file) return;

  if (getCheckPhotoCount(area, check.code) >= MAX_CHECK_PHOTOS) {
    window.alert(`אפשר לשמור עד ${MAX_CHECK_PHOTOS} תמונות לכל סעיף בדיקה.`);
    return;
  }

  const preparedFile = await compressImageForUpload(file);
  const previewDataUrl = await readFileAsDataUrl(preparedFile).catch(() => "");
  const fileName = buildCapturedPhotoName(area, check, preparedFile);
  const pendingPhotoId = uid();
  const pendingPhotoRecord = {
    id: pendingPhotoId,
    checkCode: check.code,
    checkName: check.name,
    fileName,
    capturedAt: new Date().toISOString(),
    storagePath: "",
    downloadURL: "",
    previewDataUrl
  };
  area.photoCaptures = [
    ...(Array.isArray(area.photoCaptures) ? area.photoCaptures : []),
    pendingPhotoRecord
  ];
  startPhotoUpload(area.id, check.code);
  render({ preserveScroll: true });
  let uploadedPhoto;
  try {
    uploadedPhoto = await uploadCapturedPhoto(preparedFile, area, check, fileName);
  } catch (error) {
    window.alert("התמונה נשמרה מקומית, אבל העלאה לענן נכשלה כרגע.");
    finishPhotoUpload(area.id, check.code);
    saveState({ immediateCloud: true });
    render({ preserveScroll: true });
    console.error(error);
    return;
  }

  area.photoCaptures = (Array.isArray(area.photoCaptures) ? area.photoCaptures : []).map((photo) => (
        photo.id === pendingPhotoId
      ? {
          ...photo,
          storagePath: uploadedPhoto.storagePath,
          downloadURL: uploadedPhoto.downloadURL
        }
      : photo
  ));

  finishPhotoUpload(area.id, check.code);
  saveState({ immediateCloud: true });
  render({ preserveScroll: true });
}

async function handleCheckCameraCapture(area, check, fileInput) {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await handleCheckCameraFile(area, check, file);
}

function openCameraPicker(fileInput) {
  if (!fileInput || fileInput.disabled) return;

  try {
    if (typeof fileInput.showPicker === "function") {
      fileInput.showPicker();
      return;
    }
  } catch (error) {
    // Fall through to click() for browsers that block or lack showPicker().
  }

  fileInput.click();
}

function applyCheckVisualState(checkNode, check) {
  const statusSelect = checkNode.querySelector(".status-select");
  const noteInput = checkNode.querySelector(".note-input");

  statusSelect.classList.remove("status-pending", "status-ok", "status-issue", "status-na");
  noteInput.classList.toggle("has-note", Boolean(check.note.trim()));

  statusSelect.classList.add(`status-${check.status}`);
}

function markLocalMutation() {
  if (isApplyingCloudProject) return;
  lastLocalMutationAt = Date.now();
}

function isEditableElement(element) {
  if (!element) return false;
  const tagName = element.tagName;
  return tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA" || element.isContentEditable;
}

function isUserEditingField() {
  return isEditableElement(document.activeElement);
}

function flushPendingCloudSync() {
  if (!pendingCloudSync || isPickerOpen || isUserEditingField()) return;
  pendingCloudSync = false;
  queueCloudSync();
}

function schedulePendingCloudSyncFlush() {
  window.setTimeout(() => {
    flushPendingCloudSync();
  }, 120);
}

function setPickerOpen(value) {
  isPickerOpen = value;
  if (!isPickerOpen) flushPendingCloudSync();
}

function bindPickerStability(select) {
  const armPicker = () => setPickerOpen(true);
  const releasePicker = () => {
    window.setTimeout(() => setPickerOpen(false), 180);
  };

  select.addEventListener("pointerdown", armPicker);
  select.addEventListener("mousedown", armPicker);
  select.addEventListener("touchstart", armPicker, { passive: true });
  select.addEventListener("focus", armPicker);
  select.addEventListener("click", armPicker);
  select.addEventListener("change", releasePicker);
  select.addEventListener("blur", releasePicker);
  select.addEventListener("keyup", (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === "Tab") {
      releasePicker();
    }
  });
}

function createArea(name, type, selected = true) {
  return {
    id: uid(),
    name,
    type,
    selected,
    locked: false,
    checks: defaultChecks(type, name),
    dimensions: createDimensions(),
    photoCaptures: []
  };
}

function resetArea(area) {
  area.locked = false;
  area.checks = defaultChecks(area.type, area.name);
  area.dimensions = createDimensions();
  area.photoCaptures = [];
}

function toggleAreaLock(area) {
  const shouldFocusAfterUnlock = area.locked === true;
  area.locked = !area.locked;
  pendingFocusAreaId = shouldFocusAfterUnlock && !area.locked ? area.id : null;
  persistAndRender({}, { immediateCloud: true });
}

function buildPresetAreas(mode = state.inspectionMode) {
  const preset = mode === "owner" ? ownerAreaPreset : defaultAreaPreset;
  return preset.map((name) => createArea(name, inferAreaType(name), true));
}

function selectedAreas() {
  return state.areas.filter((area) => area.selected);
}

function ensureActiveInspectionArea() {
  const selected = selectedAreas();
  if (!selected.length) {
    state.activeInspectionAreaId = null;
    return null;
  }
  const current = selected.find((area) => area.id === state.activeInspectionAreaId);
  if (current) return current;
  state.activeInspectionAreaId = selected[0].id;
  return selected[0];
}

function setActiveInspectionAreaToFirstSelected() {
  const selected = selectedAreas();
  state.activeInspectionAreaId = selected.length ? selected[0].id : null;
}

function syncActiveInspectionArea() {
  const selected = selectedAreas();
  if (!selected.length) {
    state.activeInspectionAreaId = null;
    return null;
  }

  const current = selected.find((area) => area.id === state.activeInspectionAreaId);
  if (current) {
    return current;
  }

  state.activeInspectionAreaId = selected[0].id;
  return selected[0];
}

function moveInspectionArea(direction) {
  const selected = selectedAreas();
  if (!selected.length) return;
  const index = Math.max(0, selected.findIndex((area) => area.id === state.activeInspectionAreaId));
  const nextIndex = Math.min(selected.length - 1, Math.max(0, index + direction));
  state.activeInspectionAreaId = selected[nextIndex].id;
  render({ preserveScroll: false });
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function formatDimensionValue(value) {
  const num = normalizeNumber(value);
  return num === null ? "" : num.toFixed(2);
}

function classifyDelta(planValue, actualValue) {
  if (planValue === null || actualValue === null) return "empty";
  const delta = Math.abs(planValue - actualValue);
  if (delta <= 0.02) return "ok";
  if (delta <= 0.05) return "warn";
  return "issue";
}

function getAreaProgress(area) {
  if (area.locked) return { key: "locked", label: "הושלם וננעל" };
  const total = area.checks.length;
  const touchedChecks = area.checks.filter((check) => check.status !== "pending" || check.note.trim()).length;
  if (touchedChecks === 0) return { key: "pending", label: "לא נבדק" };
  if (touchedChecks >= total && total > 0) return { key: "complete", label: "הושלם" };
  return { key: "progress", label: "בבדיקה" };
}

function refreshProgressAndSummary() {
  renderRoomSelection();
  renderSummaryReports();
  saveState();
}

function computeSummary() {
  const checks = selectedAreas().flatMap((area) => area.checks);
  const issueChecks = checks.filter((check) => check.status === "issue");
  return {
    totalAreas: selectedAreas().length,
    totalChecks: checks.length,
    ok: checks.filter((check) => check.status === "ok").length,
    pending: checks.filter((check) => check.status === "pending").length,
    issues: issueChecks.length,
    highIssues: 0
  };
}

function getTouchedChecksCount(area) {
  return area.checks.filter((check) => check.status !== "pending" || check.note.trim()).length;
}

function isAreaInspected(area) {
  const hasPhotos = Array.isArray(area.photoCaptures) && area.photoCaptures.length > 0;
  return getTouchedChecksCount(area) > 0 || hasPhotos || area.locked;
}

function getInspectedAreas() {
  return selectedAreas().filter(isAreaInspected);
}

function computeAreaCompletion(area) {
  const total = area.checks.length;
  if (!total) return 0;
  const completedChecks = area.checks.filter((check) => check.status !== "pending").length;
  return Math.round((completedChecks / total) * 100);
}

function computeReportSummary(areas = getInspectedAreas()) {
  const checks = areas.flatMap((area) => area.checks);
  const issueChecks = checks.filter((check) => check.status === "issue");
  const completedChecks = checks.filter((check) => check.status !== "pending").length;

  return {
    inspectedAreas: areas.length,
    selectedAreas: selectedAreas().length,
    notStartedAreas: Math.max(selectedAreas().length - areas.length, 0),
    totalChecks: checks.length,
    completedChecks,
    ok: checks.filter((check) => check.status === "ok").length,
    pending: checks.filter((check) => check.status === "pending").length,
    issues: issueChecks.length,
    highIssues: 0,
    completionRate: checks.length ? Math.round((completedChecks / checks.length) * 100) : 0
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatGeneratedAt() {
  return new Date(normalizeInspectionDate(state.inspectionDate)).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatGeneratedDateOnly() {
  return new Date(normalizeInspectionDate(state.inspectionDate)).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function updateInspectionDateBadge() {
  if (!els.inspectionDateBadge) return;
  els.inspectionDateBadge.textContent = formatGeneratedDateOnly();
}

function getAllIssues() {
  return selectedAreas().flatMap((area) =>
    area.checks
      .filter((check) => check.status === "issue")
      .map((check) => ({
        area: area.name,
        type: area.type,
        code: check.code,
        category: check.category,
        name: check.name,
        note: check.note.trim()
      }))
  );
}

function getReportIssues(areas = getInspectedAreas()) {
  return areas.flatMap((area) =>
    area.checks
      .filter((check) => check.status === "issue")
      .map((check) => ({
        area: area.name,
        type: area.type,
        code: check.code,
        category: check.category,
        name: check.name,
        note: check.note.trim()
      }))
  );
}

function getReportStatus(summary) {
  if (!summary.inspectedAreas) return "טרם הושלמה בדיקה";
  if (summary.pending > 0 || summary.notStartedAreas > 0) return "דוח ביניים";
  return "דוח מסכם";
}

function buildIssueRecommendation(issue) {
  const noteText = issue.note || issue.name;
  if (issue.category.includes("בטיחות")) {
    return `מומלץ להסיר את המפגע הבטיחותי, לאמת את העמידה בדרישות התקן ולתעד תיקון.`;
  }
  if (issue.category.includes("חשמל")) {
    return `מומלץ להזמין בדיקה ותיקון של נקודת החשמל ולבצע אימות תפקודי לאחר הטיפול.`;
  }
  if (issue.category.includes("פתחים")) {
    return `מומלץ לבצע כיוון, חיזוק או החלפה לפי הצורך ולאשר תקינות פתיחה, סגירה ואיטום.`;
  }
  if (issue.category.includes("גמר")) {
    return `מומלץ להשלים תיקון גמר מקומי ולבצע ביקורת איכות לאחר ביצוע.`;
  }
  return `מומלץ לבדוק את הממצא בשטח, לבצע תיקון מתאים ולאשר השלמה בבדיקה חוזרת.`;
}

function getCheckStatusLabel(status) {
  if (status === "ok") return "תקין";
  if (status === "issue") return "ליקוי";
  if (status === "na") return "לא רלוונטי";
  return "טרם נבדק";
}

function buildExecutiveSummary(summary) {
  if (!summary.inspectedAreas) {
    return "טרם הושלמו נתוני בדיקה להצגה בדוח לקוח. לאחר הזנת ממצאים באזורים שנבדקו, יופיע כאן תקציר מקצועי ומוכן למשלוח.";
  }

  const issueTone = summary.issues
    ? `במהלך הבדיקה זוהו ${summary.issues} ליקויים הדורשים טיפול או בדיקה חוזרת.`
    : "במהלך הבדיקה לא זוהו ליקויים שסומנו לטיפול.";
  const scopeTone = summary.notStartedAreas
    ? `הדוח מתייחס ל-${summary.inspectedAreas} אזורים שנבדקו בפועל, בעוד ${summary.notStartedAreas} אזורים נוספים טרם הושלמו ולכן אינם מפורטים במסמך זה.`
    : `הדוח מתייחס ל-${summary.inspectedAreas} אזורים שנבדקו בפועל ומציג את עיקרי הממצאים והמלצות ההמשך.`;

  return `${scopeTone} ${issueTone} שיעור ההשלמה באזורים הנכללים בדוח עומד על ${summary.completionRate}%.`;
}

function buildClosingNote(summary) {
  if (!summary.inspectedAreas) {
    return "מומלץ להשלים את הבדיקה בשטח ולהזין ממצאים לפני הפקת דוח לקוח.";
  }

  if (summary.issues > 0) {
    return "המסמך מרכז את הליקויים שדורשים טיפול בשלב זה. מומלץ להעבירו לגורם המבצע, לעקוב אחר תיקון הליקויים, ולהפיק דוח מעודכן לאחר ביקורת חוזרת.";
  }

  return "לא סומנו ליקויים לטיפול באזורים שנבדקו. לאחר השלמת יתר האזורים, ניתן להפיק דוח מסכם סופי למסירה.";
}

function renderReportDocument(summary, issues) {
  const reportAreas = getInspectedAreas();
  const reportSummary = computeReportSummary(reportAreas);
  const reportIssues = getReportIssues(reportAreas);
  const reportStatus = getReportStatus(reportSummary);
  const projectTitle = state.propertyName || "דוח בדיקה הנדסית";
  const headerBrandTitle = "אורי לוין";
  const headerBrandSubtitle = "ביצוע ופיקוח בבנייה";
  const subtitle = state.propertyAddress
    ? `${reportStatus} עבור ${state.propertyAddress}.`
    : `${reportStatus} מוכן לשיתוף ולהפקה כ-PDF.`;

  els.reportDocTitle.textContent = projectTitle;
  els.reportDocSubtitle.textContent = subtitle;
  els.reportCoverBadge.textContent = reportStatus;
  els.reportPageHeaderTitle.textContent = headerBrandTitle;
  els.reportPageHeaderInspector.textContent = headerBrandSubtitle;
  els.reportPageHeaderStatus.textContent = reportStatus;
  els.reportPageHeaderDate.textContent = formatGeneratedDateOnly();
  if (els.reportInlineDate) {
    els.reportInlineDate.textContent = `תאריך הפקה: ${formatGeneratedAt()}`;
  }

  if (els.reportIntroTitle && els.reportIntroBlock) {
    if (state.inspectionMode === "owner") {
      els.reportIntroTitle.textContent = "חשיבות תסקיר דירות בעלים";
      els.reportIntroBlock.innerHTML = `
        <p>תסקיר דירות בעלים נועד ליצור צילום מצב קיים של הדירה לפני תחילת השיפוץ, כך שניתן יהיה לתעד באופן מסודר את מצבה בנקודת הזמן הנוכחית.</p>
        <p>התסקיר מסייע לבעלי הדירה, למתכננים ולבעלי המקצוע לעבוד מתוך בסיס ברור, להשוות בהמשך בין המצב הקיים לתכנון החדש, ולהפחית אי-הבנות במהלך השיפוץ.</p>
      `;
    } else {
      els.reportIntroTitle.textContent = "חשיבות בדק בית";
      els.reportIntroBlock.innerHTML = `
        <p>בדק בית מקצועי נועד לוודא כי הנכס נבנה בהתאם לתקנים, לתוכניות ולדרישות הבטיחות, וכן לאתר ליקויים בשלב מוקדם ככל האפשר. איתור מוקדם מאפשר לצמצם עלויות תיקון עתידיות, לשפר את איכות הביצוע ולשמור על רמת גימור נאותה טרם מסירה או אכלוס.</p>
        <p>מסמך זה מרכז ממצאים, הערות והמלצות להמשך טיפול, ומהווה כלי תיעודי חשוב להתנהלות מול הקבלן והגורמים המקצועיים. בדיקה מסודרת מעניקה לרוכש תמונת מצב אמינה, מסייעת במימוש זכויות האחריות ותורמת לשקט נפשי ולביטחון בהשקעה בנכס.</p>
      `;
    }
  }

  const coverMetaItems = [
    state.clientName && `לקוח: ${state.clientName}`,
    state.clientPhone && `נייד: ${state.clientPhone}`,
    state.clientEmail && `Email: ${state.clientEmail}`,
    state.inspectorName && `בודק: ${state.inspectorName}`,
    state.propertyAddress && `מיקום: ${state.propertyAddress}`,
    `תאריך הפקה: ${formatGeneratedAt()}`
  ].filter(Boolean);
  els.reportCoverMeta.innerHTML = coverMetaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  const overviewItems = [
    ["סטטוס", reportStatus],
    ["בודק", state.inspectorName || "לא הוזן"],
    ["לקוח", state.clientName || "לא הוזן"],
    ["נייד", state.clientPhone || "לא הוזן"],
    ["Email", state.clientEmail || "לא הוזן"],
    ["אזורים", `${reportSummary.inspectedAreas} נבדקו${reportSummary.notStartedAreas ? `, ${reportSummary.notStartedAreas} לא נכללו` : ""}`]
  ];

  if (els.reportOverview) {
    els.reportOverview.innerHTML = overviewItems.map(([label, value]) => `
      <div class="report-overview-item">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(value)}</span>
      </div>
    `).join("");
  }

  if (els.reportExecutiveSummary) {
    els.reportExecutiveSummary.innerHTML = `<p>${escapeHtml(buildExecutiveSummary(reportSummary))}</p>`;
  }

  const statItems = [
    ["חדרים שנבדקו", reportSummary.inspectedAreas],
    ["סעיפים שנבדקו", reportSummary.completedChecks],
    ["תקין", reportSummary.ok],
    ["ליקויים", reportSummary.issues],
    ["השלמה", `${reportSummary.completionRate}%`]
  ];

  if (els.reportSummaryStats) {
    els.reportSummaryStats.innerHTML = statItems.map(([label, value]) => `
      <div class="report-stat-card">
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(label)}</span>
      </div>
    `).join("");
  }

  if (!reportIssues.length) {
    els.reportCriticalFindings.innerHTML = `<div class="report-empty">לא זוהו ליקויים באזורים שנבדקו בפועל. ניתן להשתמש במסמך זה כדוח ביניים או להמשיך להשלמת יתר האזורים.</div>`;
  } else {
    els.reportCriticalFindings.innerHTML = reportIssues
      .map((issue) => `
        <article class="report-finding-item">
          <strong>${escapeHtml(issue.area)} | ${escapeHtml(issue.name)}</strong>
          <div class="report-finding-meta">קוד סעיף: ${escapeHtml(issue.code)} | ${escapeHtml(issue.category)}</div>
          <p class="report-check-note"><strong>ממצא:</strong> ${escapeHtml(issue.note || "נדרש פירוט נוסף מצד הבודק.")}</p>
          <p class="report-check-note"><strong>המלצה:</strong> ${escapeHtml(buildIssueRecommendation(issue))}</p>
        </article>
      `).join("");
  }

  const areaCards = reportAreas
    .filter((area) => area.checks.some((check) => check.status === "issue"))
    .map((area) => {
    const total = area.checks.length;
    const issuesInArea = area.checks.filter((check) => check.status === "issue");
    const okCount = area.checks.filter((check) => check.status === "ok").length;
    const pendingCount = area.checks.filter((check) => check.status === "pending").length;
    const progress = getAreaProgress(area);
    const completion = computeAreaCompletion(area);
    const areaChecksMarkup = issuesInArea.length
      ? issuesInArea.map((check) => `
          <div class="report-check-item">
            <strong>${escapeHtml(check.name)}</strong>
            <div class="report-check-meta">${escapeHtml(check.category)} | ${escapeHtml(getCheckStatusLabel(check.status))}</div>
            ${check.note.trim()
              ? `<p class="report-check-note"><strong>הערה:</strong> ${escapeHtml(check.note.trim())}</p>`
              : ""
            }
            <p class="report-check-note"><strong>המלצה:</strong> ${escapeHtml(buildIssueRecommendation({
              category: check.category,
              note: check.note.trim(),
              name: check.name
            }))}</p>
          </div>
        `).join("")
      : `<div class="report-empty">לא זוהו ליקויים בחדר זה.</div>`;

    return `
      <article class="report-area-card">
        <div class="report-area-head">
          <div>
            <strong>${escapeHtml(area.name)}</strong>
            <div class="report-area-meta">${escapeHtml(areaTypeLabels[area.type])} | ${escapeHtml(total)} סעיפי בדיקה | ${escapeHtml(progress.label)}</div>
          </div>
          <span class="report-area-status">${escapeHtml(completion)}% הושלם</span>
        </div>
        <div class="report-area-meta">תקין: ${escapeHtml(okCount)} | ליקויים: ${escapeHtml(issuesInArea.length)} | ממתין: ${escapeHtml(pendingCount)}</div>
        ${area.photoCaptures?.length ? `
          <div class="report-area-photos">
            ${area.photoCaptures.map((photo) => {
              const src = photo.downloadURL || photo.previewDataUrl || "";
              return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(photo.checkName || area.name)}">` : "";
            }).join("")}
          </div>
        ` : ""}
        <div class="report-area-checks">${areaChecksMarkup}</div>
      </article>
      `;
  });

  if (els.reportAreaDetails) {
    els.reportAreaDetails.innerHTML = areaCards.length
      ? areaCards.join("")
      : `<div class="report-empty">לא זוהו ליקויים בחדרים שנבדקו.</div>`;
  }

  els.reportClosingNote.innerHTML = `<p>${escapeHtml(buildClosingNote(reportSummary))}</p>`;
}

function padPageNumber(value) {
  return String(value).padStart(2, "0");
}

function createPrintPage(pageNumber) {
  const page = document.createElement("section");
  page.className = "print-page";
  page.innerHTML = `
    <div class="print-page-header">
      <div class="print-page-brand">
        <img class="print-page-logo report-brand-logo" src="assets/logo-report.png" alt="לוגו קבוצת משה חדיף">
        <div>
          <strong>אורי לוין</strong>
          <span>ביצוע ופיקוח בבנייה</span>
        </div>
      </div>
      <div class="print-page-meta">
        <span>${escapeHtml(els.reportPageHeaderStatus.textContent)}</span>
        <span>${escapeHtml(els.reportPageHeaderDate.textContent)}</span>
        <span>עמוד ${padPageNumber(pageNumber)}</span>
      </div>
    </div>
    <div class="print-page-body"></div>
  `;
  return page;
}

function buildCompactPrintBody() {
  const reportAreas = getInspectedAreas();
  const reportSummary = computeReportSummary(reportAreas);
  const reportIssues = getReportIssues(reportAreas).slice(0, 5);
  const reportPhotos = reportAreas.flatMap((area) => (
    (Array.isArray(area.photoCaptures) ? area.photoCaptures : [])
      .map((photo) => ({
        areaName: area.name,
        checkName: photo.checkName || "",
        src: photo.downloadURL || photo.previewDataUrl || ""
      }))
      .filter((photo) => photo.src)
  ));
  const topAreaLines = reportAreas.slice(0, 4).map((area) => {
    const issuesCount = area.checks.filter((check) => check.status === "issue").length;
    const completion = computeAreaCompletion(area);
    return `${area.name} | ${completion}% הושלם | ליקויים: ${issuesCount}`;
  });

  const issueMarkup = reportIssues.length
    ? reportIssues.map((issue) => `
        <li>
          <strong>${escapeHtml(issue.area)}:</strong>
          ${escapeHtml(issue.note || issue.name)}
        </li>
      `).join("")
    : `<li>לא זוהו ליקויים באזורים שנבדקו.</li>`;

  const photoMarkup = reportPhotos.length
    ? `
      <section class="report-section compact-print-photos">
        <h3>תמונות מהבדיקה</h3>
        <div class="compact-photo-grid">
          ${reportPhotos.map((photo) => `
            <figure class="compact-photo-card">
              <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(`${photo.areaName} - ${photo.checkName}`)}">
              <figcaption>${escapeHtml(photo.areaName)}${photo.checkName ? ` | ${escapeHtml(photo.checkName)}` : ""}</figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `
    : "";

  const roomMarkup = reportAreas.some((area) => area.checks.some((check) => check.status === "issue"))
    ? `
      <section class="report-section compact-print-rooms">
        <h3>חדרים שנבדקו</h3>
        <div class="report-area-details">
          ${reportAreas
            .filter((area) => area.checks.some((check) => check.status === "issue"))
            .map((area) => {
            const issuesInArea = area.checks.filter((check) => check.status === "issue");
            const checkMarkup = issuesInArea.length
              ? issuesInArea.map((check) => `
                  <div class="report-check-item">
                    <strong>${escapeHtml(check.name)}</strong>
                    <div class="report-check-meta">${escapeHtml(check.category)} | ${escapeHtml(getCheckStatusLabel(check.status))}</div>
                    ${check.note.trim() ? `<p class="report-check-note"><strong>הערה:</strong> ${escapeHtml(check.note.trim())}</p>` : ""}
                    <p class="report-check-note"><strong>המלצה:</strong> ${escapeHtml(buildIssueRecommendation({
                      category: check.category,
                      note: check.note.trim(),
                      name: check.name
                    }))}</p>
                  </div>
                `).join("")
              : `<div class="report-empty">לא זוהו ליקויים בחדר זה.</div>`;
            return `
              <article class="report-area-card">
                <div class="report-area-head">
                  <div>
                    <strong>${escapeHtml(area.name)}</strong>
                    <div class="report-area-meta">${escapeHtml(areaTypeLabels[area.type])} | ${escapeHtml(getAreaProgress(area).label)}</div>
                  </div>
                </div>
                ${area.photoCaptures?.length ? `
                  <div class="report-area-photos">
                    ${area.photoCaptures.map((photo) => {
                      const src = photo.downloadURL || photo.previewDataUrl || "";
                      return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(photo.checkName || area.name)}">` : "";
                    }).join("")}
                  </div>
                ` : ""}
                <div class="report-area-checks">${checkMarkup}</div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `
    : `
      <section class="report-section compact-print-rooms">
        <h3>חדרים שנבדקו</h3>
        <div class="report-empty">לא זוהו ליקויים בחדרים שנבדקו.</div>
      </section>
    `;

  return `
    <section class="report-section compact-print-intro">
      <div class="report-inline-brand">
        <img class="report-inline-logo" src="assets/logo-report.png" alt="לוגו קבוצת משה חדיף">
      </div>
      <h3>מהות המסמך</h3>
      <div class="report-text-block">
        <p>דוח זה מרכז ממצאים עיקריים, תמונת מצב תמציתית והמלצות פעולה להמשך טיפול, לצורך מסירה ללקוח ותיעוד מקצועי מסודר.</p>
      </div>
    </section>
    <section class="report-section compact-print-grid">
      <div class="compact-print-card">
        <strong>נכס</strong>
        <span>${escapeHtml(state.propertyName || "לא הוזן")}</span>
      </div>
      <div class="compact-print-card">
        <strong>כתובת</strong>
        <span>${escapeHtml(state.propertyAddress || "לא הוזנה")}</span>
      </div>
      <div class="compact-print-card">
        <strong>לקוח</strong>
        <span>${escapeHtml(state.clientName || "לא הוזן")}</span>
      </div>
      <div class="compact-print-card">
        <strong>בודק</strong>
        <span>${escapeHtml(state.inspectorName || "לא הוזן")}</span>
      </div>
      <div class="compact-print-card">
        <strong>חדרים שנבדקו</strong>
        <span>${escapeHtml(reportSummary.inspectedAreas)}</span>
      </div>
      <div class="compact-print-card">
        <strong>ליקויים</strong>
        <span>${escapeHtml(reportSummary.issues)}</span>
      </div>
    </section>
    <section class="report-section compact-print-grid compact-print-stats">
      <div class="compact-print-card">
        <strong>סעיפים שנבדקו</strong>
        <span>${escapeHtml(reportSummary.completedChecks)}</span>
      </div>
      <div class="compact-print-card">
        <strong>תקין</strong>
        <span>${escapeHtml(reportSummary.ok)}</span>
      </div>
      <div class="compact-print-card">
        <strong>השלמה</strong>
        <span>${escapeHtml(`${reportSummary.completionRate}%`)}</span>
      </div>
      <div class="compact-print-card">
        <strong>סטטוס</strong>
        <span>${escapeHtml(getReportStatus(reportSummary))}</span>
      </div>
    </section>
    <section class="report-section compact-print-columns">
      <div>
        <h3>ממצאים מרכזיים</h3>
        <ul class="compact-print-list">${issueMarkup}</ul>
      </div>
    </section>
    ${roomMarkup}
    ${photoMarkup}
    <section class="report-section">
      <h3>סיכום והמלצות</h3>
      <div class="report-text-block">
        <p>${escapeHtml(buildClosingNote(reportSummary))}</p>
      </div>
    </section>
  `;
}

function buildPrintPages() {
  if (!els.printPages || !els.reportDocument) return;
  els.printPages.innerHTML = "";
  const page = createPrintPage(1);
  page.querySelector(".print-page-body").innerHTML = buildCompactPrintBody();
  els.printPages.appendChild(page);
}

function updateProjectFields() {
  state.propertyName = els.propertyName.value.trim();
  state.propertyAddress = normalizePropertyAddress(els.propertyAddress.value);
  state.inspectionDate = normalizeInspectionDate(els.inspectionDate.value);
  state.clientName = els.clientName.value.trim();
  state.clientPhone = els.clientPhone.value.trim();
  state.clientEmail = els.clientEmail.value.trim();
  state.inspectorName = els.inspectorName.value.trim();
  updateInspectionDateBadge();
}

function getProjectTitle(project = state) {
  return project.propertyName || "בדיקת דירה ללא שם נכס";
}

function projectDataSignature(projectData = {}) {
  const normalized = {
    inspectionMode: projectData.inspectionMode || "new",
    propertyName: projectData.propertyName || "",
    propertyAddress: normalizePropertyAddress(projectData.propertyAddress),
    inspectionDate: normalizeInspectionDate(projectData.inspectionDate),
    clientName: projectData.clientName || "",
    clientPhone: projectData.clientPhone || "",
    clientEmail: projectData.clientEmail || "",
    inspectorName: projectData.inspectorName || "",
    activeInspectionAreaId: projectData.activeInspectionAreaId || null,
    areas: Array.isArray(projectData.areas)
      ? projectData.areas.map((area) => ({
          id: area.id || "",
          name: area.name || "",
          type: area.type || "",
          selected: area.selected !== false,
          locked: area.locked === true,
          dimensions: {
            planWidth: area.dimensions?.planWidth || "",
            planLength: area.dimensions?.planLength || "",
            actualWidth: area.dimensions?.actualWidth || "",
            actualLength: area.dimensions?.actualLength || ""
          },
          photoCaptures: Array.isArray(area.photoCaptures)
            ? area.photoCaptures.map((photo) => ({
                id: photo.id || "",
                checkCode: photo.checkCode || "",
                checkName: photo.checkName || "",
                fileName: photo.fileName || "",
                capturedAt: photo.capturedAt || "",
                storagePath: photo.storagePath || "",
                downloadURL: photo.downloadURL || "",
                previewDataUrl: photo.previewDataUrl || ""
              }))
            : [],
          checks: Array.isArray(area.checks)
            ? area.checks.map((check) => ({
                code: check.code || "",
                status: check.status || "pending",
                note: check.note || ""
              }))
            : []
        }))
      : []
  };

  return JSON.stringify(normalized);
}

function serializeCurrentProject() {
  updateProjectFields();
  return {
    inspectionMode: state.inspectionMode,
    propertyName: state.propertyName,
    propertyAddress: normalizePropertyAddress(state.propertyAddress),
    inspectionDate: normalizeInspectionDate(state.inspectionDate),
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    clientEmail: state.clientEmail,
    inspectorName: state.inspectorName,
    activeInspectionAreaId: state.activeInspectionAreaId,
    areas: JSON.parse(JSON.stringify(state.areas))
  };
}

function saveProjectsLibrary() {
  localStorage.setItem(projectsKey, JSON.stringify(state.savedProjects));
}

function upsertSavedProjectRecord(record) {
  const canonicalRecordId = getCanonicalProjectId(record) || record.id;
  const normalizedRecord = normalizeProjectRecord({ ...record, id: canonicalRecordId });
  if (!normalizedRecord) return;
  const existingIndex = state.savedProjects.findIndex((project) => (
    (getCanonicalProjectId(project) || project.id) === normalizedRecord.id
  ));
  if (existingIndex >= 0) {
    state.savedProjects[existingIndex] = normalizedRecord;
  } else {
    state.savedProjects.unshift(normalizedRecord);
  }
  state.savedProjects.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
}

function buildProjectRecord(projectId = getCanonicalProjectId({
  id: state.currentProjectId,
  inspectionMode: state.inspectionMode,
  propertyName: state.propertyName
}) || state.currentProjectId || uid()) {
  const now = new Date();
  return {
    id: projectId,
    title: getProjectTitle(),
    propertyName: state.propertyName,
    propertyAddress: normalizePropertyAddress(state.propertyAddress),
    updatedAt: now.toISOString(),
    updatedAtMs: now.getTime(),
    data: serializeCurrentProject()
  };
}

function syncCurrentProjectDraft() {
  if (!state.currentProjectId) return null;
  const record = buildProjectRecord(state.currentProjectId);
  upsertSavedProjectRecord(record);
  saveProjectsLibrary();
  return record;
}

async function saveProjectRecordToCloud(record) {
  if (!db) return;
  await setDoc(doc(db, PROJECTS_COLLECTION, record.id), record);
}

async function cleanupDuplicateOwnerProjects(duplicateProjects = []) {
  if (!db || !duplicateProjects.length) return;

  const duplicateOwnerProjects = duplicateProjects.filter((project) => {
    const propertyName = String(project?.data?.propertyName || project?.propertyName || "").trim();
    const canonicalId = getCanonicalProjectId(project);
    return project?.rawCloudId && canonicalId && project.rawCloudId !== canonicalId && isOwnerApartmentName(propertyName);
  });

  for (const project of duplicateOwnerProjects) {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, project.rawCloudId));
    } catch (error) {
      console.error(error);
    }
  }
}

async function deleteOwnerApartmentProjectCopies(project = {}) {
  if (!db) return;

  const propertyName = String(project?.data?.propertyName || project?.propertyName || "").trim();
  if (!isOwnerApartmentName(propertyName)) return;

  const canonicalId = getOwnerApartmentProjectId(propertyName);
  const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
  const matchingDocs = snapshot.docs.filter((item) => {
    const data = item.data() || {};
    const itemPropertyName = String(data?.data?.propertyName || data?.propertyName || "").trim();
    const inspectionMode = data?.data?.inspectionMode || data?.inspectionMode || "";
    return (
      item.id === canonicalId
      || (inspectionMode === "owner" && itemPropertyName === propertyName)
    );
  });

  for (const item of matchingDocs) {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, item.id));
  }
}

function normalizeProjectRecord(project) {
  if (!project || !project.id || !project.data) return null;
  return {
    ...project,
    title: project.data.propertyName || project.title || "בדיקת דירה ללא שם נכס",
    propertyAddress: normalizePropertyAddress(project.data.propertyAddress || project.propertyAddress),
    updatedAt: project.updatedAt || new Date(project.updatedAtMs || Date.now()).toISOString(),
    updatedAtMs: Number(project.updatedAtMs || 0),
    data: {
      ...project.data,
      areas: Array.isArray(project.data.areas) ? project.data.areas.map((area) => hydrateArea(area)) : buildPresetAreas()
    }
  };
}

async function bootstrapCloudProjects(localProjects = []) {
  if (!db || hasBootstrappedCloud) return;
  hasBootstrappedCloud = true;
  try {
    const cloudSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    const cloudIds = new Set(cloudSnapshot.docs.map((item) => item.id));
    const missingLocalProjects = localProjects.filter((project) => project?.id && !cloudIds.has(project.id));
    for (const project of missingLocalProjects) {
      await saveProjectRecordToCloud(normalizeProjectRecord(project) || project);
    }
  } catch (error) {
    updateCloudStatus("הסנכרון לענן זמין חלקית. אפשר להמשיך לעבוד ולשמור ידנית.", "warn");
    console.error(error);
  }
}

function queueCloudSync() {
  if (!db || !state.currentProjectId) return;
  if (isPickerOpen || isUserEditingField()) {
    pendingCloudSync = true;
    return;
  }
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = window.setTimeout(async () => {
    try {
      updateProjectFields();
      const record = buildProjectRecord(state.currentProjectId);
      await saveProjectRecordToCloud(record);
      state.currentProjectId = record.id;
      lastCloudAppliedAt = record.updatedAtMs;
      updateCloudStatus("הבדיקה מסונכרנת לענן בין מחשב לנייד.", "ok");
    } catch (error) {
      updateCloudStatus("שמירה מקומית פועלת, אבל הסנכרון לענן נכשל כרגע.", "error");
      console.error(error);
    }
  }, 700);
}

function subscribeToCloudProjects() {
  if (!db || projectsUnsubscribe) {
    if (!db) updateCloudStatus("אין חיבור לענן. הנתונים נשמרים מקומית בלבד.", "warn");
    return;
  }

  updateCloudStatus("מתחבר לענן ומסנכרן פרויקטים...", "warn");
  const localProjectsSeed = [...state.savedProjects];
  bootstrapCloudProjects(localProjectsSeed);
  projectsUnsubscribe = onSnapshot(
    collection(db, PROJECTS_COLLECTION),
    async (snapshot) => {
      const incomingProjects = snapshot.docs
        .map((item) => normalizeProjectRecord({ id: item.id, rawCloudId: item.id, ...item.data() }))
        .filter(Boolean);
      const { dedupedProjects, duplicateProjects } = dedupeProjectRecords(incomingProjects);
      state.savedProjects = dedupedProjects;
      saveProjectsLibrary();
      renderSavedProjects();
      updateCloudStatus("סנכרון ענן פעיל. אותם פרויקטים זמינים במחשב ובנייד.", "ok");
      cleanupDuplicateOwnerProjects(duplicateProjects);

      const activeProject = state.currentProjectId ? dedupedProjects.find((project) => project.id === state.currentProjectId) : null;
      if (isPickerOpen || isUserEditingField()) return;
      const localIsIdle = Date.now() - lastLocalMutationAt > 1200;
      const remoteDiffersFromLocal = activeProject
        && projectDataSignature(activeProject.data) !== projectDataSignature(serializeCurrentProject());
      if (activeProject && localIsIdle && remoteDiffersFromLocal) {
        isApplyingCloudProject = true;
        try {
          applyProjectData(activeProject.data);
          lastCloudAppliedAt = activeProject.updatedAtMs;
          render({ preserveScroll: false });
        } finally {
          isApplyingCloudProject = false;
        }
      }
    },
    (error) => {
      updateCloudStatus("החיבור לענן נכשל. אפשר להמשיך לעבוד מקומית.", "error");
      console.error(error);
    }
  );
}

async function saveCurrentProject() {
  updateProjectFields();
  if (!state.propertyName) {
    window.alert("יש להזין שם נכס לפני שמירה.");
    return false;
  }

  const id = getCanonicalProjectId({
    id: state.currentProjectId,
    inspectionMode: state.inspectionMode,
    propertyName: state.propertyName
  }) || state.currentProjectId || uid();
  const record = buildProjectRecord(id);

  state.currentProjectId = id;
  upsertSavedProjectRecord(record);
  saveProjectsLibrary();
  saveState();
  try {
    await saveProjectRecordToCloud(record);
    lastCloudAppliedAt = record.updatedAtMs;
    updateCloudStatus("הבדיקה נשמרה בענן וזמינה גם במחשב וגם בנייד.", "ok");
  } catch (error) {
    updateCloudStatus("הבדיקה נשמרה מקומית, אבל לא הועלתה לענן.", "error");
    console.error(error);
  }
  renderSavedProjects();
  return true;
}

function loadProject(projectId) {
  const project = state.savedProjects.find((item) => item.id === projectId);
  if (!project || !project.data) return;

  state.currentProjectId = project.id;
  isApplyingCloudProject = true;
  applyProjectData(project.data);
  lastCloudAppliedAt = project.updatedAtMs || Date.now();
  isApplyingCloudProject = false;
  const targetScreen = "rooms";
  state.currentScreen = targetScreen;
  syncActiveInspectionArea();
  render({ preserveScroll: false });
  setScreen(targetScreen, { scroll: true });
}

async function deleteProject(projectId) {
  const project = state.savedProjects.find((item) => item.id === projectId);
  if (!project) return;
  const confirmed = window.confirm(`למחוק את "${project.title}" מרשימת הבדיקות השמורות?`);
  if (!confirmed) return;

  const canonicalId = getCanonicalProjectId(project) || projectId;
  state.savedProjects = state.savedProjects.filter((item) => (
    (getCanonicalProjectId(item) || item.id) !== canonicalId
  ));
  if (state.currentProjectId === projectId) {
    state.currentProjectId = null;
  }
  saveProjectsLibrary();
  saveState();
  if (db) {
    try {
      if (project?.data?.inspectionMode === "owner") {
        await deleteOwnerApartmentProjectCopies(project);
      } else {
        await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
      }
    } catch (error) {
      updateCloudStatus("הפרויקט נמחק מקומית, אבל המחיקה בענן נכשלה.", "error");
      console.error(error);
    }
  }
  renderSavedProjects();
}

function startNewProject() {
  state.currentProjectId = null;
  state.currentScreen = "welcome";
  state.propertyName = "";
  state.propertyAddress = DEFAULT_PROPERTY_ADDRESS;
  state.inspectionDate = getTodayInputValue();
  state.clientName = "";
  state.clientPhone = "";
  state.clientEmail = "";
  state.inspectorName = "";
  state.activeInspectionAreaId = null;
  state.areas = buildPresetAreas();
  els.propertyName.value = "";
  els.propertyAddress.value = DEFAULT_PROPERTY_ADDRESS;
  els.inspectionDate.value = state.inspectionDate;
  els.clientName.value = "";
  els.clientPhone.value = "";
  els.clientEmail.value = "";
  els.inspectorName.value = "";
  updateInspectionDateBadge();
  render({ preserveScroll: false });
  setScreen("welcome", { scroll: true });
}

function selectInspectionMode(mode) {
  state.inspectionMode = mode === "owner" ? "owner" : "new";
  updateWelcomeTitle();
  setScreen(state.inspectionMode === "owner" ? "owner-apartments" : "welcome", { scroll: true });
}

function openOwnerApartment(apartmentName) {
  const existingProject = state.savedProjects.find((project) => (
    project?.data?.inspectionMode === "owner"
    && project?.data?.propertyName === apartmentName
  ));

  state.inspectionMode = "owner";

  if (existingProject?.data) {
    state.currentProjectId = existingProject.id;
    isApplyingCloudProject = true;
    applyProjectData(existingProject.data);
    lastCloudAppliedAt = existingProject.updatedAtMs || Date.now();
    isApplyingCloudProject = false;
  } else {
    state.currentProjectId = getOwnerApartmentProjectId(apartmentName);
    state.propertyName = apartmentName;
    state.propertyAddress = DEFAULT_PROPERTY_ADDRESS;
    state.inspectionDate = getTodayInputValue();
    state.clientName = "";
    state.clientPhone = "";
    state.clientEmail = "";
    state.inspectorName = "";
    state.activeInspectionAreaId = null;
    state.areas = buildPresetAreas();
    els.propertyName.value = apartmentName;
    els.propertyAddress.value = DEFAULT_PROPERTY_ADDRESS;
    els.inspectionDate.value = state.inspectionDate;
    els.clientName.value = "";
    els.clientPhone.value = "";
    els.clientEmail.value = "";
    els.inspectorName.value = "";
    updateInspectionDateBadge();
    saveState({ immediateCloud: true });
  }

  render({ preserveScroll: false });
  setScreen("welcome", { scroll: true });
}

function renderSavedProjects() {
  if (!els.savedProjectsList) return;

  if (els.jumpToSavedProjectsBtn) {
    els.jumpToSavedProjectsBtn.hidden = !state.savedProjects.length;
  }

  if (!state.savedProjects.length) {
    els.savedProjectsList.innerHTML = `<div class="empty-state">עדיין אין בדיקות שמורות. שמור את הדירה הנוכחית כדי לחזור אליה בהמשך.</div>`;
    return;
  }

  els.savedProjectsList.innerHTML = state.savedProjects.map((project) => {
    const updatedAt = project.updatedAt
      ? new Date(project.updatedAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
      : "";
    const propertyName = project.data?.propertyName || project.title || "בדיקת דירה ללא שם נכס";
    const addressLine = project.propertyAddress ? `<p class="saved-project-meta">${project.propertyAddress}</p>` : "";
    const modeLabel = project.data?.inspectionMode === "owner" ? "תסקיר בעלים" : "בדיקת נכס";
    return `
      <article class="saved-project" data-project-id="${project.id}">
        <div class="saved-project-accent"></div>
        <div class="saved-project-head">
          <span class="saved-project-icon" aria-hidden="true">${STATUS_ICON_MARKUP.saved}</span>
          <div>
            <p class="saved-project-title">${propertyName}</p>
            <p class="saved-project-mode">${modeLabel}</p>
            ${addressLine}
            <p class="saved-project-meta">עודכן: ${updatedAt || "ללא תאריך"}</p>
          </div>
          ${state.currentProjectId === project.id ? '<span class="inline-badge">פתוח עכשיו</span>' : ""}
        </div>
        <div class="saved-project-actions">
          <button class="ghost-btn" type="button" data-action="open-project" data-project-id="${project.id}">פתח</button>
          <button class="delete-btn" type="button" data-action="delete-project" data-project-id="${project.id}">מחק</button>
        </div>
      </article>
    `;
  }).join("");

  els.savedProjectsList.querySelectorAll("[data-action='open-project']").forEach((button) => {
    button.addEventListener("click", () => loadProject(button.dataset.projectId));
  });

  els.savedProjectsList.querySelectorAll("[data-action='delete-project']").forEach((button) => {
    button.addEventListener("click", () => deleteProject(button.dataset.projectId));
  });
}

function updateHeader() {
  updateProjectFields();
  const defaultReportTitle = state.inspectionMode === "owner" ? "תסקיר דירות בעלים" : "דוח בדיקה הנדסית";
  const introScreens = new Set(["home", "owner-apartments"]);
  const welcomeLikeScreens = new Set(["welcome", "rooms"]);
  if (introScreens.has(state.currentScreen)) {
    els.reportTitle.textContent = "Inspector";
    els.reportMeta.textContent = "בדיקות הנדסיות לנכס";
    return;
  }

  if (welcomeLikeScreens.has(state.currentScreen) && !state.propertyName) {
    els.reportTitle.textContent = defaultReportTitle;
    els.reportMeta.textContent = "מלא פרטי נכס, בחר חדרים ואז עבור למסך הבדיקה.";
    return;
  }

  els.reportTitle.textContent = state.propertyName || defaultReportTitle;
  const parts = [
    state.propertyAddress && `כתובת: ${state.propertyAddress}`,
    state.clientName && `לקוח: ${state.clientName}`,
    state.clientPhone && `נייד: ${state.clientPhone}`,
    state.clientEmail && `Email: ${state.clientEmail}`,
    state.inspectorName && `בודק: ${state.inspectorName}`
  ].filter(Boolean);
  els.reportMeta.textContent = parts.length ? parts.join(" | ") : "בחר חדרים ומלא את הבדיקות בשטח.";
}

function persistProjectRecordImmediately(record) {
  if (!db || !record) return;
  clearTimeout(cloudSyncTimer);
  pendingCloudSync = false;
  lastCloudAppliedAt = record.updatedAtMs;
  saveProjectRecordToCloud(record)
    .then(() => {
      updateCloudStatus("הבדיקה מסונכרנת לענן בין מחשב לנייד.", "ok");
    })
    .catch((error) => {
      updateCloudStatus("שמירה מקומית פועלת, אבל הסנכרון לענן נכשל כרגע.", "error");
      console.error(error);
    });
}

function saveState(options = {}) {
  const { immediateCloud = false } = options;
  markLocalMutation();
  const record = syncCurrentProjectDraft();
  localStorage.setItem(storageKey, JSON.stringify(state));
  if (immediateCloud) {
    persistProjectRecordImmediately(record);
    return;
  }
  queueCloudSync();
}

function persistAndRender(renderOptions = {}, stateOptions = {}) {
  saveState(stateOptions);
  render(renderOptions);
}

function applyScreenState(screen) {
  document.body.dataset.screen = screen;
  els.screens.forEach((section) => section.classList.toggle("active", section.id === `screen-${screen}`));
  els.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.screen === screen));
}

function setScreen(screen, options = {}) {
  const { scroll = true } = options;
  state.currentScreen = screen;
  applyScreenState(screen);
  saveState();
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRoomSelection() {
  els.roomsSelection.innerHTML = "";
  if (els.roomsPropertyName) {
    els.roomsPropertyName.textContent = state.propertyName ? `דירה פעילה: ${state.propertyName}` : "";
  }
  state.areas.forEach((area) => {
    const button = els.roomChipTemplate.content.firstElementChild.cloneNode(true);
    const progress = getAreaProgress(area);
    button.querySelector(".room-pick-icon").innerHTML = getAreaIconMarkup(area);
    button.querySelector(".room-pick-name").textContent = area.name;
    button.querySelector(".room-pick-type").textContent = areaTypeLabels[area.type];
    button.querySelector(".room-pick-status").textContent = progress.label;
    button.classList.toggle("active", area.selected);
    button.classList.toggle("is-current", area.id === state.activeInspectionAreaId);
    button.classList.add(`status-${progress.key}`);
    button.classList.add(`room-${area.type}`);
    button.addEventListener("click", () => {
      area.selected = true;
      state.activeInspectionAreaId = area.id;
      saveState({ immediateCloud: true });
      render({});
      setScreen("inspection", { scroll: true });
    });
    els.roomsSelection.appendChild(button);
  });
  els.selectedRoomsCount.textContent = `${selectedAreas().length} חדרים`;
}

function renderAreas() {
  els.areasContainer.innerHTML = "";
  const activeArea = ensureActiveInspectionArea();
  const selected = selectedAreas();
  if (!activeArea) {
    els.areasContainer.innerHTML = `<div class="empty-state">בחר לפחות חדר אחד במסך החדרים כדי להתחיל בדיקה.</div>`;
    return;
  }

  [activeArea].forEach((area) => {
    const node = els.areaTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".area-icon-badge").innerHTML = getAreaIconMarkup(area);
    node.querySelector(".area-title").textContent = area.name;
    node.querySelector(".area-type").textContent = areaTypeLabels[area.type];
    node.querySelector(".area-photo-count").textContent = `תמונות חדר: ${getAreaPhotoCount(area)}`;
    node.classList.add(`area-${area.type}`);
    if (area.locked) node.classList.add("is-locked");

    node.querySelectorAll(".lock-btn").forEach((lockBtn) => {
      lockBtn.textContent = area.locked ? "לחץ לפתיחה לעריכה" : "לחץ לשמירה ונעילה";
      if (area.locked) lockBtn.classList.add("locked");
      lockBtn.addEventListener("click", () => {
        toggleAreaLock(area);
      });
    });

    node.querySelector(".delete-btn").addEventListener("click", () => {
      const confirmed = window.confirm(`למחוק את "${area.name}" מהבדיקה הנוכחית?\n\nהמחיקה תסיר את החדר הזה מהדירה הפעילה ותמחק ממנו את כל המידות, ההערות, התמונות והממצאים שנשמרו בו.`);
      if (!confirmed) return;
      state.areas = state.areas.filter((item) => item.id !== area.id);
      if (state.activeInspectionAreaId === area.id) {
        state.activeInspectionAreaId = null;
      }
      persistAndRender({}, { immediateCloud: true });
    });

    const checksList = node.querySelector(".checks-list");
    area.checks.forEach((check) => {
      const checkNode = els.checkTemplate.content.firstElementChild.cloneNode(true);
      const checkVisual = getCheckVisual(check);
      checkNode.classList.add(checkVisual.tone);
      checkNode.querySelector(".check-icon-badge").innerHTML = checkVisual.icon;
      checkNode.querySelector(".check-title-badge").innerHTML = checkVisual.badgeIcon || checkVisual.icon;
      checkNode.querySelector(".check-name").textContent = check.name;
      checkNode.querySelector(".check-category").textContent = `${check.code} • ${check.category}`;
      const statusSelect = checkNode.querySelector(".status-select");
      const cameraBtn = checkNode.querySelector(".camera-btn");
      const cameraInput = checkNode.querySelector(".camera-input");
      const cameraCount = checkNode.querySelector(".camera-count");
      const noteInput = checkNode.querySelector(".note-input");
      const photoList = checkNode.querySelector(".check-photo-list");
      const checkPhotoCount = getCheckPhotoCount(area, check.code);
      const uploadPending = isPhotoUploadPending(area.id, check.code);
      const cameraAllowed = isCameraAllowedForCheck(area, check);
      const checkPhotos = (Array.isArray(area.photoCaptures) ? area.photoCaptures : [])
        .filter((photo) => photo.checkCode === check.code);
      statusSelect.value = check.status;
      noteInput.value = check.note;
      cameraCount.textContent = `${checkPhotoCount}/${MAX_CHECK_PHOTOS}`;
      applyCameraButtonState(cameraBtn, checkPhotoCount);
      cameraBtn.classList.toggle("is-uploading", uploadPending);
      cameraBtn.classList.toggle("is-disabled", !cameraAllowed);
      applyCheckVisualState(checkNode, check);
      statusSelect.disabled = area.locked;
      noteInput.disabled = area.locked;
      [statusSelect].forEach((select) => bindPickerStability(select));
      if (area.locked) {
        statusSelect.classList.add("field-locked");
        noteInput.classList.add("field-locked");
        cameraBtn.classList.add("field-locked");
      }
      photoList.innerHTML = checkPhotos.length
        ? checkPhotos.map((photo) => {
            const src = photo.downloadURL || photo.previewDataUrl || "";
            const alt = photo.checkName || check.name;
            return src
              ? `<a class="check-photo-thumb" href="${escapeHtml(src)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"></a>`
              : `<div class="check-photo-thumb is-pending">ממתין</div>`;
          }).join("")
        : "";
      cameraInput.disabled = !cameraAllowed;
      statusSelect.addEventListener("change", (event) => {
        check.status = event.target.value;
        applyCheckVisualState(checkNode, check);
        const nextAllowed = isCameraAllowedForCheck(area, check);
        cameraInput.disabled = !nextAllowed;
        cameraBtn.classList.toggle("is-disabled", !nextAllowed);
        refreshProgressAndSummary();
      });
      noteInput.addEventListener("input", (event) => {
        check.note = event.target.value;
        applyCheckVisualState(checkNode, check);
        refreshProgressAndSummary();
      });
      cameraBtn.addEventListener("click", (event) => {
        event.preventDefault();
        if (!isCameraAllowedForCheck(area, check)) return;
        openCameraPicker(cameraInput);
      });
      cameraInput.addEventListener("change", async () => {
        await handleCheckCameraCapture(area, check, cameraInput);
      });
      checksList.appendChild(checkNode);
    });

    els.areasContainer.appendChild(node);

    if (!area.locked && pendingFocusAreaId === area.id) {
      const firstEditableField = node.querySelector(".status-select, .note-input");
      if (firstEditableField) {
        window.setTimeout(() => {
          firstEditableField.focus();
        }, 40);
      }
      pendingFocusAreaId = null;
    }
  });
}

function renderOwnerApartments() {
  if (!els.ownerApartmentsGrid) return;
  els.ownerApartmentsGrid.innerHTML = ownerApartmentLabels.map((apartmentName) => `
    <button class="owner-apartment-card ${apartmentName.startsWith("כניסה-17") ? "owner-apartment-card-17" : "owner-apartment-card-19"}" type="button" data-owner-apartment="${apartmentName}">
      <span class="owner-apartment-icon" aria-hidden="true">${STATUS_ICON_MARKUP.saved}</span>
      <strong>${apartmentName}</strong>
    </button>
  `).join("");

  els.ownerApartmentsGrid.querySelectorAll("[data-owner-apartment]").forEach((button) => {
    button.addEventListener("click", () => openOwnerApartment(button.dataset.ownerApartment));
  });
}

function renderSummaryReports() {
  const summary = computeSummary();
  const issues = getAllIssues();
  if (els.summaryStats) {
    els.summaryStats.innerHTML = "";
  }

  if (!issues.length) {
    els.issueSummary.innerHTML = `<div class="empty-state">עדיין לא סומנו ליקויים. ברגע שתעדכן ממצא כליקוי, הוא יופיע כאן.</div>`;
  } else {
    els.issueSummary.innerHTML = issues.map((issue) => `
      <div class="issue-item">
        <span class="issue-item-icon" aria-hidden="true">${STATUS_ICON_MARKUP.issues}</span>
        <strong>${issue.area} | ${issue.code} | ${issue.name}</strong>
        <div class="issue-meta">${issue.category}</div>
        <div>${issue.note || "לא הוזנה הערה."}</div>
      </div>
    `).join("");
  }

  if (els.reportAreasSummary) {
    els.reportAreasSummary.innerHTML = selectedAreas().map((area) => {
      const total = area.checks.length;
      const issuesCount = area.checks.filter((check) => check.status === "issue").length;
      const done = area.checks.filter((check) => check.status !== "pending").length;
      const progress = getAreaProgress(area);
      return `
        <div class="summary-card area-summary-card area-${area.type}">
          <span class="summary-card-icon area-summary-icon" aria-hidden="true">${getAreaIconMarkup(area)}</span>
          <strong>${area.name}</strong>
          <p>${areaTypeLabels[area.type]} | ${progress.label}</p>
          <p>הושלמו ${done} מתוך ${total} | ליקויים: ${issuesCount}</p>
        </div>
      `;
    }).join("");
  }

  renderReportDocument(summary, issues);
}

function loadState() {
  const projectsRaw = localStorage.getItem(projectsKey);
  const localProjects = projectsRaw ? JSON.parse(projectsRaw) : [];
  state.savedProjects = dedupeProjectRecords(localProjects).dedupedProjects;
  saveProjectsLibrary();
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.currentScreen = "home";
    state.inspectionMode = "new";
    state.areas = buildPresetAreas();
    updateCloudStatus("טוען פרויקטים מהענן...", "warn");
    return;
  }
  const parsed = JSON.parse(raw);
  state.currentScreen = "home";
  state.inspectionMode = parsed.inspectionMode || "new";
  state.currentProjectId = parsed.currentProjectId || null;
  applyProjectData({
    inspectionMode: parsed.inspectionMode || "new",
    propertyName: parsed.propertyName || "",
    propertyAddress: normalizePropertyAddress(parsed.propertyAddress),
    inspectionDate: parsed.inspectionDate || getTodayInputValue(),
    clientName: parsed.clientName || "",
    clientPhone: parsed.clientPhone || "",
    clientEmail: parsed.clientEmail || "",
    inspectorName: parsed.inspectorName || "",
    activeInspectionAreaId: parsed.activeInspectionAreaId || null,
    areas: Array.isArray(parsed.areas) ? parsed.areas : buildPresetAreas()
  });
  updateCloudStatus("טוען פרויקטים מהענן...", "warn");
}

function render(options = {}) {
  const { preserveScroll = true } = options;
  const previousScrollY = preserveScroll ? window.scrollY : 0;
  updateWelcomeTitle();
  updateWelcomeFormMode();
  updateHeader();
  renderSavedProjects();
  renderOwnerApartments();
  renderRoomSelection();
  renderAreas();
  renderSummaryReports();
  applyScreenState(state.currentScreen);
  if (preserveScroll) window.scrollTo(0, previousScrollY);
}

function addArea(name, type) {
  const cleanName = name.trim();
  if (!cleanName) return;
  state.areas.push(createArea(cleanName, type, true));
  if (els.areaName) {
    els.areaName.value = "";
  }
  persistAndRender({}, { immediateCloud: true });
}

els.saveProjectBtn.addEventListener("click", async () => {
  if (await saveCurrentProject()) {
    window.alert("הבדיקה נשמרה ותופיע ברשימת הבדיקות השמורות.");
  }
});

if (els.jumpToSavedProjectsBtn) {
  els.jumpToSavedProjectsBtn.addEventListener("click", () => {
    els.savedProjectsList.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (els.selectNewPropertyBtn) {
  els.selectNewPropertyBtn.addEventListener("click", () => {
    selectInspectionMode("new");
  });
}

if (els.selectOwnerReportBtn) {
  els.selectOwnerReportBtn.addEventListener("click", () => {
    selectInspectionMode("owner");
  });
}

if (els.welcomeNavBtn) {
  els.welcomeNavBtn.addEventListener("click", () => {
    updateProjectFields();
    if (!state.propertyName) {
      window.alert("יש להזין שם נכס לפני מעבר לחדרים.");
      els.propertyName.focus();
      return;
    }
    if (!state.currentProjectId) {
      state.currentProjectId = uid();
    }
    saveState({ immediateCloud: true });
    setScreen("rooms", { scroll: true });
  });
}

if (els.backToHomeFromOwnerBtn) {
  els.backToHomeFromOwnerBtn.addEventListener("click", () => {
    setScreen("home", { scroll: true });
  });
}

if (els.newProjectBtn) {
  els.newProjectBtn.addEventListener("click", () => {
    const hasContent = state.propertyName
      || state.propertyAddress
      || state.clientName
      || state.clientPhone
      || state.clientEmail
      || state.inspectorName
      || selectedAreas().some((area) => area.checks.some((check) => check.status !== "pending" || check.note.trim()));
    if (hasContent) {
      const confirmed = window.confirm("לפתוח בדיקה חדשה? הנתונים הנוכחיים יישארו רק אם שמרת אותם.");
      if (!confirmed) return;
    }
    startNewProject();
  });
}

els.backToWelcomeBtn.addEventListener("click", () => {
  setScreen("welcome", { scroll: true });
});

if (els.addAreaBtn && els.areaName && els.areaType) {
  els.addAreaBtn.addEventListener("click", () => addArea(els.areaName.value, els.areaType.value));
}

[els.propertyName, els.propertyAddress, els.inspectionDate, els.clientName, els.clientPhone, els.clientEmail, els.inspectorName].forEach((input) => {
  input.addEventListener("input", () => {
    updateProjectFields();
    saveState();
    updateHeader();
  });
});

if (els.areaName && els.areaType) {
  els.areaName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addArea(els.areaName.value, els.areaType.value);
  });
}

els.navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.screen === "inspection") {
      syncActiveInspectionArea();
    }
    setScreen(button.dataset.screen, { scroll: true });
  });
});

if (els.resetBtn) {
  els.resetBtn.addEventListener("click", () => {
    const activeArea = ensureActiveInspectionArea();
    if (!activeArea) {
      window.alert("אין חדר פעיל לאיפוס כרגע.");
      return;
    }
    const confirmed = window.confirm(`לאפס את "${activeArea.name}" בלבד? כל המידות, הממצאים והנעילה של החדר הזה יימחקו.`);
    if (!confirmed) return;
    resetArea(activeArea);
    persistAndRender({}, { immediateCloud: true });
  });
}

els.printBtn.addEventListener("click", () => {
  setScreen("summary", { scroll: true });
  buildPrintPages();
  setTimeout(() => window.print(), 80);
});

loadState();
state.currentScreen = "home";
if (!state.areas.length) state.areas = buildPresetAreas();
updateAppVersionLabel();
ensureReportPlaceholders();
render();
subscribeToCloudProjects();

window.addEventListener("pageshow", () => {
  state.currentScreen = "home";
  setScreen("home", { scroll: false });
});

document.addEventListener("focusout", () => {
  schedulePendingCloudSyncFlush();
});

window.addEventListener("beforeprint", () => {
  buildPrintPages();
});

