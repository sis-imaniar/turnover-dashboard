"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";

import { DashboardSummary } from "../hooks/useDashboardData";

interface ChartsRow2Props {
  summary?: DashboardSummary | null;
}

export default function ChartsRow2({ summary }: ChartsRow2Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="charts-grid-3">
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Line Chart...</span>
        </div>
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Bar Chart...</span>
        </div>
        <div className="chart-card" style={{ justifyContent: "center", alignItems: "center" }}>
          <span>Loading Donut Chart...</span>
        </div>
      </div>
    );
  }

  // 1. Turnover Line Chart Data (Indonesian format values)
  const lineData = (summary?.trendChart || []).map((entry) => ({
    name: entry.month,
    rate2026: entry.monthly,
    ratePrev: entry.previous,
  }));

  // 2. Turnover by Division Data (using counts)
  const divisionData = (summary?.divisionChart || [])
    .map((item) => ({
      name: item.label,
      value: item.value,
    }))
    .reverse();

  // 3. Voluntary vs Involuntary Data
  const totalDonut = (summary?.categoryChart || []).reduce((sum, item) => sum + item.value, 0);
  const donutData = (summary?.categoryChart || []).map((entry) => {
    const isVol = entry.label.toUpperCase() === "VOLUNTARY";
    const percentage = totalDonut > 0 ? (entry.value / totalDonut) * 100 : 0;
    return {
      name: isVol ? "Voluntary" : "Involuntary",
      value: entry.value,
      percentage,
      color: isVol ? "#ea580c" : "#0d9488",
    };
  });

  // Formatting helper for decimal commas
  const formatIndonesianPercentage = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) {
      return "0,0%";
    }
    return `${val.toFixed(1).replace(".", ",")}%`;
  };

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            boxShadow: "var(--shadow-md)",
            fontSize: "12px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px", color: "#1e293b" }}>{payload[0].payload.name}</p>
          <p style={{ color: "#0ea5e9" }}>
            Turnover Rate: <span style={{ fontWeight: 700 }}>{formatIndonesianPercentage(payload[0].value)}</span>
          </p>
          {payload[1] && (
            <p style={{ color: "#94a3b8" }}>
              Prev Year Rate: <span style={{ fontWeight: 700 }}>{formatIndonesianPercentage(payload[1].value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid-3">
      {/* 1. Turnover Line Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Turnover Trend {summary?.year === 0 ? "" : summary?.year}</span>
          <div className="chart-legend-custom">
            <div className="legend-item">
              <span style={{ width: 12, height: 3, backgroundColor: "#0ea5e9", display: "inline-block" }}></span>
              <span>Turnover Rate (%)</span>
            </div>
            <div className="legend-item">
              <span style={{ width: 12, height: 3, borderTop: "2px dashed #94a3b8", display: "inline-block" }}></span>
              <span>Turnover Rate (%) - Previous Year</span>
            </div>
          </div>
        </div>
        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={lineData} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                domain={[0, "auto"]}
                tickFormatter={(value) => `${value.toFixed(1).replace(".", ",")}%`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              
              {/* Previous Year Line */}
              <Line
                type="monotone"
                dataKey="ratePrev"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#94a3b8" }}
                activeDot={{ r: 5 }}
                connectNulls={true}
              />
              
              {/* Current Year Line */}
              <Line
                type="monotone"
                dataKey="rate2026"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0ea5e9" }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Turnover by Org Unit Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Turnover by Org. Unit</span>
        </div>
        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={divisionData}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 35, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                domain={[0, "auto"]}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-main)", fontSize: 9, fontWeight: 600 }}
                width={120}
                tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
              />
              <Tooltip
                formatter={(value: any) => [`${value} pax`, "Turnover Count"]}
                contentStyle={{ borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "12px" }}
              />
              <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={12}>
                {/* Labels at the end of bars */}
                <Label
                  content={({ x, y, width, value }: any) => {
                    if (x === undefined || y === undefined || width === undefined) return null;
                    return (
                      <text
                        x={Number(x) + Number(width) + 5}
                        y={Number(y) + 10}
                        fill="var(--text-main)"
                        fontSize={9}
                        fontWeight={700}
                        textAnchor="start"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Voluntary vs Involuntary Donut Chart */}
      <div className="chart-card" style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
        <div style={{ flexGrow: 1, height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span className="chart-title" style={{ alignSelf: "flex-start"}}>Voluntary vs Involuntary</span>
          <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value="Total"
                    position="center"
                    dy={-10}
                    style={{ fontSize: "12px", fill: "var(--text-muted)", fontWeight: 500 }}
                  />
                  <Label
                    value={totalDonut.toString()}
                    position="center"
                    dy={12}
                    style={{ fontSize: "22px", fill: "var(--text-main)", fontWeight: 800 }}
                  />
                </Pie>
                <Tooltip formatter={(value) => [`${value} Karyawan`, "Turnover"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend Panel on the right */}
        <div className="donut-legend-right">
          {donutData.map((item, idx) => (
            <div key={idx} className="donut-legend-row">
              <div className="legend-color-dot" style={{ backgroundColor: item.color }}></div>
              <div>
                <div className="legend-text-label">{item.name}</div>
                <div className="legend-text-sub">
                  {item.value} ({item.percentage.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
