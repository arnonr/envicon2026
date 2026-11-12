import ExcelJS from "exceljs";
import { mkdir, readdir, stat, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import {
  allEnrichedPapers,
  normalizePaperCode,
  sessionTracks,
  type EnrichedPaperItem,
} from "../../frontend/utils/program-data";

interface SubmissionExcelRow {
  rowNum: number;
  id: string;
  title: string;
  titleEn: string;
  creators: string;
  authorName: string;
  authorEmail: string;
  authorAffiliation: string;
  presentationFormat: string;
  track: string;
  status: string;
  keywords: string;
  abstractText: string;
  abstractPdfUrl: string;
  abstractWordUrl: string;
  fullPaperPdfUrl: string;
  fullPaperWordUrl: string;
}

interface MatchedPaperRecord {
  globalOrder: number;
  sessionOrder: number;
  normalizedCode: string;
  paper: EnrichedPaperItem;
  row: SubmissionExcelRow;
  matchMethod: "exact_title" | "author_match";
  titleChanged: boolean;
}

interface ExtractionSummary extends MatchedPaperRecord {
  abstractPdfFile: string;
  abstractWordFile: string;
  fallbackFiles: string[];
  note: string;
}

const REPO_ROOT = path.resolve(import.meta.dir, "../..");
const DEFAULT_OUTPUT_DIR = path.join(REPO_ROOT, "book-of-abstracts-export");
const DOWNLOAD_CONCURRENCY = 6;

function extractCellString(val: ExcelJS.CellValue): string {
  if (!val) return "";
  if (typeof val === "object") {
    if ("hyperlink" in val && val.hyperlink) return String(val.hyperlink).trim();
    if ("text" in val && val.text) return String(val.text).trim();
    if ("richText" in val && Array.isArray(val.richText)) {
      return val.richText.map((part) => part.text).join("").trim();
    }
  }
  return String(val).trim();
}

export function normalizeForMatch(input: string): string {
  return input
    .normalize("NFC")
    .replace(/\u0e4d\u0e32/g, "\u0e33")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[“”"'()\-–—:,.;]/g, "");
}

export function stripHonorificPrefix(name: string): string {
  return name
    .replace(
      /^(ว่าที่ร้อยตรี|พ\.อ\.รศ\.ดร\.|ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|อ\.ดร\.|ดร\.|นาย|นางสาว|นาง|น\.ส\.|mr\.|ms\.|mrs\.|dr\.)\s*/i,
      "",
    )
    .trim();
}

export function sanitizeFilenameSegment(input: string): string {
  return input
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

function getUrlExtension(url: string, fallbackExt: string): string {
  const cleanUrl = url.split("?")[0] ?? "";
  const ext = cleanUrl.split(".").pop()?.toLowerCase();
  if (ext && ["pdf", "doc", "docx"].includes(ext)) {
    return ext;
  }
  return fallbackExt;
}

async function findSubmissionsExcelFiles(explicitPath?: string): Promise<string[]> {
  const downloadsDir = path.join(os.homedir(), "Downloads");
  let entries: string[] = [];
  try {
    entries = await readdir(downloadsDir);
  } catch {
    entries = [];
  }
  const candidates = entries
    .filter((name) => /^envicon-submissions-.*\.xlsx$/i.test(name))
    .map((name) => path.join(downloadsDir, name));

  const withStats = await Promise.all(
    candidates.map(async (filePath) => ({
      filePath,
      mtimeMs: (await stat(filePath)).mtimeMs,
    })),
  );
  withStats.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const sortedPaths = withStats.map((item) => item.filePath);

  if (explicitPath) {
    const resolvedExplicit = path.resolve(explicitPath);
    return [resolvedExplicit, ...sortedPaths.filter((p) => p !== resolvedExplicit)];
  }

  if (sortedPaths.length === 0) {
    throw new Error(`ไม่พบไฟล์ envicon-submissions-*.xlsx ใน ${downloadsDir}`);
  }
  return sortedPaths;
}

async function parseSubmissionsExcel(excelPath: string): Promise<SubmissionExcelRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error(`ไม่พบ Worksheet ในไฟล์ ${excelPath}`);
  }

  const rows: SubmissionExcelRow[] = [];
  worksheet.eachRow((row, idx) => {
    if (idx === 1) return;
    const id = extractCellString(row.getCell(2).value);
    if (!id) return;
    rows.push({
      rowNum: idx,
      id,
      title: extractCellString(row.getCell(3).value),
      titleEn: extractCellString(row.getCell(4).value),
      creators: extractCellString(row.getCell(5).value),
      authorName: extractCellString(row.getCell(6).value),
      authorEmail: extractCellString(row.getCell(7).value),
      authorAffiliation: extractCellString(row.getCell(8).value),
      presentationFormat: extractCellString(row.getCell(11).value),
      track: extractCellString(row.getCell(12).value),
      status: extractCellString(row.getCell(13).value),
      keywords: extractCellString(row.getCell(15).value),
      abstractText: extractCellString(row.getCell(16).value),
      abstractPdfUrl: extractCellString(row.getCell(19).value),
      abstractWordUrl: extractCellString(row.getCell(20).value),
      fullPaperPdfUrl: extractCellString(row.getCell(21).value),
      fullPaperWordUrl: extractCellString(row.getCell(22).value),
    });
  });

  return rows;
}

async function loadMergedSubmissionsRows(
  excelPaths: string[],
): Promise<{ rows: SubmissionExcelRow[]; usedSources: Array<{ filePath: string; added: number }> }> {
  const byId = new Map<string, SubmissionExcelRow>();
  const usedSources: Array<{ filePath: string; added: number }> = [];

  for (const filePath of excelPaths) {
    const fileRows = await parseSubmissionsExcel(filePath);
    let added = 0;
    for (const row of fileRows) {
      if (!byId.has(row.id)) {
        byId.set(row.id, row);
        added++;
      }
    }
    if (added > 0) {
      usedSources.push({ filePath, added });
    }
  }

  return { rows: Array.from(byId.values()), usedSources };
}

export function matchProgramPapersToRows(
  papers: EnrichedPaperItem[],
  rows: SubmissionExcelRow[],
): MatchedPaperRecord[] {
  const usedRowIds = new Set<string>();
  const matchedByCode = new Map<
    string,
    { row: SubmissionExcelRow; matchMethod: "exact_title" | "author_match"; titleChanged: boolean }
  >();

  // Pass 1: Exact normalized title match
  for (const paper of papers) {
    const normTitle = normalizeForMatch(paper.title);
    const match = rows.find(
      (r) =>
        !usedRowIds.has(r.id) &&
        (normalizeForMatch(r.title) === normTitle || normalizeForMatch(r.titleEn) === normTitle),
    );
    if (match) {
      usedRowIds.add(match.id);
      matchedByCode.set(paper.code, {
        row: match,
        matchMethod: "exact_title",
        titleChanged: false,
      });
    }
  }

  // Pass 2a: Primary authorName match among remaining papers
  for (const paper of papers) {
    if (matchedByCode.has(paper.code)) continue;
    const normAuthor = normalizeForMatch(stripHonorificPrefix(paper.author));
    const candidates = rows.filter(
      (r) =>
        !usedRowIds.has(r.id) &&
        normalizeForMatch(stripHonorificPrefix(r.authorName)).includes(normAuthor),
    );

    if (candidates.length === 1) {
      const match = candidates[0]!;
      usedRowIds.add(match.id);
      matchedByCode.set(paper.code, {
        row: match,
        matchMethod: "author_match",
        titleChanged: normalizeForMatch(match.title) !== normalizeForMatch(paper.title),
      });
    }
  }

  // Pass 2b: Co-authors (creators) match among any still-unmatched papers
  for (const paper of papers) {
    if (matchedByCode.has(paper.code)) continue;
    const normAuthor = normalizeForMatch(stripHonorificPrefix(paper.author));
    const candidates = rows.filter(
      (r) => !usedRowIds.has(r.id) && normalizeForMatch(r.creators).includes(normAuthor),
    );

    if (candidates.length === 1) {
      const match = candidates[0]!;
      usedRowIds.add(match.id);
      matchedByCode.set(paper.code, {
        row: match,
        matchMethod: "author_match",
        titleChanged: normalizeForMatch(match.title) !== normalizeForMatch(paper.title),
      });
    }
  }

  const sessionCounters = new Map<number, number>();
  const results: MatchedPaperRecord[] = [];
  const unmatched: string[] = [];

  papers.forEach((paper, idx) => {
    const matched = matchedByCode.get(paper.code);
    if (!matched) {
      unmatched.push(`${paper.code} (${paper.author}): ${paper.title}`);
      return;
    }
    const nextSessionOrder = (sessionCounters.get(paper.sessionNumber) ?? 0) + 1;
    sessionCounters.set(paper.sessionNumber, nextSessionOrder);

    results.push({
      globalOrder: idx + 1,
      sessionOrder: nextSessionOrder,
      normalizedCode: normalizePaperCode(paper.code),
      paper,
      row: matched.row,
      matchMethod: matched.matchMethod,
      titleChanged: matched.titleChanged,
    });
  });

  if (unmatched.length > 0) {
    throw new Error(`จับคู่ผลงานไม่สำเร็จ ${unmatched.length} รายการ:\n${unmatched.join("\n")}`);
  }

  return results;
}

async function fetchBufferWithRetry(url: string, retries = 3): Promise<Uint8Array> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return new Uint8Array(await response.arrayBuffer());
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastError;
}

