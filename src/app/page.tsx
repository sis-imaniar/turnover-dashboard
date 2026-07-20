"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import ChartsRow2 from "./components/ChartsRow2";
import ChartsRow3 from "./components/ChartsRow3";
import TurnoverTable from "./components/TurnoverTable";
import { useDashboardData } from "./hooks/useDashboardData";

export default function Home() {
  // Global filter state for dashboard interactivity
  const [workLocation, setWorkLocation] = useState("All");
  const [month, setMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  ); // Default to current month name
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Theme state: default to light
  const [theme, setTheme] = useState("light");

  // Construct filters to match backend API schema (memoized to prevent infinite render loop)
  const apiFilters = useMemo(() => ({
    period: "Monthly",
    year: year ? parseInt(year, 10) : null,
    month: month || null,
    location: workLocation === "All" ? null : workLocation,
  }), [year, month, workLocation]);

  const { summary, tableData, loading, error, fetchTable } = useDashboardData(apiFilters);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        if (nextTheme === "dark") {
          document.body.classList.add("dark-theme");
        } else {
          document.body.classList.remove("dark-theme");
        }
      }
      return nextTheme;
    });
  };

  // Sync initial theme setting
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
  }, [theme]);

  return (
    <main className="dashboard-container">
      {/* 1. Header component (Brand Logo, Title, Filters and Theme Switcher) */}
      <Header
        workLocation={workLocation}
        setWorkLocation={setWorkLocation}
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {error && (
        <div style={{ padding: "12px", margin: "16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px", color: "#991b1b", fontSize: "14px", fontWeight: 500 }}>
          Error: {error}
        </div>
      )}

      {loading && !summary ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "var(--text-muted)", fontSize: "14px" }}>
          Loading Dashboard Data...
        </div>
      ) : (
        <>
          {/* 2. Key Performance Indicator Cards Row (8 cards YTD) */}
          <KPICards kpiData={summary?.kpis} />

          {/* 3. Recharts Row 2 (Line rate, Division bars, Voluntary donut) */}
          <ChartsRow2 summary={summary} />

          {/* 4. Recharts Row 3 (Tren turnover, Jobsite reasons, Reason donut, Service bars) */}
          <ChartsRow3 summary={summary} />

          {/* 5. Detail Turnover Table (Reactive filter grid + Excel/PDF action exports) */}
          <TurnoverTable
            tableData={tableData}
            loading={loading}
            onPageChange={(page) => fetchTable(page, 5)}
            workLocation={workLocation}
            month={month}
            year={year}
          />
        </>
      )}
    </main>
  );
}

