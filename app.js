const baseChecks = {
  structureEnvelope: [
    { code: "1.1.1", name: "בדיקת סדקים", category: "שלד ומעטפת" },
    { code: "1.1.2", name: "סטיות", category: "שלד ומעטפת" },
    { code: "1.1.3", name: "טיח", category: "שלד ומעטפת" },
    { code: "1.1.4", name: "חיפויי חוץ", category: "שלד ומעטפת" },
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
    { code: "3.1.1", name: "בדיקת חלונות", category: "פתחים ודלתות" },
    { code: "3.1.2", name: "דלתות", category: "פתחים ודלתות" },
    { code: "3.1.3", name: "אלומיניום", category: "פתחים ודלתות" },
    { code: "3.1.4", name: "איטומים", category: "פתחים ודלתות" },
    { code: "3.1.5", name: "מנגנונים ותפקוד כללי", category: "פתחים ודלתות" }
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
    { code: "7.1.3", name: "זכוכיות", category: "בטיחות ותקנות" },
    { code: "7.1.4", name: "הפרשי מפלסים ומפגעים", category: "בטיחות ותקנות" }
  ]
};

const checkSets = {
  dry: [
    ...baseChecks.structureEnvelope.filter((check) => check.code !== "1.1.5"),
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
    ...baseChecks.openingsDoors,
    ...baseChecks.electricityCommunication,
    ...baseChecks.safetyRegulations.filter((check) => check.code !== "7.1.2")
  ],
  wet: [
    ...baseChecks.structureEnvelope.filter((check) => check.code !== "1.1.4"),
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
    ...baseChecks.wetRoomFinishes,
    ...baseChecks.openingsDoors,
    ...baseChecks.plumbingDrainage,
    ...baseChecks.electricityCommunication,
    ...baseChecks.safetyRegulations
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

const severityLabels = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה"
};

const state = {
  currentScreen: "welcome",
  propertyName: "",
  propertyAddress: "",
  clientName: "",
  inspectorName: "",
  activeInspectionAreaId: null,
  areas: []
};

const storageKey = "inspector-mobile-state-v2";

const els = {
  propertyName: document.querySelector("#propertyName"),
  propertyAddress: document.querySelector("#propertyAddress"),
  clientName: document.querySelector("#clientName"),
  inspectorName: document.querySelector("#inspectorName"),
  startBtn: document.querySelector("#startBtn"),
  backToWelcomeBtn: document.querySelector("#backToWelcomeBtn"),
  continueToInspectionBtn: document.querySelector("#continueToInspectionBtn"),
  areaName: document.querySelector("#areaName"),
  areaType: document.querySelector("#areaType"),
  addAreaBtn: document.querySelector("#addAreaBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  printBtn: document.querySelector("#printBtn"),
  prevAreaBtn: document.querySelector("#prevAreaBtn"),
  nextAreaBtn: document.querySelector("#nextAreaBtn"),
  currentAreaIndicator: document.querySelector("#currentAreaIndicator"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  screens: [...document.querySelectorAll(".screen")],
  roomsSelection: document.querySelector("#roomsSelection"),
  roomChipTemplate: document.querySelector("#roomChipTemplate"),
  selectedRoomsCount: document.querySelector("#selectedRoomsCount"),
  areasContainer: document.querySelector("#areasContainer"),
  areaTemplate: document.querySelector("#areaTemplate"),
  checkTemplate: document.querySelector("#checkTemplate"),
  summaryStats: document.querySelector("#summaryStats"),
  issueSummary: document.querySelector("#issueSummary"),
  reportAreasSummary: document.querySelector("#reportAreasSummary"),
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
  if (widthStatus === "issue" || lengthStatus === "issue") return { label: "פער חריג במידות", badgeClass: "status-issue", widthStatus, lengthStatus };
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
    highIssues: issueChecks.filter((check) => check.severity === "high").length
  };
}

function updateProjectFields() {
  state.propertyName = els.propertyName.value.trim();
  state.propertyAddress = els.propertyAddress.value.trim();
  state.clientName = els.clientName.value.trim();
  state.inspectorName = els.inspectorName.value.trim();
}

function updateHeader() {
  updateProjectFields();
  els.reportTitle.textContent = state.propertyName || "דוח בדיקה הנדסית";
  const parts = [
    state.propertyAddress && `כתובת: ${state.propertyAddress}`,
    state.clientName && `לקוח: ${state.clientName}`,
    state.inspectorName && `בודק: ${state.inspectorName}`
  ].filter(Boolean);
  els.reportMeta.textContent = parts.length ? parts.join(" | ") : "בחר חדרים ומלא את הבדיקות בשטח.";
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setScreen(screen, options = {}) {
  const { scroll = true } = options;
  state.currentScreen = screen;
  els.screens.forEach((section) => section.classList.toggle("active", section.id === `screen-${screen}`));
  els.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.screen === screen));
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
    button.classList.add(`status-${progress.key}`);
    button.addEventListener("click", () => {
      area.selected = !area.selected;
      if (area.selected) {
        state.activeInspectionAreaId = area.id;
      } else if (state.activeInspectionAreaId === area.id) {
        setActiveInspectionAreaToFirstSelected();
      }
      render();
    });
    els.roomsSelection.appendChild(button);
  });
  els.selectedRoomsCount.textContent = `${selectedAreas().length} חדרים`;
}