function buildTextAbstractContent(record: MatchedPaperRecord): string {
  const { paper, row, normalizedCode } = record;
  return [
    `รหัสผลงาน (Paper Code): ${normalizedCode}`,
    `Session: Session ${paper.sessionNumber} (${paper.sessionCode}) - ${paper.sessionNameTh}`,
    `รูปแบบการนำเสนอ: ${paper.type === "oral" ? "Oral Presentation" : "Poster Presentation"}`,
    `วัน-เวลานำเสนอ: ${paper.dateLabel} | ${paper.timeSlot}`,
    `ห้องนำเสนอ: ${paper.roomLabel}`,
    `ชื่อเรื่อง (ตามตารางโปรแกรม): ${paper.title}`,
    `ชื่อเรื่องภาษาไทย (ในระบบ): ${row.title}`,
    `ชื่อเรื่องภาษาอังกฤษ (ในระบบ): ${row.titleEn || "-"}`,
    `ผู้นำเสนอ (ตามตารางโปรแกรม): ${paper.author}`,
    `ผู้ส่งผลงาน (ในระบบ): ${row.authorName} (${row.authorEmail})`,
    `รายชื่อผู้จัดทำทั้งหมด (Co-authors): ${row.creators || "-"}`,
    `สังกัด (Affiliation): ${row.authorAffiliation || "-"}`,
    `คำสำคัญ (Keywords): ${row.keywords || "-"}`,
    "",
    "==================== บทคัดย่อ (Abstract) ====================",
    row.abstractText || "(ไม่มีข้อความบทคัดย่อในระบบ)",
    "",
  ].join("\n");
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runner() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await worker(items[current]!, current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runner()),
  );
  return results;
}

