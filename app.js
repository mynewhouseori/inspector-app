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

const baseChecks = {
  structureEnvelope: [
    { code: "1.1.1", name: "בדיקת סדקים", category: "שלד ומעטפת" },
    { code: "1.1.5", name: "איטומים", category: "שלד ומעטפת" },
    { code: "1.1.6", name: "איתור סימני חדירת מים", category: "שלד ומעטפת" }
  ],
  interiorFinishes: [
    { code: "2.1.1", name: "בדיקות ריצוף (שיפועים, חללים, הפרשי גובה)", category: "גמר פנים" },
    { code: "2.1.2", name: "צבע", category: "גמר פנים" },
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
    { code: "4.1.1", name: "בדיקת לחץ מים", category: "אינסטלציה וניקוז" },
    { code: "4.1.2", name: "נזילות", category: "אינסטלציה וניקוז" },
    { code: "4.1.3", name: "שיפועים", category: "אינסטלציה וניקוז" },
    { code: "4.1.4", name: "ניקוזים ותפקוד מערכות", category: "אינסטלציה וניקוז" }
  ],
  electricityCommunication: [
    { code: "5.1.1", name: "שקעים", category: "חשמל ותקשורת" },
    { code: "5.1.2", name: "מפסקים", category: "חשמל ותקשורת" },
    { code: "5.1.3", name: "נקודות תאורה", category: "חשמל ותקשורת" },
    { code: "5.1.4", name: "התאמה לתוכניות", category: "חשמל ותקשורת" }
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
    { code: "7.1.1", name: "איתור ליקויים בטיחותיים", category: "בטיחות ותקנות" },
    { code: "7.1.2", name: "מעקות", category: "בטיחות ותקנות" },
    { code: "7.1.4", name: "הפרשי מפלסים ומפגעים", category: "בטיחות ותקנות" }
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

const removedCheckCodes = new Set(["1.1.2", "1.1.3", "1.1.4", "3.1.5", "7.1.3"]);
const SETTINGS = window.APP_CONFIG || window.DEFAULT_APP_CONFIG || {};
const hasFirebaseConfig = Boolean(SETTINGS?.firebase?.apiKey);
const firebaseApp = hasFirebaseConfig ? initializeApp(SETTINGS.firebase) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
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
  owner: "תסקיר דירת בעלים"
};

const state = {
  currentScreen: "home",
  inspectionMode: "new",
  propertyName: "",
  propertyAddress: "",
  clientName: "",
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
  propertyName: document.querySelector("#propertyName"),
  propertyAddress: document.querySelector("#propertyAddress"),
  clientName: document.querySelector("#clientName"),
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
  reportOverview: document.querySelector("#reportOverview"),
  reportExecutiveSummary: document.querySelector("#reportExecutiveSummary"),
  reportSummaryStats: document.querySelector("#reportSummaryStats"),
  reportCriticalFindings: document.querySelector("#reportCriticalFindings"),
  reportAreaDetails: document.querySelector("#reportAreaDetails"),
  reportClosingNote: document.querySelector("#reportClosingNote"),
  reportTitle: document.querySelector("#reportTitle"),
  reportMeta: document.querySelector("#reportMeta")
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
    return existing ? { ...check, ...existing, id: existing.id || check.id } : check;
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
    dimensions: area.dimensions || createDimensions()
  };
}

function applyProjectData(projectData) {
  state.inspectionMode = projectData.inspectionMode || state.inspectionMode || "new";
  state.propertyName = projectData.propertyName || "";
  state.propertyAddress = projectData.propertyAddress || "";
  state.clientName = projectData.clientName || "";
  state.inspectorName = projectData.inspectorName || "";
  state.activeInspectionAreaId = projectData.activeInspectionAreaId || null;
  state.areas = Array.isArray(projectData.areas) ? projectData.areas.map((area) => hydrateArea(area)) : buildPresetAreas();
  if (!state.areas.length) state.areas = buildPresetAreas();
  els.propertyName.value = state.propertyName;
  els.propertyAddress.value = state.propertyAddress;
  els.clientName.value = state.clientName;
  els.inspectorName.value = state.inspectorName;
}

