import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";
import { loadOwnerReportModel, saveSpreadsheetOutput } from "./excel_app_sync.mjs";

const outputDir = path.join(process.cwd(), "outputs");
await fs.mkdir(outputDir, { recursive: true });

const model = await loadOwnerReportModel(process.cwd());
const entrances = [...new Set(model.apartments.map((item) => item.entrance))];
const apartmentNumbers = [...new Set(model.apartments.map((item) => item.apartment))];

const workbook = Workbook.create();
const formSheet = workbook.worksheets.add("טופס");
const roomsSheet = workbook.worksheets.add("חדרים");
const checksSheet = workbook.worksheets.add("בדיקות");
const listsSheet = workbook.worksheets.add("רשימות");

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

function applyHeader(range, fill = "#0F766E") {
  range.format = {
    fill,
    font: { bold: true, color: "#FFFFFF" },
    verticalAlignment: "center",
    horizontalAlignment: "center",
  };
}

function applySectionTitle(range) {
  range.format = {
    fill: "#F3EEE6",
    font: { bold: true, color: "#0F4C5C" },
    verticalAlignment: "center",
    horizontalAlignment: "right",
  };
}

function applyInput(range) {
  range.format = {
    fill: "#FFF7ED",
    borders: borderBox(),
  };
}

for (const sheet of [formSheet, roomsSheet, checksSheet, listsSheet]) {
  sheet.showGridLines = false;
}

setWidths(formSheet, [170, 220, 170, 220, 170, 220, 170]);
setWidths(roomsSheet, [160, 120, 120, 120, 120]);
setWidths(checksSheet, [120, 120, 220, 180, 130, 120, 250, 170, 130, 260]);
setWidths(listsSheet, [120, 120, 140, 220, 120, 180]);