function renderAreas() {
  els.areasContainer.innerHTML = "";
  const activeArea = ensureActiveInspectionArea();
  const selected = selectedAreas();
  const activeIndex = activeArea ? selected.findIndex((area) => area.id === activeArea.id) : -1;
  els.currentAreaIndicator.textContent = activeArea ? `${activeIndex + 1} / ${selected.length}` : "0 / 0";
  els.prevAreaBtn.disabled = activeIndex <= 0;
  els.nextAreaBtn.disabled = activeIndex === -1 || activeIndex >= selected.length - 1;
  if (!activeArea) {
    els.areasContainer.innerHTML = `<div class="empty-state">בחר לפחות חדר אחד במסך החדרים כדי להתחיל בדיקה.</div>`;
    return;
  }

  [activeArea].forEach((area) => {
    const node = els.areaTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".area-title").textContent = area.name;
    node.querySelector(".area-type").textContent = areaTypeLabels[area.type];
    if (area.locked) node.classList.add("is-locked");

    const lockBtn = node.querySelector(".lock-btn");
    lockBtn.textContent = area.locked ? "פתח לעריכה" : "סיום ונעילה";
    if (area.locked) lockBtn.classList.add("locked");
    lockBtn.addEventListener("click", () => {
      area.locked = !area.locked;
      render();
    });

    node.querySelectorAll(".dimension-input").forEach((input) => {
      const group = input.dataset.dimensionGroup;
      const field = input.dataset.dimensionField;
      const key = group === "plan" ? (field === "width" ? "planWidth" : "planLength") : (field === "width" ? "actualWidth" : "actualLength");
      input.value = area.dimensions[key];
      input.disabled = area.locked;
      if (area.locked) input.classList.add("field-locked");
      input.addEventListener("input", (event) => {
        area.dimensions[key] = event.target.value.replace(",", ".");
        applyDimensionStateToCard(node, area);
        refreshProgressAndSummary();
      });
    });
    applyDimensionStateToCard(node, area);

    node.querySelector(".delete-btn").addEventListener("click", () => {
      state.areas = state.areas.filter((item) => item.id !== area.id);
      render();
    });

    const checksList = node.querySelector(".checks-list");
    area.checks.forEach((check) => {
      const checkNode = els.checkTemplate.content.firstElementChild.cloneNode(true);
      checkNode.querySelector(".check-name").textContent = check.name;
      checkNode.querySelector(".check-category").textContent = `${check.code} • ${check.category}`;
      const statusSelect = checkNode.querySelector(".status-select");
      const severitySelect = checkNode.querySelector(".severity-select");
      const noteInput = checkNode.querySelector(".note-input");
      statusSelect.value = check.status;
      severitySelect.value = check.severity;
      noteInput.value = check.note;
      statusSelect.disabled = area.locked;
      severitySelect.disabled = area.locked;
      noteInput.disabled = area.locked;
      if (area.locked) {
        statusSelect.classList.add("field-locked");
        severitySelect.classList.add("field-locked");
        noteInput.classList.add("field-locked");
      }
      statusSelect.addEventListener("change", (event) => {
        check.status = event.target.value;
        refreshProgressAndSummary();
      });
      severitySelect.addEventListener("change", (event) => {
        check.severity = event.target.value;
        refreshProgressAndSummary();
      });
      noteInput.addEventListener("input", (event) => {
        check.note = event.target.value;
        refreshProgressAndSummary();
      });
      checksList.appendChild(checkNode);
    });

    els.areasContainer.appendChild(node);
  });
}

