"use client";

import React from "react";
import {
  Users,
  LogOut,
  UserCheck,
  AlertTriangle,
  Calendar,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { KpiData } from "../hooks/useDashboardData";

interface KPICardsProps {
  kpiData?: KpiData;
}

export default function KPICards({ kpiData }: KPICardsProps) {
  // Helper to format numbers with Indonesian decimal comma
  const formatPercentage = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "0,00%";
    return `${val.toFixed(2).replace(".", ",")}%`;
  };

  const formatOneDecimalPercentage = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "0,0%";
    return `${val.toFixed(1).replace(".", ",")}%`;
  };

  const formatNumber = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "0";
    return val.toLocaleString("id-ID");
  };

  const cardsData = [
    {
      title: "Turnover Rate (YTD)",
      value: formatPercentage(kpiData?.turnoverRate),
      trendVal: kpiData?.turnoverRateTrend ?? "+0%",
      isDecreaseGood: true,
      icon: <Users size={20} color="var(--color-blue)" />,
      iconBg: "var(--color-blue-bg)",
    },
    {
      title: "Total Turnover (YTD)",
      value: formatNumber(kpiData?.totalTurnover),
      trendVal: kpiData?.totalTurnoverTrend ?? "+0",
      isDecreaseGood: true,
      icon: <LogOut size={20} color="var(--color-green)" />,
      iconBg: "var(--color-green-bg)",
    },
    {
      title: "Voluntary Turnover Rate",
      value: formatPercentage(kpiData?.voluntaryTurnoverRate),
      trendVal: kpiData?.voluntaryRateTrend ?? "+0%",
      isDecreaseGood: true,
      icon: <UserCheck size={20} color="var(--color-orange)" />,
      iconBg: "var(--color-orange-bg)",
    },
    {
      title: "Involuntary Turnover Rate",
      value: formatPercentage(kpiData?.involuntaryTurnoverRate),
      trendVal: kpiData?.involuntaryRateTrend ?? "+0%",
      isDecreaseGood: true,
      icon: <AlertTriangle size={20} color="var(--color-purple)" />,
      iconBg: "var(--color-purple-bg)",
    },
    {
      title: "Avg. Length of Service",
      value: kpiData ? `${kpiData.avgLengthOfService.toFixed(2).replace(".", ",")} Tahun` : "0,00 Tahun",
      trendVal: kpiData?.avgServiceTrend ? `${kpiData.avgServiceTrend} Thn` : "+0 Thn",
      isDecreaseGood: false,
      icon: <Calendar size={20} color="var(--color-blue-grey)" />,
      iconBg: "var(--color-blue-grey-bg)",
    },
    {
      title: "Turnover < 1 Year",
      value: formatOneDecimalPercentage(kpiData?.turnoverWithinOneYearRate),
      trendVal: kpiData?.underOneYearTrend ?? "+0%",
      isDecreaseGood: true,
      icon: <AlertTriangle size={20} color="var(--color-red)" />,
      iconBg: "var(--color-red-bg)",
    },
    {
      title: "Total Employee",
      value: formatNumber(kpiData?.totalEmployee),
      trendVal: kpiData?.employeeTrend ?? "+0",
      isDecreaseGood: false,
      icon: <TrendingUp size={20} color="var(--color-indigo)" />,
      iconBg: "var(--color-indigo-bg)",
    },
    {
      title: "New Hire (YTD)",
      value: formatNumber(kpiData?.newHire),
      trendVal: kpiData?.newHireTrend ?? "+0",
      isDecreaseGood: false,
      icon: <UserPlus size={20} color="var(--color-mint)" />,
      iconBg: "var(--color-mint-bg)",
    },
  ];

  return (
    <div className="kpi-grid">
      {cardsData.map((card, idx) => {
        const trendValStr = card.trendVal;
        const isNegativeTrend = trendValStr.startsWith("-");
        const isZeroTrend = trendValStr.startsWith("+0") || trendValStr.startsWith("-0") || trendValStr === "0" || trendValStr === "+0%" || trendValStr === "-0%";
        
        // Determine whether trend is good (green) or bad (red) based on business logic
        let trendClass = "positive"; // Default to green
        if (!isZeroTrend) {
          if (card.isDecreaseGood) {
            trendClass = isNegativeTrend ? "positive" : "negative";
          } else {
            trendClass = isNegativeTrend ? "negative" : "positive";
          }
        }

        return (
          <div key={idx} className="kpi-card">
            <div
              className="kpi-icon-wrapper"
              style={{ backgroundColor: card.iconBg }}
            >
              {card.icon}
            </div>
            <div className="kpi-content">
              <span className="kpi-title" title={card.title}>
                {card.title}
              </span>
              <span className="kpi-value">{card.value}</span>
              <div className="kpi-trend">
                <span className="kpi-comparison">vs. Previous Period</span>
                <span
                  className={`kpi-trend-val ${trendClass}`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {isNegativeTrend ? (
                    <ArrowDownRight size={10} style={{ marginRight: "1px" }} />
                  ) : !isZeroTrend ? (
                    <ArrowUpRight size={10} style={{ marginRight: "1px" }} />
                  ) : null}
                  {trendValStr.replace(/[+-]/, "")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