async function downloadAndOrganizeFiles(
  records: MatchedPaperRecord[],
  outputRoot: string,
): Promise<ExtractionSummary[]> {
  const allPdfDir = path.join(outputRoot, "all_pdf");
  const allWordDir = path.join(outputRoot, "all_word");
  const bySessionDir = path.join(outputRoot, "by_session");
  const fallbackDir = path.join(outputRoot, "fallback");

  await mkdir(allPdfDir, { recursive: true });
  await mkdir(allWordDir, { recursive: true });
  await mkdir(bySessionDir, { recursive: true });
  await mkdir(fallbackDir, { recursive: true });

  for (const track of sessionTracks) {
    const folderName = `${String(track.sessionNumber).padStart(2, "0")}_${track.code}`;
    await mkdir(path.join(bySessionDir, folderName, "pdf"), { recursive: true });
    await mkdir(path.join(bySessionDir, folderName, "word"), { recursive: true });
  }

  return runWithConcurrency(records, DOWNLOAD_CONCURRENCY, async (record) => {
    const seq3 = String(record.globalOrder).padStart(3, "0");
    const sessionSeq2 = String(record.sessionOrder).padStart(2, "0");
    const sessionFolder = `${String(record.paper.sessionNumber).padStart(2, "0")}_${record.paper.sessionCode}`;
    const safeAuthor = sanitizeFilenameSegment(record.paper.author);
    const { row, normalizedCode } = record;

    let abstractPdfFile = "";
    let abstractWordFile = "";
    const fallbackFiles: string[] = [];
    const notes: string[] = [];

    if (record.titleChanged) {
      notes.push("ชื่อเรื่องในระบบมีการอัปเดตต่างจากตอนออกตารางโปรแกรม");
    }

    // 1. Abstract PDF
    if (row.abstractPdfUrl) {
      const pdfBytes = await fetchBufferWithRetry(row.abstractPdfUrl);
      abstractPdfFile = `${seq3}_${normalizedCode}.pdf`;
      const sessionPdfFile = `${sessionSeq2}_${normalizedCode}_${safeAuthor}.pdf`;

      await writeFile(path.join(allPdfDir, abstractPdfFile), pdfBytes);
      await writeFile(path.join(bySessionDir, sessionFolder, "pdf", sessionPdfFile), pdfBytes);
    } else if (row.fullPaperPdfUrl) {
      const fullPdfBytes = await fetchBufferWithRetry(row.fullPaperPdfUrl);
      const fbPdfName = `${seq3}_${normalizedCode}_${safeAuthor}_FULLPAPER.pdf`;
      await writeFile(path.join(fallbackDir, fbPdfName), fullPdfBytes);
      fallbackFiles.push(fbPdfName);
      notes.push("ไม่มีไฟล์ในช่อง Abstract PDF (ดึงไฟล์ Full Paper PDF ไว้ใน fallback/)");
    } else {
      notes.push("ไม่มีไฟล์ PDF แนบในระบบ");
    }

    // 2. Abstract Word
    if (row.abstractWordUrl) {
      const wordExt = getUrlExtension(row.abstractWordUrl, "docx");
      const wordBytes = await fetchBufferWithRetry(row.abstractWordUrl);
      abstractWordFile = `${seq3}_${normalizedCode}.${wordExt}`;
      const sessionWordFile = `${sessionSeq2}_${normalizedCode}_${safeAuthor}.${wordExt}`;

      await writeFile(path.join(allWordDir, abstractWordFile), wordBytes);
      await writeFile(path.join(bySessionDir, sessionFolder, "word", sessionWordFile), wordBytes);
    } else {
      if (row.fullPaperWordUrl) {
        const fullWordExt = getUrlExtension(row.fullPaperWordUrl, "docx");
        const fullWordBytes = await fetchBufferWithRetry(row.fullPaperWordUrl);
        const fbWordName = `${seq3}_${normalizedCode}_${safeAuthor}_FULLPAPER.${fullWordExt}`;
        await writeFile(path.join(fallbackDir, fbWordName), fullWordBytes);
        fallbackFiles.push(fbWordName);
        notes.push("ไม่มีไฟล์ในช่อง Abstract Word (ดึงไฟล์ Full Paper Word ไว้ใน fallback/)");
      }
      if (row.abstractText) {
        const txtName = `${seq3}_${normalizedCode}_${safeAuthor}_abstract_text.txt`;
        await writeFile(path.join(fallbackDir, txtName), buildTextAbstractContent(record), "utf8");
        fallbackFiles.push(txtName);
        if (!row.fullPaperWordUrl) {
          notes.push("ไม่มีไฟล์ Word (บันทึกข้อความบทคัดย่อจากระบบไว้ใน fallback/)");
        }
      }
    }

    return {
      ...record,
      abstractPdfFile,
      abstractWordFile,
      fallbackFiles,
      note: notes.join(" | "),
    };
  });
}

