"use client";

import { useEffect, useMemo, useState } from "react";

type Record = {
  id: string;
  name: string;
  school: string;
  district: string;
  state: string;
  date: string;
  incident_type: string;
  case_status: string;
  summary: string;
  source_url: string;
  source_label?: string;
};

const ALLOWED_STATUSES = ["Convicted", "Guilty Plea", "License Revoked"];

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/records.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load records");
        return res.json();
      })
      .then((data: Record[]) => {
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load records");
        setLoading(false);
      });
  }, []);

  const visibleRecords = useMemo(
    () => records.filter((r) => ALLOWED_STATUSES.includes(r.case_status)),
    [records]
  );

  const states = useMemo(
    () =>
      Array.from(new Set(visibleRecords.map((r) => r.state)))
        .filter(Boolean)
        .sort(),
    [visibleRecords]
  );

  const types = useMemo(
    () =>
      Array.from(new Set(visibleRecords.map((r) => r.incident_type)))
        .filter(Boolean)
        .sort(),
    [visibleRecords]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleRecords.filter((r) => {
      if (stateFilter && r.state !== stateFilter) return false;
      if (typeFilter && r.incident_type !== typeFilter) return false;
      if (!q) return true;
      const haystack = [
        r.name,
        r.school,
        r.district,
        r.state,
        r.incident_type,
        r.case_status,
        r.summary,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [visibleRecords, query, stateFilter, typeFilter]);

  return (
    <div className="bf-page">
      <header className="bf-header">
        <div className="bf-header-inner">
          <h1 className="bf-brand">
            BadFaculty<span className="bf-brand-tld">.com</span>
          </h1>
          <p className="bf-tagline">The Record, Plainly Stated</p>
        </div>
      </header>

      <main className="bf-main">
        <section className="bf-controls">
          <input
            type="search"
            className="bf-search"
            placeholder="Search by name, school, district, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search records"
          />
          <div className="bf-filters">
            <select
              className="bf-select"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              aria-label="Filter by state"
            >
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="bf-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by incident type"
            >
              <option value="">All incident types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading && <p className="bf-status">Loading records...</p>}
        {error && <p className="bf-status bf-error">Error: {error}</p>}

        {!loading && !error && (
          <>
            <p className="bf-count">
              {filtered.length}{" "}
              {filtered.length === 1 ? "record" : "records"} found
            </p>

            <ul className="bf-list">
              {filtered.map((r) => {
                const isOpen = expanded === r.id;
                return (
                  <li key={r.id} className="bf-card">
                    <button
                      className="bf-card-head"
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="bf-card-title">
                        <span className="bf-name">{r.name}</span>
                        <span className="bf-sub">
                          {r.school} &middot; {r.district}, {r.state}
                        </span>
                      </div>
                      <div className="bf-card-meta">
                        <span className="bf-badge">{r.case_status}</span>
                        <span className="bf-chevron">{isOpen ? "-" : "+"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bf-card-body">
                        <dl className="bf-details">
                          <div className="bf-detail">
                            <dt>Date</dt>
                            <dd>{r.date}</dd>
                          </div>
                          <div className="bf-detail">
                            <dt>Incident type</dt>
                            <dd>{r.incident_type}</dd>
                          </div>
                          <div className="bf-detail">
                            <dt>Status</dt>
                            <dd>{r.case_status}</dd>
                          </div>
                          <div className="bf-detail">
                            <dt>State</dt>
                            <dd>{r.state}</dd>
                          </div>
                        </dl>
                        <p className="bf-summary">{r.summary}</p>
                        {r.source_url && (
                          <a
                            className="bf-source"
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {r.source_label || "View source"}
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {filtered.length === 0 && (
              <p className="bf-status">No records match your search.</p>
            )}
          </>
        )}
      </main>

      <footer className="bf-footer">
        <p>BadFaculty.com &middot; The Record, Plainly Stated</p>
      </footer>
    </div>
  );
}
