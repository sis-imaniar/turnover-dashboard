"use client";

import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Printer, ChevronLeft, ChevronRight } from "lucide-react";

import { EmployeeRow, PagedResponse } from "../hooks/useDashboardData";

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const getApiBaseCandidates = (): string[] => {
  const candidates: string[] = [""];

  if (process.env.NEXT_PUBLIC_API_URL) {
    candidates.push(normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL));
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    candidates.push(`${protocol}//${hostname}:5079`);
    if (hostname !== "localhost") {
      candidates.push(`${protocol}//localhost:5079`);
    }
    if (hostname !== "127.0.0.1") {
      candidates.push(`${protocol}//127.0.0.1:5079`);
    }
  } else {
    candidates.push("http://localhost:5079");
  }

  return Array.from(new Set(candidates));
};

const fetchFromApi = async (path: string, options: RequestInit = {}) => {
  let lastError: unknown = null;

  for (const baseUrl of getApiBaseCandidates()) {
    try {
      return await fetch(`${baseUrl}${path}`, options);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to fetch from all API hosts");
};

interface TurnoverTableProps {
  tableData?: PagedResponse<EmployeeRow> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  workLocation: string;
  month: string;
  year: string;
}

// Renders the <td> cells for a single employee row
function EmployeeRowCells({ row }: { row: EmployeeRow }) {
  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{row.personnelNo}</td>
      <td style={{ fontWeight: 600 }}>{row.completeName}</td>
      <td>{row.division}</td>
      <td>{row.jobGroup || "-"}</td>
      <td>{row.personnelAreaName}</td>
      <td>{row.periodeOfEmployment}</td>
      <td>{formatDate(row.joinDate)}</td>
      <td>{formatDate(row.terminateDate)}</td>
      <td>{row.serviceLength}</td>
      <td>{row.terminateReasonForAction}</td>
      <td>
        <span className={row.category.toUpperCase() === "VOLUNTARY" ? "badge-voluntary" : "badge-involuntary"}>
          {row.category.charAt(0).toUpperCase() + row.category.slice(1).toLowerCase()}
        </span>
      </td>
    </tr>
  );
}

export default function TurnoverTable({
  tableData,
  loading,
  onPageChange,
  workLocation,
  month,
  year,
}: TurnoverTableProps) {
  const currentData = tableData?.data || [];
  const totalPages = tableData?.totalPages || 1;
  const currentPage = tableData?.page || 1;
  const totalRecords = tableData?.totalRecords || 0;

  // Excel C# Export function
  const handleExportExcel = async () => {
    try {
      const apiFilters = {
        period: "Monthly",
        year: year ? parseInt(year, 10) : null,
        month: month || null,
        location: workLocation === "All" ? null : workLocation,
      };

      const sanitizedFilters = Object.fromEntries(
        Object.entries(apiFilters).filter(([_, v]) => v != null)
      );

      const response = await fetchFromApi("/api/dashboard/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedFilters),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Turnover_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel file from the server.");
    }
  };

  // PDF Export function
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="table-card" style={{ position: "relative" }}>
      {/* Table Header Section */}
      <div className="table-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="table-title">Turnover Detail</span>
          {loading && (
            <span style={{ fontSize: "11px", color: "var(--color-blue)", fontWeight: 500, animation: "pulse 1.5s infinite" }}>
              • Updating...
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="table-pagination">
          <span className="pagination-info">
            Showing {currentData.length === 0 ? 0 : (currentPage - 1) * 5 + 1}
            -{Math.min(currentPage * 5, totalRecords)} of {totalRecords}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="table-actions">
          {/* Excel Export Button */}
          <button className="btn-export excel" onClick={handleExportExcel} disabled={loading}>
            <FileSpreadsheet size={16} />
            Export to Excel
          </button>

          {/* PDF Export Button */}
          <button className="btn-export pdf" onClick={handleExportPDF} disabled={loading}>
            <Printer size={16} />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="table-responsive">
        <table className="detail-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Job Level</th>
              <th>Location</th>
              <th>Employment Status</th>
              <th>Hire Date</th>
              <th>Termination Date</th>
              <th>Length of Service</th>
              <th>Reason for Leaving</th>
              <th>Turnover Category</th>
            </tr>
          </thead>
          {/* Paginated rows shown on screen */}
          <tbody className="screen-rows">
            {currentData.length > 0 ? (
              currentData.map((row, idx) => <EmployeeRowCells key={idx} row={row} />)
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                  Tidak ada data turnover yang sesuai dengan filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>

          {/* Full result set for printing */}
          <tbody className="print-rows">
            {currentData.map((row, idx) => (
              <EmployeeRowCells key={idx} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
