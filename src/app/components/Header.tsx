"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  workLocation: string;
  setWorkLocation: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  theme: string;
  toggleTheme: () => void;
}

export default function Header({
  workLocation,
  setWorkLocation,
  month,
  setMonth,
  year,
  setYear,
  theme,
  toggleTheme,
}: HeaderProps) {
  return (
    <header className="header-wrapper">
      {/* Brand & Title Logo */}
      <div className="brand-section">
        <div className="logo-container">
          <img
            src="/Alamtri_logo.png"
            alt="AlamTri Logo"
            style={{ height: "74px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Dark Teal Title Pill */}
        <div className="title-pill">
          Turnover Dashboard
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{ alignItems: "center" }}>
        {/* Work Location Dropdown */}
        <div className="filter-group" style={{ alignSelf: "flex-end" }}>
          <label className="filter-label">Work Location</label>
          <select
            className="filter-select"
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
          >
            <option value="All">All</option>
            <option value="JAHO">JAHO</option>
            <option value="ADMO">ADMO</option>
            <option value="MACO">MACO</option>
            <option value="SERA">SERA</option>
          </select>
        </div>

        {/* Month Dropdown */}
        <div className="filter-group" style={{ alignSelf: "flex-end" }}>
          <label className="filter-label">Month</label>
          <select
            className="filter-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="filter-group" style={{ alignSelf: "flex-end" }}>
          <label className="filter-label">Year</label>
          <select
                className="filter-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
>
                {Array.from({ length: 5 }, (_, i) => {
                  const yearOption = (new Date().getFullYear() - i).toString();
                  return (
<option key={yearOption} value={yearOption}>
                      {yearOption}
</option>
                  );
                })}
</select>
        </div>

        {/* Active-looking Period Indicator */}
        <div className="filter-group" style={{ alignSelf: "flex-end" }}>
          <label className="filter-label active">Periode</label>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-main)",
              padding: "6px 4px",
              whiteSpace: "nowrap",
            }}
          >
            Jan {year} - Apr {year}
          </div>
        </div>

        {/* Theme Toggle Switch */}
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Dark/Light Mode"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