async function writeSummaryWorkbook(
  summaries: ExtractionSummary[],
  outputPath: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TSHE-CON 2026 Book of Abstracts Extractor";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("สรุปไฟล์ Book of Abstracts", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "ลำดับรวม", key: "globalOrder", width: 10 },
    { header: "Session", key: "session", width: 14 },
    { header: "ลำดับใน Session", key: "sessionOrder", width: 14 },
    { header: "รหัสผลงาน", key: "code", width: 16 },
    { header: "รูปแบบ", key: "type", width: 12 },
    { header: "ผู้นำเสนอ (ตามโปรแกรม)", key: "programAuthor", width: 26 },
    { header: "ผู้ส่งผลงาน (ในระบบ)", key: "dbAuthor", width: 26 },
    { header: "ผู้จัดทำร่วม (ในระบบ)", key: "creators", width: 34 },
    { header: "สังกัด", key: "affiliation", width: 32 },
    { header: "ชื่อเรื่อง (ตามโปรแกรม)", key: "programTitle", width: 46 },
    { header: "ชื่อเรื่องล่าสุด (ในระบบ)", key: "dbTitle", width: 46 },
    { header: "สถานะในระบบ", key: "status", width: 24 },
    { header: "ไฟล์ Abstract PDF (all_pdf/)", key: "abstractPdfFile", width: 26 },
    { header: "ไฟล์ Abstract Word (all_word/)", key: "abstractWordFile", width: 28 },
    { header: "ไฟล์สำรอง (fallback/)", key: "fallbackFiles", width: 40 },
    { header: "หมายเหตุ / การตรวจสอบ", key: "note", width: 48 },
    { header: "ลิงก์ Abstract PDF", key: "abstractPdfUrl", width: 45 },
    { header: "ลิงก์ Abstract Word", key: "abstractWordUrl", width: 45 },
  ];

  for (const item of summaries) {
    const row = sheet.addRow({
      globalOrder: item.globalOrder,
      session: `Session ${item.paper.sessionNumber} (${item.paper.sessionCode})`,
      sessionOrder: item.sessionOrder,
      code: item.normalizedCode,
      type: item.paper.type === "oral" ? "Oral" : "Poster",
      programAuthor: item.paper.author,
      dbAuthor: item.row.authorName,
      creators: item.row.creators,
      affiliation: item.row.authorAffiliation,
      programTitle: item.paper.title,
      dbTitle: item.row.title,
      status: item.row.status,
      abstractPdfFile: item.abstractPdfFile || "❌ ไม่มี",
      abstractWordFile: item.abstractWordFile || "❌ ไม่มี",
      fallbackFiles: item.fallbackFiles.join(", "),
      note: item.note || "✅ ครบถ้วน",
      abstractPdfUrl: item.row.abstractPdfUrl,
      abstractWordUrl: item.row.abstractWordUrl,
    });

    for (const [colKey, url] of [
      ["abstractPdfUrl", item.row.abstractPdfUrl],
      ["abstractWordUrl", item.row.abstractWordUrl],
    ] as const) {
      if (!url) continue;
      const cell = row.getCell(colKey);
      cell.value = { text: url, hyperlink: url };
      cell.font = { color: { argb: "FF0563C1" }, underline: true };
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
  sheet.getRow(1).height = 28;
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
  });

  await workbook.xlsx.writeFile(outputPath);
}

