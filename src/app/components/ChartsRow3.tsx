"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Label,
  Legend,
} from "recharts";

import { DashboardSummary } from "../hooks/useDashboardData";

interface ChartsRow3Props {
  summary?: DashboardSummary | null;
}

export default function ChartsRow3({ summary }: ChartsRow3Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="charts-grid-4">
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Tren Turn Over...</span>
        </div>
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Jobsite & Reason...</span>
        </div>
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Reason for Leaving...</span>
        </div>
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Length of Service...</span>
        </div>
      </div>
    );
  }

  // Helper to format percentage values with commas
  const formatIDNPercent = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) {
      return "0,0%";
    }
    return `${val.toFixed(1).replace(".", ",")}%`;
  };

  // 1. Tren Turn Over Data
  const trendData = (summary?.yearlyTrend || []).map((entry) => ({
    year: entry.year,
    employeeOut: entry.voluntary + entry.involuntary,
    turnoverRate: entry.rate,
  }));

  // 2. Turnover by Jobsite & Reason Data
  const jobsiteData = (summary?.jobsiteChart || []).map((entry) => ({
    name: entry.name,
    "End Contract": entry.endContract,
    "Medical Unfit": entry.medicalUnfit,
    "Pelanggaran": entry.pelanggaran,
    "Resign": entry.resign,
    turnover: entry.turnover,
  }));

  // 3. Reason for Leaving Data (exact to screenshot)
  const totalReasons = (summary?.reasonChart || []).reduce((sum, item) => sum + item.value, 0);
  const REASON_COLORS = ["#0ea5e9", "#ea580c", "#64748b", "#eab308", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];
  const reasonData = (summary?.reasonChart || []).map((entry, index) => {
    const percentage = totalReasons > 0 ? (entry.value / totalReasons) * 100 : 0;
    return {
      name: entry.label,
      value: entry.value,
      percentage: Number(percentage.toFixed(1)),
      color: REASON_COLORS[index % REASON_COLORS.length],
    };
  });

  // 4. Length of Service Data
  const totalTenures = (summary?.tenureChart || []).reduce((sum, item) => sum + item.value, 0);
  const serviceData = (summary?.tenureChart || []).map((entry) => {
    const percentage = totalTenures > 0 ? (entry.value / totalTenures) * 100 : 0;
    return {
      range: entry.label,
      percentage: Number(percentage.toFixed(1)),
      count: entry.value,
    };
  });

  return (
    <div className="charts-grid-4">
      {/* 1. Tren Turn Over */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Trend Turnover</span>
        </div>
        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={trendData} margin={{ top: 20, right: -5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              {/* Left Y-axis for employee counts */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                domain={[0, 900]}
                ticks={[0, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
              />
              {/* Right Y-axis for turnover rate */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                domain={[0, 20]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={20}
                iconSize={10}
                style={{ fontSize: "10px" }}
              />
              
              {/* Columns for Employee Out */}
              <Bar yAxisId="left" dataKey="employeeOut" name="Employee Out" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={35}>
                {/* Custom Label inside/top of Bars */}
                <Label
                  content={({ x, y, width, value }: any) => {
                    if (x === undefined || y === undefined || width === undefined) return null;
                    return (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        fill="var(--text-main)"
                        fontSize={9}
                        fontWeight={700}
                        textAnchor="middle"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>

              {/* Line for Turnover (%) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="turnoverRate"
                name="Turnover (%)"
                stroke="#ea580c"
                strokeWidth={2}
                dot={{ r: 3, fill: "#ea580c" }}
              >
                <Label
                  content={({ x, y, value }: any) => {
                    if (x === undefined || y === undefined) return null;
                    return (
                      <text
                        x={Number(x)}
                        y={Number(y) - 8}
                        fill="#ea580c"
                        fontSize={9}
                        fontWeight={700}
                        textAnchor="middle"
                      >
                        {formatIDNPercent(value)}
                      </text>
                    );
                  }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Turnover by Jobsite & Reason */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Turnover by Jobsite & Reason</span>
        </div>
        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={jobsiteData} margin={{ top: 20, right: -5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-main)", fontSize: 10, fontWeight: 600 }} />

              {/* Left axis for counts */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              />

              {/* Right axis for percentage */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 8 }}
                tickFormatter={(val) => `${val.toFixed(1).replace(".", ",")}%`}
              />
              
              <Tooltip />

              {/* Grouped Columns for Reasons */}
              <Bar yAxisId="left" dataKey="End Contract" fill="#0d9488" barSize={4} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="Medical Unfit" fill="#10b981" barSize={4} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="Pelanggaran" fill="#991b1b" barSize={4} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="Resign" fill="#ef4444" barSize={4} radius={[2, 2, 0, 0]} />

              {/* Line for % Turnover */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="turnover"
                name="% Turnover"
                stroke="#2563eb"
                strokeWidth={1.5}
                dot={{ r: 2, fill: "#2563eb" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Customized legend directly under the chart */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", fontSize: "8px", marginTop: "-10px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ width: 6, height: 6, backgroundColor: "#0d9488", display: "inline-block" }}></span> End Contract
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ width: 6, height: 6, backgroundColor: "#10b981", display: "inline-block" }}></span> Medical Unfit
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ width: 6, height: 6, backgroundColor: "#991b1b", display: "inline-block" }}></span> Pelanggaran
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ width: 6, height: 6, backgroundColor: "#ef4444", display: "inline-block" }}></span> Resign
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ width: 10, height: 1, backgroundColor: "#2563eb", display: "inline-block" }}></span> % Turnover
          </span>
        </div>
      </div>

      {/* 3. Reason for Leaving Donut */}
      <div className="chart-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span className="chart-title">Reason for Leaving</span>
        <div style={{ display: "flex", flexGrow: 1, alignItems: "center", minHeight: 0, gap: "5px" }}>
          <div className="chart-container-inner" style={{ flexGrow: 1, height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {reasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value={totalReasons.toString()}
                    position="center"
                    style={{ fontSize: "18px", fill: "var(--text-main)", fontWeight: 800 }}
                  />
                </Pie>
                <Tooltip formatter={(value) => [`${value} Karyawan`, "Total"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple custom legend stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "9px", minWidth: "120px" }}>
            {reasonData.map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                <span style={{ width: 6, height: 6, backgroundColor: item.color, borderRadius: "1px", marginTop: "4px", flexShrink: 0 }}></span>
                <span style={{ color: "var(--text-main)", fontWeight: 500, lineHeight: 1.2 }}>
                  {item.name}: <span style={{ fontWeight: 700 }}>{item.percentage}% ({item.value})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Turnover by Length of Service */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Turnover by Length of Service</span>
        </div>
        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={serviceData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "var(--text-main)", fontSize: 9, fontWeight: 600 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 9 }}
                domain={[0, 50]}
                ticks={[0, 10, 20, 30, 40, 50]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Persentase"]} />
              <Bar dataKey="percentage" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={30}>
                {/* Labels above the bars */}
                <Label
                  content={({ x, y, width, value }: any) => {
                    if (x === undefined || y === undefined || width === undefined) return null;
                    return (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        fill="var(--text-main)"
                        fontSize={10}
                        fontWeight={700}
                        textAnchor="middle"
                      >
                        {formatIDNPercent(value)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