function updateWelcomeTitle() {
  if (!els.welcomeTitle) return;
  els.welcomeTitle.textContent = inspectionModeLabels[state.inspectionMode] || inspectionModeLabels.new;
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
    dimensions: createDimensions()
  };
}

function resetArea(area) {
  area.locked = false;
  area.checks = defaultChecks(area.type, area.name);
  area.dimensions = createDimensions();
}

function toggleAreaLock(area) {
  const shouldFocusAfterUnlock = area.locked === true;
  area.locked = !area.locked;
  pendingFocusAreaId = shouldFocusAfterUnlock && !area.locked ? area.id : null;
  persistAndRender({}, { immediateCloud: true });
}

function buildPresetAreas() {
  return defaultAreaPreset.map((name) => createArea(name, inferAreaType(name), true));
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

function getDimensionStatus(area) {
  const dims = area.dimensions || createDimensions();
  const widthStatus = classifyDelta(normalizeNumber(dims.planWidth), normalizeNumber(dims.actualWidth));
  const lengthStatus = classifyDelta(normalizeNumber(dims.planLength), normalizeNumber(dims.actualLength));
  if (widthStatus === "empty" || lengthStatus === "empty") return { label: "ממתין להזנה", badgeClass: "", widthStatus, lengthStatus };
  if (widthStatus === "issue" || lengthStatus === "issue") return { label: "פער במידות", badgeClass: "status-issue", widthStatus, lengthStatus };
  if (widthStatus === "warn" || lengthStatus === "warn") return { label: "סטייה קלה במידות", badgeClass: "status-warn", widthStatus, lengthStatus };
  return { label: "תואם לתכנית", badgeClass: "status-ok", widthStatus, lengthStatus };
}

function getAreaProgress(area) {
  if (area.locked) return { key: "locked", label: "הושלם וננעל" };
  const total = area.checks.length;
  const touchedChecks = area.checks.filter((check) => check.status !== "pending" || check.note.trim()).length;
  const touchedDimensions = Object.values(area.dimensions || {}).filter(Boolean).length;
  const touched = touchedChecks + touchedDimensions;
  if (touched === 0) return { key: "pending", label: "לא התחיל" };
  if (touchedChecks >= total && total > 0) return { key: "complete", label: "הושלם" };
  return { key: "progress", label: "בבדיקה" };
}

function applyDimensionStateToCard(cardNode, area) {
  const dimensionState = getDimensionStatus(area);
  const badge = cardNode.querySelector(".dimension-badge");
  badge.textContent = dimensionState.label;
  badge.classList.remove("status-ok", "status-warn", "status-issue");
  if (dimensionState.badgeClass) {
    badge.classList.add(dimensionState.badgeClass);
  }

  cardNode.querySelectorAll(".dimension-input").forEach((input) => {
    input.classList.remove("match-ok", "match-warn", "match-issue");
    const field = input.dataset.dimensionField;
    const group = input.dataset.dimensionGroup;
    const pairStatus = field === "width" ? dimensionState.widthStatus : dimensionState.lengthStatus;
    if (group === "actual") {
      if (pairStatus === "ok") input.classList.add("match-ok");
      if (pairStatus === "warn") input.classList.add("match-warn");
      if (pairStatus === "issue") input.classList.add("match-issue");
    }
  });
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

function hasDimensionInput(area) {
  return Object.values(area.dimensions || {}).some(Boolean);
}

function isAreaInspected(area) {
  return getTouchedChecksCount(area) > 0 || hasDimensionInput(area) || area.locked;
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
  return new Date().toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function formatGeneratedDateOnly() {
  return new Date().toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
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

  const coverMetaItems = [
    state.clientName && `לקוח: ${state.clientName}`,
    state.inspectorName && `בודק: ${state.inspectorName}`,
    state.propertyAddress && `מיקום: ${state.propertyAddress}`,
    `תאריך הפקה: ${formatGeneratedAt()}`
  ].filter(Boolean);
  els.reportCoverMeta.innerHTML = coverMetaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  const overviewItems = [
    ["סטטוס", reportStatus],
    ["בודק", state.inspectorName || "לא הוזן"],
    ["לקוח", state.clientName || "לא הוזן"],
    ["אזורים", `${reportSummary.inspectedAreas} נבדקו${reportSummary.notStartedAreas ? `, ${reportSummary.notStartedAreas} לא נכללו` : ""}`]
  ];

  els.reportOverview.innerHTML = overviewItems.map(([label, value]) => `
    <div class="report-overview-item">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `).join("");

  if (els.reportExecutiveSummary) {
    els.reportExecutiveSummary.innerHTML = `<p>${escapeHtml(buildExecutiveSummary(reportSummary))}</p>`;
  }

  const statItems = [
    ["אזורים שנבדקו", reportSummary.inspectedAreas],
    ["סעיפים שנבדקו", reportSummary.completedChecks],
    ["תקין", reportSummary.ok],
    ["ליקויים", reportSummary.issues],
    ["השלמה", `${reportSummary.completionRate}%`]
  ];

  els.reportSummaryStats.innerHTML = statItems.map(([label, value]) => `
    <div class="report-stat-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join("");

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

  const areaCards = reportAreas.map((area) => {
    const total = area.checks.length;
    const issuesInArea = area.checks.filter((check) => check.status === "issue");
    const okCount = area.checks.filter((check) => check.status === "ok").length;
    const pendingCount = area.checks.filter((check) => check.status === "pending").length;
    const dimensionStatus = getDimensionStatus(area);
    const progress = getAreaProgress(area);
    const dims = area.dimensions || createDimensions();
    const completion = computeAreaCompletion(area);
    const areaIssuesMarkup = issuesInArea.length
      ? issuesInArea.map((check) => `
          <div class="report-check-item">
            <strong>${escapeHtml(check.name)}</strong>
            <div class="report-check-meta">${escapeHtml(check.category)}</div>
            <p class="report-check-note"><strong>ממצא:</strong> ${escapeHtml(check.note || "נדרש פירוט נוסף מצד הבודק.")}</p>
            <p class="report-check-note"><strong>המלצה:</strong> ${escapeHtml(buildIssueRecommendation({
              category: check.category,
              note: check.note.trim(),
              name: check.name
            }))}</p>
          </div>
        `).join("")
      : `<div class="report-empty">לא זוהו ליקויים באזור זה.</div>`;

    return `
      <article class="report-area-card">
        <div class="report-area-head">
          <div>
            <strong>${escapeHtml(area.name)}</strong>
            <div class="report-area-meta">${escapeHtml(areaTypeLabels[area.type])} | ${escapeHtml(total)} סעיפי בדיקה | ${escapeHtml(progress.label)}</div>
          </div>
          <span class="report-area-status">${escapeHtml(completion)}% הושלם</span>
        </div>
        <div class="report-area-dimensions">
          <strong>נתוני שטח</strong>
          <div class="report-dimensions-row">
            <span>תכנית רוחב: ${escapeHtml(formatDimensionValue(dims.planWidth) || "-")}</span>
            <span>תכנית אורך: ${escapeHtml(formatDimensionValue(dims.planLength) || "-")}</span>
            <span>בפועל רוחב: ${escapeHtml(formatDimensionValue(dims.actualWidth) || "-")}</span>
            <span>בפועל אורך: ${escapeHtml(formatDimensionValue(dims.actualLength) || "-")}</span>
          </div>
        </div>
        <div class="report-area-meta">סטטוס מידות: ${escapeHtml(dimensionStatus.label)} | תקין: ${escapeHtml(okCount)} | ליקויים: ${escapeHtml(issuesInArea.length)} | ממתין: ${escapeHtml(pendingCount)}</div>
        <div class="report-area-checks">${areaIssuesMarkup}</div>
      </article>
    `;
  });

  els.reportAreaDetails.innerHTML = areaCards.length
    ? areaCards.join("")
    : `<div class="report-empty">אין אזורים עם נתוני בדיקה להצגה במסמך זה.</div>`;

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
        <img class="print-page-logo" src="assets/logo01.jpeg" alt="לוגו Inspector">
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

function createPrintableBlocks() {
  const blocks = [];
  const cover = els.reportDocument.querySelector(".report-cover");
  if (cover) {
    blocks.push(cover.cloneNode(true));
  }

  const sections = [...els.reportDocument.querySelectorAll(".report-section")];
  sections.forEach((section) => {
    const title = section.querySelector("h3");
    const contentNodes = [...section.children].filter((child) => child !== title);
    const splitContainer = contentNodes.find((node) =>
      node.classList?.contains("report-summary-stats")
      || node.classList?.contains("report-findings")
      || node.classList?.contains("report-area-details")
    );

    if (!splitContainer) {
      blocks.push(section.cloneNode(true));
      return;
    }

    const unitNodes = [...splitContainer.children];
    if (!unitNodes.length) {
      blocks.push(section.cloneNode(true));
      return;
    }

    unitNodes.forEach((unit, index) => {
      const sectionFragment = document.createElement("section");
      sectionFragment.className = section.className;
      if (title && index === 0) {
        sectionFragment.appendChild(title.cloneNode(true));
      } else if (title) {
        const continuedTitle = title.cloneNode(true);
        continuedTitle.textContent = `${title.textContent} (המשך)`;
        sectionFragment.appendChild(continuedTitle);
      }
      const wrapper = document.createElement("div");
      wrapper.className = splitContainer.className;
      wrapper.appendChild(unit.cloneNode(true));
      sectionFragment.appendChild(wrapper);
      blocks.push(sectionFragment);
    });
  });

  return blocks;
}

function buildPrintPages() {
  if (!els.printPages || !els.reportDocument) return;
  els.printPages.innerHTML = "";

  const sandbox = document.createElement("div");
  sandbox.className = "print-measure-sandbox";
  document.body.appendChild(sandbox);

  const measurementPage = createPrintPage(1);
  sandbox.appendChild(measurementPage);
  const measurementBody = measurementPage.querySelector(".print-page-body");
  const safetyBuffer = 32;
  const maxHeight = (measurementBody.clientHeight || 980) - safetyBuffer;

  const blocks = createPrintableBlocks();
  let pageNumber = 1;
  let currentPage = createPrintPage(pageNumber);
  let currentBody = currentPage.querySelector(".print-page-body");
  sandbox.innerHTML = "";
  sandbox.appendChild(currentPage);

  const finalizedPages = [];

  blocks.forEach((block) => {
    const candidate = block.cloneNode(true);
    currentBody.appendChild(candidate);
    if (currentBody.scrollHeight > maxHeight && currentBody.children.length > 1) {
      currentBody.removeChild(candidate);
      finalizedPages.push(currentPage.cloneNode(true));
      pageNumber += 1;
      currentPage = createPrintPage(pageNumber);
      currentBody = currentPage.querySelector(".print-page-body");
      sandbox.innerHTML = "";
      sandbox.appendChild(currentPage);
      currentBody.appendChild(candidate);
    }
  });

  finalizedPages.push(currentPage.cloneNode(true));
  document.body.removeChild(sandbox);

  els.printPages.innerHTML = "";
  finalizedPages.forEach((page) => {
    els.printPages.appendChild(page);
  });
}

function updateProjectFields() {
  state.propertyName = els.propertyName.value.trim();
  state.propertyAddress = els.propertyAddress.value.trim();
  state.clientName = els.clientName.value.trim();
  state.inspectorName = els.inspectorName.value.trim();
}

function getProjectTitle(project = state) {
  return project.propertyName || "בדיקת דירה ללא שם נכס";
}

function projectDataSignature(projectData = {}) {
  const normalized = {
    inspectionMode: projectData.inspectionMode || "new",
    propertyName: projectData.propertyName || "",
    propertyAddress: projectData.propertyAddress || "",
    clientName: projectData.clientName || "",
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
    propertyAddress: state.propertyAddress,
    clientName: state.clientName,
    inspectorName: state.inspectorName,
    activeInspectionAreaId: state.activeInspectionAreaId,
    areas: JSON.parse(JSON.stringify(state.areas))
  };
}

function saveProjectsLibrary() {
  localStorage.setItem(projectsKey, JSON.stringify(state.savedProjects));
}

function upsertSavedProjectRecord(record) {
  const existingIndex = state.savedProjects.findIndex((project) => project.id === record.id);
  if (existingIndex >= 0) {
    state.savedProjects[existingIndex] = record;
  } else {
    state.savedProjects.unshift(record);
  }
  state.savedProjects.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
}

function buildProjectRecord(projectId = state.currentProjectId || uid()) {
  const now = new Date();
  return {
    id: projectId,
    title: getProjectTitle(),
    propertyName: state.propertyName,
    propertyAddress: state.propertyAddress,
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

function normalizeProjectRecord(project) {
  if (!project || !project.id || !project.data) return null;
  return {
    ...project,
    title: project.data.propertyName || project.title || "בדיקת דירה ללא שם נכס",
    propertyAddress: project.data.propertyAddress || project.propertyAddress || "",
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
    (snapshot) => {
      const projects = snapshot.docs
        .map((item) => normalizeProjectRecord({ id: item.id, ...item.data() }))
        .filter(Boolean)
        .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
      state.savedProjects = projects;
      saveProjectsLibrary();
      renderSavedProjects();
      updateCloudStatus("סנכרון ענן פעיל. אותם פרויקטים זמינים במחשב ובנייד.", "ok");

      const activeProject = state.currentProjectId ? projects.find((project) => project.id === state.currentProjectId) : null;
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

  const id = state.currentProjectId || uid();
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
  const targetScreen = selectedAreas().length ? "inspection" : "rooms";
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

  state.savedProjects = state.savedProjects.filter((item) => item.id !== projectId);
  if (state.currentProjectId === projectId) {
    state.currentProjectId = null;
  }
  saveProjectsLibrary();
  saveState();
  if (db) {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
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
  state.propertyAddress = "";
  state.clientName = "";
  state.inspectorName = "";
  state.activeInspectionAreaId = null;
  state.areas = buildPresetAreas();
  els.propertyName.value = "";
  els.propertyAddress.value = "";
  els.clientName.value = "";
  els.inspectorName.value = "";
  render({ preserveScroll: false });
  setScreen("welcome", { scroll: true });
}

function selectInspectionMode(mode) {
  state.inspectionMode = mode === "owner" ? "owner" : "new";
  updateWelcomeTitle();
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
    return `
      <article class="saved-project" data-project-id="${project.id}">
        <div class="saved-project-head">
          <div>
            <p class="saved-project-title">${propertyName}</p>
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
  const defaultReportTitle = state.inspectionMode === "owner" ? "תסקיר דירת בעלים" : "דוח בדיקה הנדסית";
  els.reportTitle.textContent = state.propertyName || defaultReportTitle;
  const parts = [
    state.propertyAddress && `כתובת: ${state.propertyAddress}`,
    state.clientName && `לקוח: ${state.clientName}`,
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
  state.areas.forEach((area) => {
    const button = els.roomChipTemplate.content.firstElementChild.cloneNode(true);
    const progress = getAreaProgress(area);
    button.querySelector(".room-pick-name").textContent = area.name;
    button.querySelector(".room-pick-type").textContent = areaTypeLabels[area.type];
    button.querySelector(".room-pick-status").textContent = progress.label;
    button.classList.toggle("active", area.selected);
    button.classList.toggle("is-current", area.id === state.activeInspectionAreaId);
    button.classList.add(`status-${progress.key}`);
    button.addEventListener("click", () => {
      area.selected = true;
      state.activeInspectionAreaId = area.id;
      persistAndRender({}, { immediateCloud: true });
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
    node.querySelector(".area-title").textContent = area.name;
    node.querySelector(".area-type").textContent = areaTypeLabels[area.type];
    if (area.locked) node.classList.add("is-locked");

    node.querySelectorAll(".lock-btn").forEach((lockBtn) => {
      lockBtn.textContent = area.locked ? "לחץ לפתיחה לעריכה" : "לחץ לשמירה ונעילה";
      if (area.locked) lockBtn.classList.add("locked");
      lockBtn.addEventListener("click", () => {
        toggleAreaLock(area);
      });
    });

    node.querySelectorAll(".dimension-input").forEach((input) => {
      const group = input.dataset.dimensionGroup;
      const field = input.dataset.dimensionField;
      const key = group === "plan" ? (field === "width" ? "planWidth" : "planLength") : (field === "width" ? "actualWidth" : "actualLength");
      input.value = formatDimensionValue(area.dimensions[key]);
      input.disabled = area.locked;
      if (area.locked) input.classList.add("field-locked");
      input.addEventListener("input", (event) => {
        area.dimensions[key] = event.target.value.replace(",", ".");
        applyDimensionStateToCard(node, area);
        refreshProgressAndSummary();
      });
      input.addEventListener("blur", (event) => {
        area.dimensions[key] = formatDimensionValue(event.target.value);
        event.target.value = area.dimensions[key];
        applyDimensionStateToCard(node, area);
        refreshProgressAndSummary();
      });
    });
    applyDimensionStateToCard(node, area);

    node.querySelector(".delete-btn").addEventListener("click", () => {
      const confirmed = window.confirm(`למחוק את "${area.name}" מהבדיקה?`);
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
      checkNode.querySelector(".check-name").textContent = check.name;
      checkNode.querySelector(".check-category").textContent = `${check.code} • ${check.category}`;
      const statusSelect = checkNode.querySelector(".status-select");
      const noteInput = checkNode.querySelector(".note-input");
      statusSelect.value = check.status;
      noteInput.value = check.note;
      applyCheckVisualState(checkNode, check);
      statusSelect.disabled = area.locked;
      noteInput.disabled = area.locked;
      [statusSelect].forEach((select) => bindPickerStability(select));
      if (area.locked) {
        statusSelect.classList.add("field-locked");
        noteInput.classList.add("field-locked");
      }
      statusSelect.addEventListener("change", (event) => {
        check.status = event.target.value;
        applyCheckVisualState(checkNode, check);
        refreshProgressAndSummary();
      });
      noteInput.addEventListener("input", (event) => {
        check.note = event.target.value;
        applyCheckVisualState(checkNode, check);
        refreshProgressAndSummary();
      });
      checksList.appendChild(checkNode);
    });

    els.areasContainer.appendChild(node);

    if (!area.locked && pendingFocusAreaId === area.id) {
      const firstEditableField = node.querySelector(".dimension-input, .status-select, .note-input");
      if (firstEditableField) {
        window.setTimeout(() => {
          firstEditableField.focus();
        }, 40);
      }
      pendingFocusAreaId = null;
    }
  });
}

function renderSummaryReports() {
  const summary = computeSummary();
  const issues = getAllIssues();
  const stats = [
    { label: "אזורים", value: summary.totalAreas },
    { label: "בדיקות", value: summary.totalChecks },
    { label: "תקין", value: summary.ok },
    { label: "ליקויים", value: summary.issues },
    { label: "לבדיקה", value: summary.pending },
    { label: "ליקוי גבוה", value: summary.highIssues }
  ];
  els.summaryStats.innerHTML = stats.map((item) => `<div class="summary-card"><p>${item.label}</p><strong>${item.value}</strong></div>`).join("");

  if (!issues.length) {
    els.issueSummary.innerHTML = `<div class="empty-state">עדיין לא סומנו ליקויים. ברגע שתעדכן ממצא כליקוי, הוא יופיע כאן.</div>`;
  } else {
    els.issueSummary.innerHTML = issues.map((issue) => `
      <div class="issue-item">
        <strong>${issue.area} • ${issue.code} • ${issue.name}</strong>
        <div class="issue-meta">${issue.category}</div>
        <div>${issue.note || "לא הוזנה הערה."}</div>
      </div>
    `).join("");
  }

  els.reportAreasSummary.innerHTML = selectedAreas().map((area) => {
    const total = area.checks.length;
    const issuesCount = area.checks.filter((check) => check.status === "issue").length;
    const done = area.checks.filter((check) => check.status !== "pending").length;
    const dims = getDimensionStatus(area);
    const progress = getAreaProgress(area);
    return `
      <div class="summary-card">
        <strong>${area.name}</strong>
        <p>${areaTypeLabels[area.type]} | ${progress.label}</p>
        <p>הושלמו ${done} מתוך ${total} | ליקויים: ${issuesCount} | מצב מידות: ${dims.label}</p>
      </div>
    `;
  }).join("");

  renderReportDocument(summary, issues);
}

function loadState() {
  const projectsRaw = localStorage.getItem(projectsKey);
  state.savedProjects = projectsRaw ? JSON.parse(projectsRaw) : [];
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.currentScreen = "home";
    state.inspectionMode = "new";
    state.areas = buildPresetAreas();
    updateCloudStatus("טוען פרויקטים מהענן...", "warn");
    return;
  }
  const parsed = JSON.parse(raw);
  state.currentScreen = parsed.currentScreen || "home";
  state.inspectionMode = parsed.inspectionMode || "new";
  state.currentProjectId = parsed.currentProjectId || null;
  applyProjectData({
    inspectionMode: parsed.inspectionMode || "new",
    propertyName: parsed.propertyName || "",
    propertyAddress: parsed.propertyAddress || "",
    clientName: parsed.clientName || "",
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
  updateHeader();
  renderSavedProjects();
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
  els.areaName.value = "";
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

els.newProjectBtn.addEventListener("click", () => {
  const hasContent = state.propertyName || state.propertyAddress || state.clientName || state.inspectorName || selectedAreas().some((area) => area.checks.some((check) => check.status !== "pending" || check.note.trim()));
  if (hasContent) {
    const confirmed = window.confirm("לפתוח בדיקה חדשה? הנתונים הנוכחיים יישארו רק אם שמרת אותם.");
    if (!confirmed) return;
  }
  startNewProject();
});

els.backToWelcomeBtn.addEventListener("click", () => {
  setScreen("welcome", { scroll: true });
});

els.addAreaBtn.addEventListener("click", () => addArea(els.areaName.value, els.areaType.value));

[els.propertyName, els.propertyAddress, els.clientName, els.inspectorName].forEach((input) => {
  input.addEventListener("input", () => {
    updateProjectFields();
    saveState();
    updateHeader();
  });
});

els.areaName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addArea(els.areaName.value, els.areaType.value);
});

els.navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.screen === "inspection") {
      syncActiveInspectionArea();
    }
    setScreen(button.dataset.screen, { scroll: true });
  });
});

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

els.printBtn.addEventListener("click", () => {
  setScreen("summary", { scroll: true });
  buildPrintPages();
  setTimeout(() => window.print(), 80);
});

loadState();
state.currentScreen = state.currentScreen || "home";
if (!state.areas.length) state.areas = buildPresetAreas();
render();
subscribeToCloudProjects();

window.addEventListener("pageshow", () => {
  state.currentScreen = state.currentScreen || "home";
  setScreen(state.currentScreen, { scroll: false });
});

document.addEventListener("focusout", () => {
  schedulePendingCloudSyncFlush();
});

window.addEventListener("beforeprint", () => {
  buildPrintPages();
});