formSheet.getRange("A1:F1").merge();
formSheet.getRange("A1:F1").values = [[`טופס תסקיר בדיקת בעלים - גרסה ${model.appVersion || "לא ידועה"}`]];
formSheet.getRange("A1:F1").format = {
  fill: "#0F4C5C",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
formSheet.getRange("A1:F1").format.rowHeightPx = 34;

formSheet.getRange("A3:F3").merge();
formSheet.getRange("A3:F3").values = [[
  "ממלאים רק בתאים בצבע שמנת. הגיליונות נבנים אוטומטית מתוך גרסת האפליקציה הנוכחית, לכן אם מבנה הדירות, החדרים או הבדיקות משתנה יש לייצא קובץ חדש מהמחולל המעודכן."
]];
formSheet.getRange("A3:F3").format = {
  fill: "#E8F3F5",
  font: { color: "#0F4C5C", italic: true },
  wrapText: true,
  horizontalAlignment: "right",
  verticalAlignment: "center",
};
formSheet.getRange("A3:F3").format.rowHeightPx = 52;

const fields = [
  ["כניסה", ""],
  ["מספר דירה", ""],
  ["דירה פעילה", ""],
  ["שם הדייר", ""],
  ["טלפון נייד דיירים", ""],
  ["Email דיירים", ""],
  ["שם הבודק", ""],
  ["תאריך בדיקה", new Date()],
];

formSheet.getRange("A5:B12").values = fields;
applySectionTitle(formSheet.getRange("A5:A12"));
applyInput(formSheet.getRange("B5:B12"));
formSheet.getRange("A5:B12").format.rowHeightPx = 28;
formSheet.getRange("A5:A12").format.font = { bold: true, color: "#0F4C5C" };
formSheet.getRange("B12").setNumberFormat("yyyy-mm-dd");
formSheet.getRange("B7").formulas = [[`=IF(OR(B5="",B6=""),"","כניסה-"&B5&" דירה-"&B6)`]];
formSheet.getRange("B7").format = {
  fill: "#F2F0EA",
  font: { bold: true, color: "#0F4C5C" },
};

formSheet.getRange("D5:F5").merge();
formSheet.getRange("D5:F5").values = [["הנחיות סטטוס"]];
applySectionTitle(formSheet.getRange("D5:F5"));
formSheet.getRange("D6:F9").values = [
  ["לבדיקה", "הסעיף טרם נבדק", ""],
  ["תקין", "נבדק ונמצא תקין", ""],
  ["ליקוי", "נמצא ליקוי ויש לרשום הערה", ""],
  ["לא רלוונטי", "לא שייך לחדר או לסעיף", ""],
];
formSheet.getRange("D6:F9").format = { fill: "#FAF7F2", borders: borderBox() };

formSheet.getRange("D11:F11").merge();
formSheet.getRange("D11:F11").values = [["סיכום מהיר"]];
applySectionTitle(formSheet.getRange("D11:F11"));
formSheet.getRange("D12:F15").values = [
  ["מספר חדרים", `=COUNTA('חדרים'!A2:A${model.ownerRooms.length + 1})`, ""],
  ["מספר סעיפים", `=COUNTA('בדיקות'!F2:F500)`, ""],
  ["סעיפים עם ליקוי", `=COUNTIF('בדיקות'!I2:I500,"ליקוי")`, ""],
  ["סעיפים תקינים", `=COUNTIF('בדיקות'!I2:I500,"תקין")`, ""],
];
formSheet.getRange("D12:F15").format = { fill: "#FAF7F2", borders: borderBox() };
formSheet.freezePanes.freezeRows(4);

roomsSheet.getRange("A1:D1").values = [["חדר", "סוג חדר", "כלול בטופס", "הערה כללית"]];
applyHeader(roomsSheet.getRange("A1:D1"));
roomsSheet.getRange(`A2:D${model.ownerRooms.length + 1}`).values = model.ownerRooms.map((room) => [
  room.name,
  room.typeLabel,
  "כן",
  "",
]);
roomsSheet.getRange(`A2:C${model.ownerRooms.length + 1}`).format = { fill: "#FAF7F2", borders: borderBox() };
applyInput(roomsSheet.getRange(`D2:D${model.ownerRooms.length + 1}`));
roomsSheet.freezePanes.freezeRows(1);

const checkRows = model.ownerRooms.flatMap((room) => (
  room.checks.map((check) => [
    "",
    "",
    "",
    room.name,
    room.typeLabel,
    check.code,
    check.name,
    check.category,
    "לבדיקה",
    "",
  ])
));

checksSheet.getRange("A1:J1").values = [[
  "כניסה",
  "דירה",
  "דירה פעילה",
  "חדר",
  "סוג חדר",
  "קוד",
  "סעיף בדיקה",
  "קטגוריה",
  "סטטוס",
  "הערה",
]];
applyHeader(checksSheet.getRange("A1:J1"));
checksSheet.getRange(`A2:J${checkRows.length + 1}`).values = checkRows;
checksSheet.getRange(`A2:A${checkRows.length + 1}`).formulas = Array.from({ length: checkRows.length }, () => ["=IF('טופס'!B5=\"\",\"\",'טופס'!B5)"]);
checksSheet.getRange(`B2:B${checkRows.length + 1}`).formulas = Array.from({ length: checkRows.length }, () => ["=IF('טופס'!B6=\"\",\"\",'טופס'!B6)"]);
checksSheet.getRange(`C2:C${checkRows.length + 1}`).formulas = Array.from({ length: checkRows.length }, () => ["=IF('טופס'!B7=\"\",\"\",'טופס'!B7)"]);
checksSheet.getRange(`A2:I${checkRows.length + 1}`).format = { fill: "#FAF7F2", borders: borderBox() };
applyInput(checksSheet.getRange(`J2:J${checkRows.length + 1}`));
checksSheet.freezePanes.freezeRows(1);

listsSheet.getRange("A1:F1").values = [["כניסות", "דירות", "סטטוסים", "חדרים", "כן/לא", "סוגי חדרים"]];
applyHeader(listsSheet.getRange("A1:F1"), "#6B7280");
listsSheet.getRange(`A2:A${entrances.length + 1}`).values = entrances.map((value) => [value]);
listsSheet.getRange(`B2:B${apartmentNumbers.length + 1}`).values = apartmentNumbers.map((value) => [value]);
listsSheet.getRange(`C2:C${model.statuses.length + 1}`).values = model.statuses.map((value) => [value]);
listsSheet.getRange(`D2:D${model.ownerRooms.length + 1}`).values = model.ownerRooms.map((room) => [room.name]);
listsSheet.getRange("E2:E3").values = [["כן"], ["לא"]];
listsSheet.getRange("F2:F4").values = [["חדר יבש"], ["חדר רטוב"], ["אזור חוץ"]];
listsSheet.getRange("A1:F20").format = { fill: "#F8F6F1" };

formSheet.getRange("B5").dataValidation = { rule: { type: "list", formula1: "רשימות!$A$2:$A$3" } };
formSheet.getRange("B6").dataValidation = { rule: { type: "list", formula1: "רשימות!$B$2:$B$9" } };
roomsSheet.getRange(`C2:C${model.ownerRooms.length + 1}`).dataValidation = { rule: { type: "list", formula1: "רשימות!$E$2:$E$3" } };
checksSheet.getRange(`I2:I${checkRows.length + 1}`).dataValidation = { rule: { type: "list", formula1: "'רשימות'!$C$2:$C$5" } };

roomsSheet.tables.add(`A1:D${model.ownerRooms.length + 1}`, true, "OwnerRoomsTable").style = "TableStyleMedium2";
checksSheet.tables.add(`A1:J${checkRows.length + 1}`, true, "OwnerChecksTable").style = "TableStyleMedium2";

const inspect = await workbook.inspect({
  kind: "table",
  range: "טופס!A1:F15",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 6,
});
await fs.writeFile(path.join(outputDir, "owner_excel_template_inspect.ndjson"), inspect.ndjson, "utf8");

const output = await SpreadsheetFile.exportXlsx(workbook);
await saveSpreadsheetOutput(output, path.join(outputDir, "owner-report-template.xlsx"), model.appVersion);