function renderSummaryReports() {
  const summary = computeSummary();
  const stats = [
    { label: "אזורים", value: summary.totalAreas },
    { label: "בדיקות", value: summary.totalChecks },
    { label: "תקין", value: summary.ok },
    { label: "ליקויים", value: summary.issues },
    { label: "לבדיקה", value: summary.pending },
    { label: "ליקוי גבוה", value: summary.highIssues }
  ];
  els.summaryStats.innerHTML = stats.map((item) => `<div class="summary-card"><p>${item.label}</p><strong>${item.value}</strong></div>`).join("");

  const issues = selectedAreas().flatMap((area) =>
    area.checks.filter((check) => check.status === "issue").map((check) => ({
      area: area.name,
      code: check.code,
      category: check.category,
      name: check.name,
      severity: check.severity,
      note: check.note
    }))
  );
  if (!issues.length) {
    els.issueSummary.innerHTML = `<div class="empty-state">עדיין לא סומנו ליקויים. ברגע שתעדכן ממצא כליקוי, הוא יופיע כאן.</div>`;
  } else {
    const order = { high: 0, medium: 1, low: 2 };
    els.issueSummary.innerHTML = issues.sort((a, b) => order[a.severity] - order[b.severity]).map((issue) => `
      <div class="issue-item">
        <strong>${issue.area} • ${issue.code} • ${issue.name}</strong>
        <div class="issue-meta">${issue.category} | חומרה: ${severityLabels[issue.severity]}</div>
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
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.currentScreen = "welcome";
    state.areas = buildPresetAreas();
    return;
  }
  const parsed = JSON.parse(raw);
  state.currentScreen = "welcome";
  state.activeInspectionAreaId = parsed.activeInspectionAreaId || null;
  state.propertyName = parsed.propertyName || "";
  state.propertyAddress = parsed.propertyAddress || "";
  state.clientName = parsed.clientName || "";
  state.inspectorName = parsed.inspectorName || "";
  state.areas = Array.isArray(parsed.areas) ? parsed.areas : buildPresetAreas();
  if (!state.areas.length) {
    state.areas = buildPresetAreas();
  }
  state.areas = state.areas.map((area) => ({
    ...area,
    selected: area.selected !== false,
    locked: area.locked === true,
    checks: Array.isArray(area.checks) ? area.checks : defaultChecks(area.type, area.name),
    dimensions: area.dimensions || createDimensions()
  }));
  els.propertyName.value = state.propertyName;
  els.propertyAddress.value = state.propertyAddress;
  els.clientName.value = state.clientName;
  els.inspectorName.value = state.inspectorName;
}

function render(options = {}) {
  const { preserveScroll = true } = options;
  const previousScrollY = preserveScroll ? window.scrollY : 0;
  updateHeader();
  renderRoomSelection();
  renderAreas();
  renderSummaryReports();
  setScreen(state.currentScreen, { scroll: false });
  if (preserveScroll) window.scrollTo(0, previousScrollY);
}

function addArea(name, type) {
  const cleanName = name.trim();
  if (!cleanName) return;
  state.areas.push(createArea(cleanName, type, true));
  els.areaName.value = "";
  render();
}

els.startBtn.addEventListener("click", () => {
  updateProjectFields();
  setScreen("rooms", { scroll: true });
});

els.backToWelcomeBtn.addEventListener("click", () => {
  setScreen("welcome", { scroll: true });
});

els.continueToInspectionBtn.addEventListener("click", () => {
  syncActiveInspectionArea();
  setScreen("inspection", { scroll: true });
});

els.prevAreaBtn.addEventListener("click", () => {
  moveInspectionArea(-1);
});

els.nextAreaBtn.addEventListener("click", () => {
  moveInspectionArea(1);
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
  localStorage.removeItem(storageKey);
  state.currentScreen = "welcome";
  state.propertyName = "";
  state.propertyAddress = "";
  state.clientName = "";
  state.inspectorName = "";
  state.areas = buildPresetAreas();
  els.propertyName.value = "";
  els.propertyAddress.value = "";
  els.clientName.value = "";
  els.inspectorName.value = "";
  render();
});

els.printBtn.addEventListener("click", () => {
  setScreen("summary", { scroll: true });
  setTimeout(() => window.print(), 80);
});

loadState();
if (!state.areas.length) state.areas = buildPresetAreas();
render();
