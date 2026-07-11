// scripts/verify-records.js
//
// Usage:  node scripts/verify-records.js
//
// Reads public/records.json and flags records whose case_status claims a
// resolved outcome but whose summary text suggests the case is only at the
// arrest / charge / allegation stage. Fix flagged records before publishing.

const fs = require("fs");
const path = require("path");

const RECORDS_PATH = path.join(process.cwd(), "public", "records.json");

// Statuses the site treats as "resolved" and will publish.
const RESOLVED_STATUSES = new Set([
  "Convicted",
  "Guilty Plea",
  "License Revoked",
]);

// Phrases in a summary that indicate a case is NOT yet resolved.
const UNRESOLVED_PATTERNS = [
  /\barrested\b/i,
  /\baccus(e|ed|ation|ations)\b/i,
  /\balleg(e|ed|es|ation|ations|edly)\b/i,
  /\bcharged\b/i,
  /\bfacing charges\b/i,
  /\bawaiting trial\b/i,
  /\bpre-?trial\b/i,
  /\bindicted\b/i,
  /\bstand trial\b/i,
  /\bif convicted\b/i,
  /\bcould face\b/i,
  /\bscheduled for (trial|sentencing)\b/i,
];

// Phrases that AFFIRM a resolved outcome.
const RESOLVED_CONFIRMERS = [
  /\bconvicted\b/i,
  /\bfound guilty\b/i,
  /\bpleaded? (guilty|no contest)\b/i,
  /\bpled? (guilty|no contest)\b/i,
  /\bsentenced\b/i,
  /\bplea (deal|agreement)\b/i,
  /\bregister as a sex offender\b/i,
];

function loadRecords() {
  if (!fs.existsSync(RECORDS_PATH)) {
    console.error(`ERROR: ${RECORDS_PATH} not found.`);
    process.exit(1);
  }
  const raw = fs.readFileSync(RECORDS_PATH, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("ERROR: records.json is not valid JSON:", e.message);
    process.exit(1);
  }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.records)) return data.records;
  console.error("ERROR: could not find a records array in the file.");
  process.exit(1);
}

function garbledFields(record) {
  const problems = [];
  const check = (field) => {
    const v = record[field];
    if (typeof v !== "string" || !v) return;
    if (/\b(was|is)\b/i.test(v) && field !== "summary") {
      problems.push(`${field} looks like a sentence fragment: "${v}"`);
    }
  };
  ["school", "district", "county"].forEach(check);
  if (record.state === "Louisiana" && /los angeles/i.test(record.county || "")) {
    problems.push(`state/county mismatch: state="${record.state}", county="${record.county}"`);
  }
  return problems;
}

function main() {
  const records = loadRecords();

  const hardFlags = [];
  const softFlags = [];
  const garbled = [];
  const missingSource = [];

  records.forEach((record, i) => {
    const idLabel = `#${i} ${record.name || "(no name)"} [${record.state || "?"}, ${record.date || "?"}]`;
    const status = String(record.case_status || "");
    const summary = String(record.summary || "");

    if (RESOLVED_STATUSES.has(status)) {
      const hasUnresolved = UNRESOLVED_PATTERNS.some((re) => re.test(summary));
      const hasResolved = RESOLVED_CONFIRMERS.some((re) => re.test(summary));
      if (hasUnresolved && !hasResolved) {
        hardFlags.push(`${idLabel}\n   status="${status}" but summary has only arrest/charge/allegation language.\n   summary: ${summary}`);
      } else if (hasUnresolved && hasResolved) {
        softFlags.push(`${idLabel} — status="${status}"; summary mentions arrest/charge AND a resolution. Verify the arrest text is just history.`);
      }
    }

    if (!record.source_url) {
      missingSource.push(idLabel);
    }

    const g = garbledFields(record);
    if (g.length) {
      garbled.push(`${idLabel}\n   ${g.join("\n   ")}`);
    }
  });

  const line = "=".repeat(70);
  console.log(line);
  console.log(`Verified ${records.length} records against publishing rules.`);
  console.log(line);

  console.log(`\n>>> HARD FLAGS (${hardFlags.length}) — status says resolved, text does NOT confirm it. FIX BEFORE PUBLISHING:\n`);
  hardFlags.forEach((f) => console.log(" - " + f + "\n"));

  console.log(`\n>>> SOFT FLAGS (${softFlags.length}) — review to confirm arrest/charge wording is just background:\n`);
  softFlags.forEach((f) => console.log(" - " + f));

  console.log(`\n>>> GARBLED / SCRAPED FIELDS (${garbled.length}) — clean these up:\n`);
  garbled.forEach((f) => console.log(" - " + f + "\n"));

  console.log(`\n>>> MISSING SOURCE URL (${missingSource.length}):\n`);
  missingSource.forEach((f) => console.log(" - " + f));

  console.log("\n" + line);
  if (hardFlags.length > 0) {
    console.log("RESULT: NOT READY. Resolve hard flags, then re-run.");
    process.exitCode = 1;
  } else {
    console.log("RESULT: No hard flags. Review soft flags & garbled fields, then publish.");
  }
}

main();
