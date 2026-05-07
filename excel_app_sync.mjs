import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

function findMatchingDelimiter(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      inString = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error(`Could not find matching delimiter for ${openChar}${closeChar}.`);
}

function extractConstDeclaration(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find const declaration for ${name}.`);
  }

  const expressionStart = source.indexOf("=", start) + 1;
  const trimmedStart = expressionStart + source.slice(expressionStart).match(/^\s*/u)[0].length;
  const firstChar = source[trimmedStart];
  const closingChar = firstChar === "{" ? "}" : firstChar === "[" ? "]" : null;

  if (!closingChar) {
    throw new Error(`Unsupported const expression for ${name}.`);
  }

  const expressionEnd = findMatchingDelimiter(source, trimmedStart, firstChar, closingChar);
  const semicolonIndex = source.indexOf(";", expressionEnd);
  return source.slice(start, semicolonIndex + 1);
}

function extractFunctionDeclaration(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find function declaration for ${name}.`);
  }

  const bodyStart = source.indexOf("{", start);
  const bodyEnd = findMatchingDelimiter(source, bodyStart, "{", "}");
  return source.slice(start, bodyEnd + 1);
}

function extractAppVersion(source) {
  const match = source.match(/const APP_VERSION = "([^"]+)";/u);
  return match ? match[1] : "";
}

function parseStatuses(indexSource) {
  const templateMatch = indexSource.match(/<template id="checkTemplate">([\s\S]*?)<\/template>/u);
  if (!templateMatch) {
    return ["לבדיקה", "תקין", "ליקוי", "לא רלוונטי"];
  }

  const statuses = [...templateMatch[1].matchAll(/<option value="[^"]+">([^<]+)<\/option>/gu)]
    .map((match) => match[1].trim())
    .filter(Boolean);

  return statuses.length ? statuses : ["לבדיקה", "תקין", "ליקוי", "לא רלוונטי"];
}

function normalizeApartmentLabels(labels = []) {
  return labels.map((label) => {
    const match = label.match(/כניסה-(\d+)\s+דירה-(\d+)/u);
    return {
      label,
      entrance: match ? match[1] : "",
      apartment: match ? match[2] : "",
    };
  });
}

function uniqueChecks(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

function buildChecksForRoom(definitions, roomName, typeKey) {
  let checks = definitions.checkSets[typeKey] || [];

  if (roomName.includes("מדרגות")) {
    checks = uniqueChecks([
      ...checks,
      definitions.baseChecks.interiorFinishes.find((check) => check.code === "2.1.5"),
      definitions.baseChecks.safetyRegulations.find((check) => check.code === "7.1.2"),
      definitions.baseChecks.safetyRegulations.find((check) => check.code === "7.1.4"),
    ]);
  }

  if (roomName.includes("גג")) {
    checks = uniqueChecks([
      ...checks,
      ...definitions.baseChecks.outdoorRoof,
      definitions.baseChecks.safetyRegulations.find((check) => check.code === "7.1.2"),
    ]);
  }

  if (roomName.includes("מרפסת")) {
    checks = uniqueChecks([
      ...checks,
      ...definitions.baseChecks.outdoorRoof,
      ...definitions.baseChecks.plumbingDrainage.filter((check) => ["4.1.3", "4.1.4"].includes(check.code)),
    ]);
  }

  if (roomName.includes("מטבח")) {
    checks = uniqueChecks([...checks, ...definitions.baseChecks.plumbingDrainage]);
  }

  return checks
    .filter(Boolean)
    .map((check) => ({
      code: check.code,
      name: check.name,
      category: check.category,
    }));
}

function evaluateAppDefinitions(appSource) {
  const snippet = [
    extractConstDeclaration(appSource, "baseChecks"),
    extractConstDeclaration(appSource, "checkSets"),
    extractConstDeclaration(appSource, "areaTypeLabels"),
    extractConstDeclaration(appSource, "ownerAreaPreset"),
    extractConstDeclaration(appSource, "ownerApartmentLabels"),
    extractFunctionDeclaration(appSource, "inferAreaType"),
    "module.exports = { baseChecks, checkSets, areaTypeLabels, ownerAreaPreset, ownerApartmentLabels, inferAreaType };",
  ].join("\n\n");

  const sandbox = {
    module: { exports: {} },
    exports: {},
  };
  vm.runInNewContext(snippet, sandbox, { timeout: 1000 });
  return sandbox.module.exports;
}

export async function loadOwnerReportModel(baseDir = process.cwd()) {
  const appPath = path.join(baseDir, "app.js");
  const indexPath = path.join(baseDir, "index.html");
  const [appSource, indexSource] = await Promise.all([
    fs.readFile(appPath, "utf8"),
    fs.readFile(indexPath, "utf8"),
  ]);

  const definitions = evaluateAppDefinitions(appSource);
  const statuses = parseStatuses(indexSource);
  const apartments = normalizeApartmentLabels(definitions.ownerApartmentLabels);
  const ownerRooms = definitions.ownerAreaPreset.map((name) => {
    const typeKey = definitions.inferAreaType(name);
    return {
      name,
      typeKey,
      typeLabel: definitions.areaTypeLabels[typeKey] || typeKey,
      checks: buildChecksForRoom(definitions, name, typeKey),
    };
  });

  return {
    appVersion: extractAppVersion(appSource),
    statuses,
    apartments,
    ownerRooms,
    areaTypeLabels: definitions.areaTypeLabels,
  };
}

export async function saveSpreadsheetOutput(output, targetPath, appVersion = "") {
  try {
    await output.save(targetPath);
    return targetPath;
  } catch (error) {
    if (!["EBUSY", "EPERM"].includes(error?.code)) {
      throw error;
    }

    const parsed = path.parse(targetPath);
    const safeVersion = String(appVersion || "updated").replace(/[^\d.]+/gu, "_");
    const fallbackPath = path.join(parsed.dir, `${parsed.name}.${safeVersion}${parsed.ext}`);
    await output.save(fallbackPath);
    return fallbackPath;
  }
}