async function main() {
  const explicitExcel = process.argv[2];
  const outputRoot = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUTPUT_DIR;

  const excelPaths = await findSubmissionsExcelFiles(explicitExcel);
  const { rows, usedSources } = await loadMergedSubmissionsRows(excelPaths);
  for (const src of usedSources) {
    console.log(`📄 อ่านไฟล์ข้อมูลจาก: ${src.filePath} (+${src.added} รายการ)`);
  }
  console.log(`📊 รวมรายการส่งผลงานทั้งหมด ${rows.length} รายการ`);

  const matched = matchProgramPapersToRows(allEnrichedPapers, rows);
  console.log(`✅ จับคู่รหัสผลงานในโปรแกรมสำเร็จครบ ${matched.length} / ${allEnrichedPapers.length} เรื่อง`);

  console.log(`⬇️  กำลังดาวน์โหลดและจัดเรียงไฟล์ลงที่: ${outputRoot} ...`);
  const summaries = await downloadAndOrganizeFiles(matched, outputRoot);

  const reportPath = path.join(outputRoot, "summary_report.xlsx");
  await writeSummaryWorkbook(summaries, reportPath);

  const pdfCount = summaries.filter((s) => Boolean(s.abstractPdfFile)).length;
  const wordCount = summaries.filter((s) => Boolean(s.abstractWordFile)).length;
  const fallbackCount = summaries.filter((s) => s.fallbackFiles.length > 0).length;

  console.log("\n🎉 ดึงและจัดเรียงไฟล์เสร็จสมบูรณ์!");
  console.log(`   - โฟลเดอร์รวม PDF (all_pdf/)   : ${pdfCount} ไฟล์`);
  console.log(`   - โฟลเดอร์รวม Word (all_word/) : ${wordCount} ไฟล์`);
  console.log(`   - รายการที่มีไฟล์สำรอง (fallback/): ${fallbackCount} รายการ`);
  console.log(`   - รายงานสรุป                   : ${reportPath}`);
}

if (import.meta.main) {
  await main();
}
