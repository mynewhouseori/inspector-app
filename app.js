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
    ...baseChecks.structureEnvelope,
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
    ...baseChecks.openingsDoors,
    ...baseChecks.electricityCommunication,
    ...baseChecks.safetyRegulations.filter((check) => check.code !== "7.1.2")
  ],
  wet: [
    ...baseChecks.structureEnvelope.filter((check) => check.code !== "1.1.4"),
    ...baseChecks.interiorFinishes.filter((check) => check.code !== "2.1.5"),
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
  propertyName: "",
  propertyAddress: "",
  clientName: "",
  inspectorName: "",
  areas: []
};

const storageKey = "inspector-app-state-v2";

const els = {
  propertyName: document.querySelector("#propertyName"),
  propertyAddress: document.querySelector("#propertyAddress"),
  clientName: document.querySelector("#clientName"),
  inspectorName: document.querySelector("#inspectorName"),
  areaName: document.querySelector("#areaName"),
  areaType: document.querySelector("#areaType"),
  addAreaBtn: document.querySelector("#addAreaBtn"),
  areasContainer: document.querySelector("#areasContainer"),
  areaTemplate: document.querySelector("#areaTemplate"),
  checkTemplate: document.querySelector("#checkTemplate"),
  summaryStats: document.querySelector("#summaryStats"),
  issueSummary: document.querySelector("#issueSummary"),
  printBtn: document.querySelector("#printBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  reportTitle: document.querySelector("#reportTitle"),
  reportMeta: document.querySelector("#reportMeta")
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function uniqueChecks(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

function createDimensions() {
  return {
    planWidth: "",
    planLength: "",
    actualWidth: "",
    actualLength: ""
  };
}

function defaultChecks(type, areaName = "") {
  let checks = checkSets[type] || [];

  if (areaName.includes("מדרגות")) {
    checks = uniqueChecks([
      ...checks,
      baseChecks.interiorFinishes.find((check) => check.code === "2.1.5"),
      baseChecks.safetyRegulations.find((check) => check.code === "7.1.2"),
      baseChecks.safetyRegulations.find((check) => check.code === "7.1.4")
    ].filter(Boolean));
  }

  if (areaName.includes("גג")) {
    checks = uniqueChecks([
      ...checks,
      ...baseChecks.outdoorRoof,
      baseChecks.safetyRegulations.find((check) => check.code === "7.1.2")
    ].filter(Boolean));
  }

  if (areaName.includes("מרפסת")) {
    checks = uniqueChecks([
      ...checks,
      ...baseChecks.outdoorRoof,
      ...baseChecks.plumbingDrainage.filter((check) => check.code === "4.1.3" || check.code === "4.1.4")
    ]);
  }

  if (areaName.includes("מטבח")) {
    checks = uniqueChecks([
      ...checks,
      ...baseChecks.plumbingDrainage
    ]);
  }

  return checks.map((check) => ({
    id: uid(),
    ...check,
    status: "pending",
    severity: "medium",
    note: ""
  }));
}

function inferAreaType(name) {
  if (
    name.includes("רחצה") ||
    name.includes("מטבח") ||
    name.includes("ש.אורחים") ||
    name.includes("שרות")
  ) {
    return "wet";
  }

  if (
    name.includes("מרפסת") ||
    name.includes("גג")
  ) {
    return "outdoor";
  }

  return "dry";
}

function createArea(name, type) {
  return {
    id: uid(),
    name,
    type,
    checks: defaultChecks(type, name),
    dimensions: createDimensions()
  };
}

function buildPresetAreas() {
  return defaultAreaPreset.map((name) => createArea(name, inferAreaType(name)));
}

function addArea(name, type) {
  const cleanName = name.trim();
  if (!cleanName) return;
  state.areas.push(createArea(cleanName, type));
  els.areaName.value = "";
  render();
}

function removeArea(areaId) {
  state.areas = state.areas.filter((area) => area.id !== areaId);
  render();
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
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
  const planWidth = normalizeNumber(dims.planWidth);
  const planLength = normalizeNumber(dims.planLength);
  const actualWidth = normalizeNumber(dims.actualWidth);
  const actualLength = normalizeNumber(dims.actualLength);

  const widthStatus = classifyDelta(planWidth, actualWidth);
  const lengthStatus = classifyDelta(planLength, actualLength);

  if (widthStatus === "empty" || lengthStatus === "empty") {
    return { label: "ממתין להזנה", badgeClass: "", widthStatus, lengthStatus };
  }

  if (widthStatus === "issue" || lengthStatus === "issue") {
    return { label: "פער חריג במידות", badgeClass: "status-issue", widthStatus, lengthStatus };
  }

  if (widthStatus === "warn" || lengthStatus === "warn") {
    return { label: "סטייה קלה במידות", badgeClass: "status-warn", widthStatus, lengthStatus };
  }

  return { label: "תואם לתכנית", badgeClass: "status-ok", widthStatus, lengthStatus };
}

function updateHeader() {
  state.propertyName = els.propertyName.value.trim();
  state.propertyAddress = els.propertyAddress.value.trim();
  state.clientName = els.clientName.value.trim();
  state.inspectorName = els.inspectorName.value.trim();

  els.reportTitle.textContent = state.propertyName || "דוח בדיקה הנדסית";

  const parts = [
    state.propertyAddress && `כתובת: ${state.propertyAddress}`,
    state.clientName && `לקוח: ${state.clientName}`,
    state.inspectorName && `בודק: ${state.inspectorName}`
  ].filter(Boolean);

  els.reportMeta.textContent = parts.length
    ? parts.join(" | ")
    : "התחל בהזנת פרטי הנכס והוספת אזורים לבדיקה.";
}

function computeSummary() {
  const checks = state.areas.flatMap((area) => area.checks);
  const issueChecks = checks.filter((check) => check.status === "issue");
  return {
    totalAreas: state.areas.length,
    totalChecks: checks.length,
    ok: checks.filter((check) => check.status === "ok").length,
    pending: checks.filter((check) => check.status === "pending").length,
    issues: issueChecks.length,
    highIssues: issueChecks.filter((check) => check.severity === "high").length
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.areas = buildPresetAreas();
    return;
  }

  const parsed = JSON.parse(raw);
  state.propertyName = parsed.propertyName || "";
  state.propertyAddress = parsed.propertyAddress || "";
  state.clientName = parsed.clientName || "";
  state.inspectorName = parsed.inspectorName || "";
  state.areas = Array.isArray(parsed.areas) ? parsed.areas : [];

  if (!state.areas.length) {
    state.areas = buildPresetAreas();
  }

  state.areas = state.areas.map((area) => ({
    ...area,
    checks: Array.isArray(area.checks) ? area.checks : defaultChecks(area.type, area.name),
    dimensions: area.dimensions || createDimensions()
  }));

  els.propertyName.value = state.propertyName;
  els.propertyAddress.value = state.propertyAddress;
  els.clientName.value = state.clientName;
  els.inspectorName.value = state.inspectorName;
}

function renderSummary() {
  const summary = computeSummary();
  const items = [
    { label: "אזורים", value: summary.totalAreas },
    { label: "בדיקות", value: summary.totalChecks },
    { label: "תקין", value: summary.ok },
    { label: "ליקויים", value: summary.issues },
    { label: "לבדיקה", value: summary.pending },
    { label: "ליקוי גבוה", value: summary.highIssues }
  ];

  els.summaryStats.innerHTML = items.map((item) => `
    <div class="stat-box">
      <small>${item.label}</small>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

function renderIssueSummary() {
  const issues = state.areas.flatMap((area) =>
    area.checks
      .filter((check) => check.status === "issue")
      .map((check) => ({
        area: area.name,
        code: check.code,
        name: check.name,
        category: check.category,
        severity: check.severity,
        note: check.note
      }))
  );

  if (!issues.length) {
    els.issueSummary.innerHTML = `
      <div class="empty-state">
        עדיין לא סומנו ליקויים. ברגע שתסמן בדיקה כ"ליקוי", היא תופיע כאן בדוח המסכם.
      </div>
    `;
    return;
  }

  const order = { high: 0, medium: 1, low: 2 };
  els.issueSummary.innerHTML = issues
    .sort((a, b) => order[a.severity] - order[b.severity])
    .map((issue) => `
      <div class="issue-item">
        <strong>${issue.area} • ${issue.code} • ${issue.name}</strong>
        <div class="issue-meta">${issue.category} | חומרה: ${severityLabels[issue.severity]}</div>
        <div>${issue.note || "לא הוזנה הערה."}</div>
      </div>
    `)
    .join("");
}

function renderAreas() {
  els.areasContainer.innerHTML = "";

  state.areas.forEach((area) => {
    const node = els.areaTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".area-title").textContent = area.name;
    node.querySelector(".area-type").textContent = areaTypeLabels[area.type];

    area.dimensions = area.dimensions || createDimensions();

    const dimensionState = getDimensionStatus(area);
    const dimensionBadge = node.querySelector(".dimension-badge");
    dimensionBadge.textContent = dimensionState.label;
    if (dimensionState.badgeClass) {
      dimensionBadge.classList.add(dimensionState.badgeClass);
    }

    node.querySelectorAll(".dimension-input").forEach((input) => {
      const group = input.dataset.dimensionGroup;
      const field = input.dataset.dimensionField;
      const key = group === "plan"
        ? (field === "width" ? "planWidth" : "planLength")
        : (field === "width" ? "actualWidth" : "actualLength");

      input.value = area.dimensions[key];

      const pairStatus = field === "width" ? dimensionState.widthStatus : dimensionState.lengthStatus;
      if (group === "actual") {
        if (pairStatus === "ok") input.classList.add("match-ok");
        if (pairStatus === "warn") input.classList.add("match-warn");
        if (pairStatus === "issue") input.classList.add("match-issue");
      }

      input.addEventListener("input", (event) => {
        area.dimensions[key] = event.target.value;
        render();
      });
    });

    node.querySelector(".delete-btn").addEventListener("click", () => {
      removeArea(area.id);
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

      statusSelect.addEventListener("change", (event) => {
        check.status = event.target.value;
        render();
      });

      severitySelect.addEventListener("change", (event) => {
        check.severity = event.target.value;
        render();
      });

      noteInput.addEventListener("input", (event) => {
        check.note = event.target.value;
        saveState();
        renderIssueSummary();
      });

      checksList.appendChild(checkNode);
    });

    els.areasContainer.appendChild(node);
  });
}

function render() {
  updateHeader();
  renderSummary();
  renderIssueSummary();
  renderAreas();
  saveState();
}

els.addAreaBtn.addEventListener("click", () => {
  addArea(els.areaName.value, els.areaType.value);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    addArea(chip.dataset.areaName, chip.dataset.areaType);
  });
});

[els.propertyName, els.propertyAddress, els.clientName, els.inspectorName].forEach((input) => {
  input.addEventListener("input", render);
});

els.areaName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addArea(els.areaName.value, els.areaType.value);
  }
});

els.printBtn.addEventListener("click", () => {
  const summary = computeSummary();
  const issueLines = state.areas
    .flatMap((area) =>
      area.checks
        .filter((check) => check.status === "issue")
        .map((check) => `${area.name}: ${check.code} ${check.name} (${severityLabels[check.severity]})${check.note ? ` - ${check.note}` : ""}`)
    )
    .slice(0, 12);

  const existing = document.querySelector(".print-summary");
  if (existing) existing.remove();

  const summarySection = document.createElement("section");
  summarySection.className = "panel report-header print-summary";
  summarySection.innerHTML = `
    <h3>דוח מסכם</h3>
    <p>
      סה"כ אזורים: ${summary.totalAreas} |
      סה"כ בדיקות: ${summary.totalChecks} |
      תקין: ${summary.ok} |
      ליקויים: ${summary.issues} |
      לבדיקה: ${summary.pending}
    </p>
    <p>${issueLines.length ? `ממצאים בולטים: ${issueLines.join(" | ")}` : "לא הוזנו ליקויים מסומנים בשלב זה."}</p>
  `;
  els.areasContainer.prepend(summarySection);
  window.print();
});

els.resetBtn.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  state.propertyName = "";
  state.propertyAddress = "";
  state.clientName = "";
  state.inspectorName = "";
  state.areas = [];
  els.propertyName.value = "";
  els.propertyAddress.value = "";
  els.clientName.value = "";
  els.inspectorName.value = "";
  render();
});

loadState();
render();
