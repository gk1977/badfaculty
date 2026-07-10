"use client";

import { useEffect, useMemo, useState } from "react";

const PUBLIC_STATUSES = new Set([
  "Convicted",
  "Guilty Plea",
  "License Revoked",
]);

const RECORDS_PER_PAGE = 25;

type PublicRecord = {
  id?: string | number;
  name?: string;
  school?: string;
  district?: string;
  county?: string;
  state?: string;
  incident_type?: string;
  case_status?: string;
  date?: string;
  summary?: string;
  source_outlet?: string;
  source_url?: string;
};

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildRecordId(record: PublicRecord, index: number) {
  return String(
    record.id ||
      `${record.name || "record"}-${record.state || "state"}-${
        record.date || "date"
      }-${index}`
  );
}

export default function HomePage() {
  const [records, setRecords] = useState<PublicRecord[]>([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [page, setPage] = useState(1);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/records.json", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Could not load /records.json.");
        }
        const data = await response.json();
        const rows: PublicRecord[] = Array.isArray(data)
          ? data
          : Array.isArray(data.records)
          ? data.records
          : [];
        const publicRows = rows
          .filter((record) => PUBLIC_STATUSES.has(String(record.case_status)))
          .sort((a, b) =>
            String(b.date || "").localeCompare(String(a.date || ""))
          );
        setRecords(publicRows);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load records."
        );
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  useEffect(() => {
    setPage(1);
    setExpandedRecord(null);
  }, [search, stateFilter, typeFilter]);

  const states = useMemo(() => {
    const values = Array.from(
      new Set(records.map((record) => record.state).filter(Boolean))
    ).sort() as string[];
    return ["All States", ...values];
  }, [records]);

  const incidentTypes = useMemo(() => {
    const values = Array.from(
      new Set(records.map((record) => record.incident_type).filter(Boolean))
    ).sort() as string[];
    return ["All Types", ...values];
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesState =
        stateFilter === "All States" || record.state === stateFilter;
      const matchesType =
        typeFilter === "All Types" || record.incident_type === typeFilter;
      const searchableText = [
        record.name,
        record.school,
        record.district,
        record.county,
        record.state,
        record.incident_type,
        record.case_status,
        record.summary,
        record.source_outlet,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = query === "" || searchableText.includes(query);
      return matchesState && matchesType && matchesSearch;
    });
  }, [records, search, stateFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / RECORDS_PER_PAGE)
  );

  const visibleRecords = useMemo(() => {
    const start = (page - 1) * RECORDS_PER_PAGE;
    return filteredRecords.slice(start, start + RECORDS_PER_PAGE);
  }, [filteredRecords, page]);

  const totalByStatus = useMemo(() => {
    return records.reduce<Record<string, number>>((acc, record) => {
      const status = record.case_status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [records]);

  function clearFilters() {
    setSearch("");
    setStateFilter("All States");
    setTypeFilter("All Types");
    setPage(1);
    setExpandedRecord(null);
  }

  return (
    <main className="site-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand-row">
            <a className="brand-mark" href="/" aria-label="BadFaculty.com home">
              <img
                src="/bf-logo.png"
                alt=""
                className="brand-logo"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="brand-copy">
                <div className="wordmark">
                  <span>Bad</span>
                  <strong>Faculty</strong>
                  <small>.com</small>
                </div>
                <div className="tagline">The Record, Plainly Stated</div>
              </div>
            </a>
            <div className="header-note">
              Public records.
              <br />
              Resolved outcomes.
            </div>
          </div>
        </div>
      </header>

      <section className="scope-strip">
        <div className="container scope-grid">
          <div>
            <span className="eyebrow">Scope</span>
            <p>
              This site displays only resolved public outcomes: convictions,
              guilty pleas, and license revocations.
            </p>
          </div>
          <div>
            <span className="eyebrow">Sources</span>
            <p>
              Every record should link back to a public news, court, or licensing
              source.
            </p>
          </div>
        </div>
      </section>

      <section className="container hero">
        <div className="hero-main">
          <p className="section-kicker">National Public-Interest Database</p>
          <h1>K-12 educator misconduct records, plainly organized.</h1>
          <p className="hero-copy">
            Search finalized cases by name, school, district, state, incident
            type, or keyword. The interface is built to feel like a public filing
            system: factual, restrained, and easy to navigate.
          </p>
        </div>
        <aside className="docket-panel" aria-label="Database summary">
          <div className="docket-label">Current public index</div>
          <div className="docket-number">
            {loading ? "—" : records.length.toLocaleString()}
          </div>
          <div className="docket-caption">resolved records loaded</div>
          <dl className="status-breakdown">
            <div>
              <dt>Convicted</dt>
              <dd>{(totalByStatus.Convicted || 0).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Guilty Plea</dt>
              <dd>{(totalByStatus["Guilty Plea"] || 0).toLocaleString()}</dd>
            </div>
            <div>
              <dt>License Revoked</dt>
              <dd>
                {(totalByStatus["License Revoked"] || 0).toLocaleString()}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="container search-panel" aria-label="Search records">
        <div className="search-grid">
          <label>
            <span>Search records</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, school, district, keyword..."
            />
          </label>
          <label>
            <span>State</span>
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Incident type</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </section>

      <section className="container records-section">
        <div className="records-toolbar">
          <div>
            <span className="eyebrow">Results</span>
            <p>
              {loading
                ? "Loading records..."
                : `${filteredRecords.length.toLocaleString()} matching record${
                    filteredRecords.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          {!loading && filteredRecords.length > 0 && (
            <div className="page-status">
              Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </div>
          )}
        </div>

        {error && <div className="notice error-notice">{error}</div>}

        {!loading && !error && visibleRecords.length === 0 && (
          <div className="notice">
            <p>No records match the current filters.</p>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        <div className="record-list">
          {!loading &&
            !error &&
            visibleRecords.map((record, index) => {
              const globalIndex = (page - 1) * RECORDS_PER_PAGE + index;
              const recordId = buildRecordId(record, globalIndex);
              const isExpanded = expandedRecord === recordId;
              return (
                <article className="record-card" key={recordId}>
                  <button
                    type="button"
                    className="record-trigger"
                    onClick={() =>
                      setExpandedRecord(isExpanded ? null : recordId)
                    }
                    aria-expanded={isExpanded}
                  >
                    <div className="record-primary">
                      <div className="record-file-number">
                        BF-{String(globalIndex + 1).padStart(5, "0")}
                      </div>
                      <h2>{record.name || "Name unavailable"}</h2>
                      <p className="record-school">
                        {[record.school, record.district]
                          .filter(Boolean)
                          .join(" · ") || "School information unavailable"}
                      </p>
                      <p className="record-meta">
                        {[
                          record.state,
                          record.county ? `${record.county} County` : "",
                          formatDate(record.date),
                          record.incident_type,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="record-actions">
                      <span
                        className={`status-badge status-${String(
                          record.case_status || ""
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {record.case_status}
                      </span>
                      <span className="view-label">
                        {isExpanded ? "Close file" : "Open file"}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="record-detail">
                      <div className="detail-rule" />
                      <p>
                        {record.summary ||
                          "No summary is currently available for this record."}
                      </p>
                      <div className="source-row">
                        <span>Source</span>
                        {record.source_url ? (
                          <a
                            href={record.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {record.source_outlet || "Original public source"}
                          </a>
                        ) : (
                          <em>Source link unavailable</em>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </div>

        {!loading && !error && filteredRecords.length > RECORDS_PER_PAGE && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </button>
          </nav>
        )}
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <p>
            BadFaculty.com publishes information drawn from public court records,
            licensing records, and established news sources. Records shown here
            have reached a resolved public outcome.
          </p>
          <p>
            Corrections:{" "}
            <a href="mailto:admin@badfaculty.com">admin@badfaculty.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
