import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";
import { loadOwnerReportModel, saveSpreadsheetOutput } from "./excel_app_sync.mjs";

const outputDir = path.join(process.cwd(), "outputs");
await fs.mkdir(outputDir, { recursive: true });

const model = await loadOwnerReportModel(process.cwd());
const workbook = Workbook.create();

function borderBox() {
  return {
    top: { style: "Continuous", color: "#D6C7B3" },
    bottom: { style: "Continuous", color: "#D6C7B3" },
    left: { style: "Continuous", color: "#D6C7B3" },
    right: { style: "Continuous", color: "#D6C7B3" },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

function applyHeader(range, fill = "#0F4C5C") {
  range.format = {
    fill,
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
}

function applyLabel(range) {
  range.format = {
    fill: "#F3EEE6",
    font: { bold: true, color: "#0F4C5C" },
    horizontalAlignment: "right",
    verticalAlignment: "center",
    borders: borderBox(),
  };
}

function applyInput(range) {
  range.format = {
    fill: "#FFF7ED",
    borders: borderBox(),
  };
}

function getSheetTheme(entrance) {
  return entrance === "17"
    ? { header: "#9C6644", accent: "#7F5539", light: "#F4E4D8" }
    : { header: "#0F4C5C", accent: "#125F73", light: "#E8F3F5" };
}

function buildSheet(apartmentInfo) {
  const sheetName = apartmentInfo.label;
  const sheet = workbook.worksheets.add(sheetName);
  const theme = getSheetTheme(apartmentInfo.entrance);
  const rows = model.ownerRooms.flatMap((room) => (
    room.checks.map((check) => [
      room.name,
      room.typeLabel,
      check.code,
      check.name,
      check.category,
      "לבדיקה",
      "",
    ])
  ));

  sheet.showGridLines = false;
  setWidths(sheet, [150, 230, 150, 230, 150, 230, 150, 160]);

  sheet.getRange("A1:H1").merge();
  sheet.getRange("A1:H1").values = [[`תסקיר בדיקת בעלים - ${sheetName}`]];
  sheet.getRange("A1:H1").format = {
    fill: theme.header,
    font: { bold: true, color: "#FFFFFF", size: 16 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  sheet.getRange("A1:H1").format.rowHeightPx = 34;

  sheet.getRange("A3:H3").merge();
  sheet.getRange("A3:H3").values = [[
    `הגיליון נבנה אוטומטית מתוך גרסת האפליקציה ${model.appVersion || "הנוכחית"}. ממלאים רק את הסטטוס וההערות לפי הצורך.`
  ]];
  sheet.getRange("A3:H3").format = {
    fill: theme.light,
    font: { color: theme.header, italic: true },
    wrapText: true,
    horizontalAlignment: "right",
    verticalAlignment: "center",
  };
  sheet.getRange("A3:H3").format.rowHeightPx = 40;

  const formRows = [
    ["כניסה", apartmentInfo.entrance, "דירה מספר", apartmentInfo.apartment],
    ["דירה פעילה", sheetName, "שם הדייר", ""],
    ["טלפון נייד דיירים", "", "Email דיירים", ""],
    ["שם הבודק", "", "תאריך בדיקה", new Date()],
  ];
  sheet.getRange("A5:D8").values = formRows;
  applyLabel(sheet.getRange("A5:A8"));
  applyInput(sheet.getRange("B5:B8"));
  applyLabel(sheet.getRange("C5:C8"));
  applyInput(sheet.getRange("D5:D8"));
  sheet.getRange("B5:B6").format = { ...sheet.getRange("B5:B6").format, fill: "#F2F0EA" };
  sheet.getRange("D5").format = { ...sheet.getRange("D5").format, fill: "#F2F0EA" };
  sheet.getRange("D8").setNumberFormat("yyyy-mm-dd");

  sheet.getRange("F5:H5").merge();
  sheet.getRange("F5:H5").values = [["סיכום מהיר"]];
  applyLabel(sheet.getRange("F5:H5"));
  sheet.getRange("F6:H9").values = [
    ["מספר חדרים", model.ownerRooms.length, ""],
    ["מספר סעיפים", "", ""],
    ["סעיפים עם ליקוי", "", ""],
    ["סעיפים תקינים", "", ""],
  ];
  sheet.getRange("F6:H9").format = { fill: "#FAF7F2", borders: borderBox() };

  sheet.getRange("A12:G12").values = [[
    "חדר",
    "סוג חדר",
    "קוד",
    "סעיף בדיקה",
    "קטגוריה",
    "סטטוס",
    "הערה",
  ]];
  applyHeader(sheet.getRange("A12:G12"), theme.accent);

  const endRow = rows.length + 12;
  sheet.getRange(`A13:G${endRow}`).values = rows;
  sheet.getRange(`A13:F${endRow}`).format = { fill: "#FAF7F2", borders: borderBox() };
  applyInput(sheet.getRange(`G13:G${endRow}`));
  sheet.getRange(`F13:F${endRow}`).dataValidation = {
    rule: { type: "list", values: model.statuses },
  };

  sheet.getRange("G6").formulas = [[`=COUNTA(A13:A${endRow})`]];
  sheet.getRange("G7").formulas = [[`=COUNTIF(F13:F${endRow},"ליקוי")`]];
  sheet.getRange("G8").formulas = [[`=COUNTIF(F13:F${endRow},"תקין")`]];

  sheet.tables.add(`A12:G${endRow}`, true, `tbl_${apartmentInfo.entrance}_${apartmentInfo.apartment}`).style = "TableStyleMedium2";
  sheet.freezePanes.freezeRows(12);

  return sheetName;
}

const builtSheetNames = model.apartments.map(buildSheet);

const inspect = await workbook.inspect({
  kind: "table",
  range: `${builtSheetNames[0]}!A1:H18`,
  include: "values,formulas",
  tableMaxRows: 18,
  tableMaxCols: 8,
});
await fs.writeFile(path.join(outputDir, "owner_workbook_16_inspect.ndjson"), inspect.ndjson, "utf8");

const output = await SpreadsheetFile.exportXlsx(workbook);
await saveSpreadsheetOutput(output, path.join(outputDir, "owner-report-16-apartments.xlsx"), model.appVersion);
