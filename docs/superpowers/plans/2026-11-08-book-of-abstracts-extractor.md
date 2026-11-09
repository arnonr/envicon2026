# Book of Abstracts File Extractor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and execute a CLI script that matches all 113 conference program papers against the Admin Excel export, downloads their latest Word/PDF abstract files, organizes them by paper code/session, and generates a summary verification report.

**Architecture:** A standalone Bun TypeScript script in `backend/scripts/extract-book-of-abstracts.ts` imports the canonical 113-paper dataset from `frontend/utils/program-data.ts` and parses the latest `envicon-submissions-*.xlsx` export using `exceljs`. It performs two-pass matching (exact normalized title, then normalized presenter/creator name), downloads files concurrently into structured output folders (`all_word/`, `all_pdf/`, `by_session/`, `fallback/`), and writes `summary_report.xlsx`.

**Tech Stack:** Bun, TypeScript, ExcelJS (`exceljs`)

**Spec:** `docs/superpowers/specs/2026-11-08-book-of-abstracts-extractor-design.md`

## Global Constraints

- Run via `cd backend && bun run scripts/extract-book-of-abstracts.ts` (uses `exceljs` from `backend/node_modules`).
- Normalize paper codes with underscores (`GREEN_P-01` -> `GREEN-P-01`) for consistent filenames while preserving the global 1–113 sequence prefix (`001_ENV-O-01`).
- Never use prefix-only title matching without author verification.
- Output directory `book-of-abstracts-export/` must be ignored by Git in `.gitignore`.

## Review Focus

- Thai vowel composition differences (`ำ` vs `\u0e4d\u0e32`) in titles or author names must normalize identically so exact matches do not fail.
- Excel hyperlink cells (`{ text, hyperlink }`) must extract the URL string cleanly.
- Papers with empty abstract slots (`DIGI-P-02`, `GREEN-O-03`, `CLIM-O-12`) must have their full paper files or plain-text abstract saved in `fallback/` and clearly flagged in `summary_report.xlsx`.
- File extensions (`.doc` vs `.docx` vs `.pdf`) must be preserved from the source URL.
- Unsafe filename characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`) in author names must be sanitized before writing to disk.

---

### Task 1: Create and Run Book of Abstracts Extractor Script

**Files:**
- Modify: `.gitignore`
- Create: `backend/scripts/extract-book-of-abstracts.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: `allEnrichedPapers`, `normalizePaperCode` from `../../frontend/utils/program-data`
- Produces: CLI script `backend/scripts/extract-book-of-abstracts.ts` and npm script `"extract:abstracts": "bun run scripts/extract-book-of-abstracts.ts"`

- [ ] **Step 1: Add `book-of-abstracts-export/` to `.gitignore`**

Append `book-of-abstracts-export/` to `.gitignore`.

- [ ] **Step 2: Implement `backend/scripts/extract-book-of-abstracts.ts` and add `"extract:abstracts"` script to `backend/package.json`**

Implement:
- `findLatestSubmissionsExcel(explicitPath?: string): Promise<string>` — resolves CLI arg or newest `~/Downloads/envicon-submissions-*.xlsx`.
- `matchProgramPapersToRows(papers: EnrichedPaperItem[], rows: SubmissionExcelRow[]): MatchedPaperRecord[]` — Pass 1 exact normalized title (`title` or `titleEn`), Pass 2 normalized author (`authorName` or `creators`). Throws if any of the 113 papers fail to match.
- `downloadAndOrganizeFiles(records: MatchedPaperRecord[], outputRoot: string): Promise<ExtractionSummary[]>` — downloads `abstractFileUrl` and `abstractWordFileUrl` with concurrency 6, copies into:
  - `all_pdf/${seq3}_${normCode}.pdf`
  - `all_word/${seq3}_${normCode}.${wordExt}`
  - `by_session/${sessionFolder}/${sessionSeq2}_${normCode}_${safeAuthor}.${ext}`
  - `fallback/` for `fullPaperFileUrl`, `fullPaperWordFileUrl`, and `.txt` abstract text when abstract slots are missing.
- `writeSummaryWorkbook(summaries: ExtractionSummary[], outputPath: string): Promise<void>` — generates `book-of-abstracts-export/summary_report.xlsx`.

- [ ] **Step 3: Run extractor against `/Users/macbook-arnon/Downloads/envicon-submissions-2026-11-08.xlsx` and verify output**

Run: `cd /Users/macbook-arnon/Projects/envicon2026/backend && bun run extract:abstracts`
Expected:
- 113 / 113 papers matched
- 110 PDFs in `book-of-abstracts-export/all_pdf/`
- 91 Word files in `book-of-abstracts-export/all_word/`
- Fallback files in `book-of-abstracts-export/fallback/` for `CLIM-O-12`, `DIGI-P-02`, `GREEN-O-03`
- `book-of-abstracts-export/summary_report.xlsx` created

- [ ] **Step 4: Commit**

```bash
git add .gitignore docs/superpowers/specs/2026-11-08-book-of-abstracts-extractor-design.md docs/superpowers/plans/2026-11-08-book-of-abstracts-extractor.md backend/package.json backend/scripts/extract-book-of-abstracts.ts
git commit -m "feat(scripts): add book of abstracts file extractor sorted by paper code"
```
