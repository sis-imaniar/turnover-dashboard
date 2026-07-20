import { useState, useEffect, useCallback } from "react";

export interface DashboardFilters {
  year?: number | null;
  month?: string | null;
  months?: number[] | null;
  period?: string | null;
  quarter?: number | null;
  division?: string | null;
  orgUnit?: string | null;
  location?: string | null;
  jobLevel?: string | null;
  reason?: string | null;
  tenure?: string | null;
}

export interface KpiData {
  totalEmployee: number;
  totalTurnover: number;
  turnoverRate: number;
  voluntaryTurnoverRate: number;
  involuntaryTurnoverRate: number;
  avgLengthOfService: number;
  turnoverWithinOneYearRate: number;
  newHire: number;
  turnoverRateTrend: string;
  totalTurnoverTrend: string;
  voluntaryRateTrend: string;
  involuntaryRateTrend: string;
  avgServiceTrend: string;
  underOneYearTrend: string;
  employeeTrend: string;
  newHireTrend: string;
}

export interface ChartDataEntry {
  label: string;
  value: number;
}

export interface TrendChartEntry {
  month: string;
  monthly: number | null;
  previous: number | null;
  ytd: number | null;
}

export interface YearlyTrendEntry {
  year: string;
  voluntary: number;
  involuntary: number;
  rate: number;
}

export interface MonthlyTurnoverEntry {
  month: string;
  count: number;
  percentage: number;
}

export interface JobsiteChartEntry {
  name: string;
  endContract: number;
  medicalUnfit: number;
  pelanggaran: number;
  resign: number;
  turnover: number;
}

export interface DashboardSummary {
  year: number;
  kpis: KpiData;
  trendChart: TrendChartEntry[];
  yearlyTrend: YearlyTrendEntry[];
  monthlyTurnover: MonthlyTurnoverEntry[];
  divisionChart: ChartDataEntry[];
  reasonChart: ChartDataEntry[];
  tenureChart: ChartDataEntry[];
  categoryChart: ChartDataEntry[];
  jobsiteChart: JobsiteChartEntry[];
}

export interface EmployeeRow {
  personnelNo: string;
  completeName: string;
  joinDate: string;
  terminateDate: string;
  department: string;
  division: string;
  organizationUnitName: string;
  positionNameFirst: string;
  terminateReasonForAction: string;
  personnelAreaName: string;
  periodeOfEmployment: string;
  serviceLength: string;
  category: string;
  jobGroup?: string;
}

export interface PagedResponse<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  page: number;
}

const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.replace(/\/+$/, "").replace(/\/api$/i, "");

// Build candidate API hosts to avoid single-point failure on dev/staging host differences.
const getApiBaseCandidates = (): string[] => {
  // In browser, always go through Next.js API proxy (/api) to avoid CORS issues.
  if (typeof window !== "undefined") {
    return [""];
  }

  const candidates: string[] = [""];

  if (process.env.NEXT_PUBLIC_API_URL) {
    candidates.push(normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL));
  }

  candidates.push("http://localhost:5079");

  return Array.from(new Set(candidates));
};

