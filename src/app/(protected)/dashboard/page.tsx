"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { LoadingSpinner } from "@/components/ui";
import { DashboardAnalytics } from "@/modules/shared/types";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar, Users, Heart, Clock, DollarSign, Zap, RefreshCw, ChevronDown,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const UNIT_COLORS: Record<string, string> = {
  NSS: "#2563eb",
  UBA: "#16a34a",
  SCOUTS_AND_GUIDES: "#d97706",
  INNOVATION_ECOSYSTEM: "#7c3aed",
  HOUSEHOLD_SURVEY_SIRD: "#0891b2",
  BLOOD_DONATION: "#dc2626",
};
const PALETTE = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#dc2626", "#be185d", "#0d9488"];

function fmt(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
function unitShort(code: string) {
  const m: Record<string, string> = {
    NSS: "NSS", UBA: "UBA", SCOUTS_AND_GUIDES: "Scouts",
    INNOVATION_ECOSYSTEM: "Innov.", HOUSEHOLD_SURVEY_SIRD: "HH Survey", BLOOD_DONATION: "Blood",
  };
  return m[code] || code;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function CT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded px-2.5 py-1.5 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-0.5">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          <span className="font-medium">{p.name}: </span>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-2.5 flex items-center gap-3">
      <div className="shrink-0 rounded-md p-1.5" style={{ background: accent + "18" }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 leading-tight">{typeof value === "number" ? fmt(value) : value}</p>
        <p className="text-[11px] text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function CC({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// ─── Donut label ──────────────────────────────────────────────────────────────
const RAD = Math.PI / 180;
function DL({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (!percent || percent < 0.08) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * RAD)} y={cy + r * Math.sin(-midAngle * RAD)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/analytics");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  useEffect(() => { load(); }, []);

  const years = useMemo(() => data ? data.eventsByYear.map((r) => r.year).sort((a, b) => b - a) : [], [data]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-6 text-gray-400 text-sm">Failed to load analytics.</div>;

  const trendData = data.eventsByYear.map((r) => ({
    year: r.year,
    Events: r.count,
    Participants: data.metricsByYear.find((m) => m.year === r.year)?.participants || 0,
  }));

  const unitDonut = data.eventsByUnit.map((u) => ({
    name: unitShort(u.unitCode),
    value: u.count,
    fill: UNIT_COLORS[u.unitCode] || PALETTE[0],
  }));

  const partBar = data.participantsByUnit.map((u) => ({
    name: unitShort(u.unitCode),
    Students: u.students,
    Faculty: u.faculty,
    External: u.external,
  }));

  const actPie = data.eventsByActivityType.slice(0, 7).map((a, i) => ({
    name: a.activityType.length > 20 ? a.activityType.slice(0, 20) + "…" : a.activityType,
    value: a.count,
    fill: PALETTE[i % PALETTE.length],
  }));

  const sdgBar = data.eventsBySDG.filter((s) => s.count > 0).slice(0, 12).map((s) => ({
    name: `SDG ${s.goalNumber}`,
    count: s.count,
    tip: s.goalName,
  }));

  const bloodData = data.bloodDonationHistory.map((r) => ({
    year: r.year,
    Camp: r.campDonors,
    Regular: r.regularDonors,
    Total: r.totalDonors,
  }));

  const metricsData = data.metricsByYear.map((r) => ({
    year: r.year,
    Participants: r.participants,
    Hours: Math.round(r.hours),
    "₹ Spent": Math.round(r.amount),
  }));

  return (
    <div className="space-y-3 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {user?.name} · Sri Sairam Institutions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 pr-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-gray-600 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiCard label="Total Events" value={data.totalEvents} icon={<Calendar className="h-4 w-4" />} accent="#2563eb" />
        <KpiCard label="Participants" value={data.totalParticipants} icon={<Users className="h-4 w-4" />} accent="#16a34a" />
        <KpiCard label="Beneficiaries" value={data.totalBeneficiaries} icon={<Heart className="h-4 w-4" />} accent="#dc2626" />
        <KpiCard label="Hours Engaged" value={Math.round(data.totalHoursEngaged)} icon={<Clock className="h-4 w-4" />} accent="#d97706" />
        <KpiCard label="Amount Spent" value={`₹${fmt(data.totalAmountSpent)}`} icon={<DollarSign className="h-4 w-4" />} accent="#7c3aed" />
        <KpiCard label="Blood Donors" value={data.latestBloodDonationTotal} icon={<Zap className="h-4 w-4" />} accent="#dc2626" />
      </div>

      {/* Row 2: Trend + Unit Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <CC title="Yearly Events & Participants Trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#94a3b8" }} width={32} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} width={38} />
              <Tooltip content={<CT />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="l" type="monotone" dataKey="Events" stroke="#2563eb" strokeWidth={2} fill="url(#eGrad)" dot={{ r: 2 }} />
              <Line yAxisId="r" type="monotone" dataKey="Participants" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CC>

        <CC title="Events by Unit">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={unitDonut} cx="50%" cy="50%" innerRadius={40} outerRadius={72}
                dataKey="value" labelLine={false} label={DL}>
                {unitDonut.map((e, i) => <Cell key={i} fill={e.fill} stroke="white" strokeWidth={1.5} />)}
              </Pie>
              <Tooltip content={<CT />} />
              <Legend formatter={(v) => <span style={{ fontSize: 10, color: "#64748b" }}>{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </CC>
      </div>

      {/* Row 3: Participant Breakdown + Activity Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CC title="Participant Breakdown by Unit">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={partBar} margin={{ top: 2, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={32} />
              <Tooltip content={<CT />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Students" stackId="a" fill="#2563eb" />
              <Bar dataKey="Faculty" stackId="a" fill="#16a34a" />
              <Bar dataKey="External" stackId="a" fill="#d97706" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CC>

        <CC title="Activity Type Distribution">
          {actPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={actPie} cx="38%" cy="50%" outerRadius={72} dataKey="value"
                  label={({ percent }: { percent?: number }) => percent && percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : ""}
                  labelLine={false}>
                  {actPie.map((e, i) => <Cell key={i} fill={e.fill} stroke="white" strokeWidth={1.5} />)}
                </Pie>
                <Tooltip content={<CT />} />
                <Legend layout="vertical" align="right" verticalAlign="middle"
                  formatter={(v) => <span style={{ fontSize: 10, color: "#64748b" }}>{v}</span>} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[170px] flex items-center justify-center text-gray-400 text-xs">No activity type data</div>
          )}
        </CC>
      </div>

      {/* Row 4: SDG Coverage + Blood Donation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CC title="SDG Goal Coverage">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sdgBar} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 42 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} width={42} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 shadow rounded px-2 py-1.5 text-xs max-w-[180px]">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-gray-500 text-[10px]">{d.tip}</p>
                    <p className="text-blue-600">{payload[0].value} events</p>
                  </div>
                );
              }} />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={14}>
                {sdgBar.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CC>

        <CC title="Blood Donation Trend">
          {bloodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={bloodData} margin={{ top: 2, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={32} />
                <Tooltip content={<CT />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Camp" fill="#fca5a5" maxBarSize={24} />
                <Bar dataKey="Regular" fill="#f87171" maxBarSize={24} />
                <Line type="monotone" dataKey="Total" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-xs">No blood donation data yet</div>
          )}
        </CC>
      </div>

      {/* Row 5: Yearly Metrics + Unit Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CC title="Yearly Metrics (Participants · Hours · Amount)">
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={metricsData} margin={{ top: 2, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#94a3b8" }} width={36} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
              <Tooltip content={<CT />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="Participants" fill="#2563eb" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={28} />
              <Line yAxisId="r" type="monotone" dataKey="Hours" stroke="#d97706" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line yAxisId="r" type="monotone" dataKey="₹ Spent" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CC>

        <CC title="Unit Event Share">
          <div className="space-y-2">
            {data.eventsByUnit.sort((a, b) => b.count - a.count).map((u) => {
              const pct = data.totalEvents ? Math.round((u.count / data.totalEvents) * 100) : 0;
              const color = UNIT_COLORS[u.unitCode] || PALETTE[0];
              return (
                <div key={u.unitCode} className="flex items-center gap-2">
                  <p className="w-16 text-[11px] font-medium text-gray-600 truncate shrink-0">{unitShort(u.unitCode)}</p>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full flex items-center px-1.5 transition-all"
                      style={{ width: `${Math.max(pct, 2)}%`, background: color }}>
                      {pct >= 10 && <span className="text-white text-[9px] font-bold">{pct}%</span>}
                    </div>
                  </div>
                  <div className="w-12 text-right shrink-0">
                    <p className="text-[11px] font-semibold text-gray-700">{u.count}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SDG top-5 mini list */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Top SDG Goals</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.eventsBySDG.slice(0, 6).map((s, i) => {
                const max = data.eventsBySDG[0]?.count || 1;
                return (
                  <div key={s.goalNumber} className="flex items-center gap-1.5">
                    <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: PALETTE[i % PALETTE.length] }}>
                      {s.goalNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(s.count / max) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                      </div>
                      <p className="text-[9px] text-gray-400">{s.count} events</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CC>
      </div>
    </div>
  );
}