const API_BASE_CANDIDATES = getApiBaseCandidates();
const REQUEST_TIMEOUT_MS = 12000;
let preferredApiBase: string | null = null;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchFromApi = async (path: string, options: RequestInit = {}) => {
  let lastError: unknown = null;

  const orderedBases = preferredApiBase
    ? [preferredApiBase, ...API_BASE_CANDIDATES.filter((base) => base !== preferredApiBase)]
    : API_BASE_CANDIDATES;

  for (const baseUrl of orderedBases) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}${path}`, options);
      preferredApiBase = baseUrl;
      return response;
    } catch (err: any) {
      lastError = err;
    }
  }

  if ((lastError as any)?.name === "AbortError") {
    throw new Error("API request timed out on all configured hosts");
  }

  throw new Error("Unable to reach API server on configured hosts");
};

const toUserFriendlyError = (err: any, fallbackMessage: string): string => {
  const rawMessage = err?.message || "";
  if (rawMessage.includes("Unable to reach API server on configured hosts")) {
    return "Backend API tidak dapat diakses. Pastikan service backend berjalan dan NEXT_PUBLIC_API_URL sudah benar.";
  }
  if (rawMessage.includes("timed out") || err?.name === "AbortError") {
    return "Request ke backend timeout. Coba lagi beberapa saat atau cek koneksi backend.";
  }
  if (rawMessage.toLowerCase().includes("failed to fetch")) {
    return "Gagal menghubungi API. Pastikan frontend berjalan dengan restart terbaru dan backend dapat diakses dari server Next.js.";
  }
  return rawMessage || fallbackMessage;
};

export function useDashboardData(filters: DashboardFilters) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tableData, setTableData] = useState<PagedResponse<EmployeeRow> | null>(null);
  const [jobsiteChart, setJobsiteChart] = useState<JobsiteChartEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobsiteData = useCallback(async () => {
    try {
      const response = await fetchFromApi("/api/dashboard/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, pagination: { page: 1, pageSize: 5000 } }),
      });
      if (!response.ok) return;
      const data: PagedResponse<EmployeeRow> = await response.json();
      const allRows = data.data || [];

      // Group by personnelAreaName
      const groups: { [key: string]: EmployeeRow[] } = {};
      allRows.forEach((row) => {
        const area = row.personnelAreaName || "Unknown";
        if (!groups[area]) groups[area] = [];
        groups[area].push(row);
      });

      const chartEntries: JobsiteChartEntry[] = Object.keys(groups).map((area) => {
        const rows = groups[area];

        let endContract = 0;
        let medicalUnfit = 0;
        let pelanggaran = 0;
        let resign = 0;

        rows.forEach((row) => {
          const reason = (row.terminateReasonForAction || "").toUpperCase();
          if (reason.includes("END CONTRACT") || reason.includes("KONTRAK")) {
            endContract++;
          } else if (reason.includes("MEDICAL") || reason.includes("UNFIT") || reason.includes("SAKIT")) {
            medicalUnfit++;
          } else if (reason.includes("PELANGGARAN") || reason.includes("DISIPLIN")) {
            pelanggaran++;
          } else if (reason.includes("RESIGN") || reason.includes("MENGUNDURKAN")) {
            resign++;
          }
        });

        const totalTurnover = rows.length;
        const rate = Number(((totalTurnover / 5000.0) * 100).toFixed(2));

        return {
          name: area,
          endContract,
          medicalUnfit,
          pelanggaran,
          resign,
          turnover: rate,
        };
      });

      setJobsiteChart(chartEntries);
    } catch (err) {
      // Keep this silent to avoid noisy runtime overlay when backend is down.
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    const sanitizedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null)
    );

    try {
      const response = await fetchFromApi("/api/dashboard/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedFilters),
      });
      if (!response.ok) throw new Error(`Summary API Error: ${response.status}`);
      const data = await response.json();
      setSummary(data);
      if (Array.isArray(data?.jobsiteChart) && data.jobsiteChart.length > 0) {
        setJobsiteChart(data.jobsiteChart);
      } else {
        // Fallback only when summary does not provide jobsite breakdown.
        fetchJobsiteData();
      }
    } catch (err: any) {
      const message = toUserFriendlyError(err, "Failed to fetch summary data");
      setSummary(null);
      setError(message);
    }
  }, [filters, fetchJobsiteData]);

  const fetchTable = useCallback(
    async (page: number = 1, pageSize: number = 5) => {
      try {
        const response = await fetchFromApi("/api/dashboard/table", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, pagination: { page, pageSize } }),
        });
        if (!response.ok) throw new Error(`Table API Error: ${response.status}`);
        const data = await response.json();
        setTableData(data);
      } catch (err: any) {
        const message = toUserFriendlyError(err, "Failed to fetch table data");
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSummary();
    fetchTable(1, 5);
  }, [filters, fetchSummary, fetchTable]);

  return {
    summary: summary ? { ...summary, jobsiteChart } : null,
    tableData,
    loading,
    error,
    fetchTable,
    refreshData: () => {
      fetchSummary();
      fetchTable(1, 5);
    },
  };
}
