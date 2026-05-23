"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  Card,
  Button,
  Input,
  Select,
  LoadingSpinner,
  Alert,
  ProgressBar,
} from "@/components/ui";
import { Download, Upload, ChevronUp, ChevronDown, ChevronsUpDown, LayoutGrid, AlignJustify, Plus } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  eventCode: string;
  title: string;
  activityType: string | null;
  eventDate: string | null;
  eventDateTo: string | null;
  year: number | null;
  studentCount: number;
  facultyCount: number;
  externalCount: number;
  totalParticipants: number;
  hoursPerEvent: number | null;
  totalHoursEngaged: number | null;
  amountSpent: number | null;
  beneficiaryText: string | null;
  beneficiaryCount: number | null;
  locationText: string | null;
  subUnitName: string | null;
  reportUrl: string | null;
  socialUrl: string | null;
  goals: Array<{ sdgGoal: { goalNumber: number; name: string } }>;
}

type SortField = keyof Event | "sdgGoal";
type SortOrder = "asc" | "desc";

export default function ScoutsGuidesPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({ year: "", activityType: "", subUnit: "", search: "" });
  const [sortField, setSortField] = useState<SortField>("eventCode");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [showAll, setShowAll] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
  }>({ show: false, type: "info", title: "" });

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const unitsRes = await fetch("/api/masters/units");
      const unitsData = await unitsRes.json();
      const unit = unitsData.data?.find((u: { code: string }) => u.code === "SCOUTS_AND_GUIDES");

      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "1000");
      if (unit?.id) params.append("unitId", unit.id);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.success ? (data.data || []) : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const showAlert = (type: "success" | "error" | "info" | "warning", title: string, message?: string) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => setAlert({ show: false, type: "info", title: "" }), 5000);
  };

  const handleCellClick = (rowId: string, field: string, currentValue: unknown) => {
    setEditingCell({ rowId, field });
    setEditValue(String(currentValue ?? ""));
  };

  const handleCellSave = async (eventId: string, field: string, value: string) => {
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {};
      if (field === "title") updateData.title = value;
      else if (field === "eventDate") updateData.eventDate = value;
      else if (field === "year") updateData.year = parseInt(value) || null;
      else if (field === "activityType") updateData.activityType = value;
      else if (field === "studentCount") updateData.studentCount = parseInt(value) || 0;
      else if (field === "facultyCount") updateData.facultyCount = parseInt(value) || 0;
      else if (field === "externalCount") updateData.externalCount = parseInt(value) || 0;
      else if (field === "locationText") updateData.locationText = value;
      else if (field === "subUnitName") updateData.subUnitName = value;
      else if (field === "hoursPerEvent") updateData.hoursPerEvent = parseFloat(value) || 0;
      else if (field === "amountSpent") updateData.amountSpent = parseFloat(value) || 0;
      else if (field === "beneficiaryText") updateData.beneficiaryText = value;
      else if (field === "beneficiaryCount") updateData.beneficiaryCount = parseInt(value) || 0;
      else if (field === "reportUrl") updateData.reportUrl = value;

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update");

      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, ...updateData } : e))
      );
      setEditingCell(null);
      setEditValue("");
    } catch {
      showAlert("error", "Save Failed", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCellBlur = (eventId: string, field: string) => {
    if (editingCell?.rowId === eventId && editingCell?.field === field) {
      handleCellSave(eventId, field, editValue);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, eventId: string, field: string) => {
    if (e.key === "Escape") { setEditingCell(null); setEditValue(""); }
    else if (e.key === "Enter") handleCellSave(eventId, field, editValue);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filters.year && e.year?.toString() !== filters.year) return false;
      if (filters.activityType && e.activityType !== filters.activityType) return false;
      if (filters.subUnit && e.subUnitName !== filters.subUnit) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (
          e.title.toLowerCase().includes(s) ||
          e.eventCode.toLowerCase().includes(s) ||
          e.locationText?.toLowerCase().includes(s) ||
          e.subUnitName?.toLowerCase().includes(s) ||
          e.beneficiaryText?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [events, filters]);

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    sorted.sort((a, b) => {
      let aVal: unknown;
      let bVal: unknown;
      if (sortField === "sdgGoal") {
        aVal = a.goals[0]?.sdgGoal.goalNumber ?? 0;
        bVal = b.goals[0]?.sdgGoal.goalNumber ?? 0;
      } else {
        aVal = a[sortField as keyof Event];
        bVal = b[sortField as keyof Event];
      }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredEvents, sortField, sortOrder]);

  const paginatedEvents = useMemo(() => {
    if (showAll) return sortedEvents;
    return sortedEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [sortedEvents, currentPage, pageSize, showAll]);

  const totalPages = Math.ceil(sortedEvents.length / pageSize);

  useEffect(() => { setCurrentPage(1); }, [showAll]);

  const stats = useMemo(() => {
    const toNum = (v: unknown) => { const n = Number(v); return isFinite(n) ? n : 0; };
    return {
      total: filteredEvents.length,
      totalStudents: filteredEvents.reduce((s, e) => s + toNum(e.studentCount), 0),
      totalFaculty: filteredEvents.reduce((s, e) => s + toNum(e.facultyCount), 0),
      totalExternal: filteredEvents.reduce((s, e) => s + toNum(e.externalCount), 0),
      totalHoursEngaged: filteredEvents.reduce((s, e) => s + toNum(e.totalHoursEngaged), 0),
      totalAmountSpent: filteredEvents.reduce((s, e) => s + toNum(e.amountSpent), 0),
    };
  }, [filteredEvents]);

  const uniqueYears = Array.from(new Set(events.map((e) => e.year).filter(Boolean))).sort((a, b) => (b as number) - (a as number));
  const uniqueActivityTypes = Array.from(new Set(events.map((e) => e.activityType).filter(Boolean)));
  const uniqueSubUnits = Array.from(new Set(events.map((e) => e.subUnitName).filter(Boolean))).sort();

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const EditableCell = ({
    eventId, field, value, type = "text", className = "", maxWidth,
  }: {
    eventId: string; field: string; value: unknown; type?: "text" | "number" | "date"; className?: string; maxWidth?: string;
  }) => {
    const isEditing = editingCell?.rowId === eventId && editingCell?.field === field;

    const getDisplayValue = () => {
      if (value === null || value === undefined || value === "") return "-";
      if ((field === "eventDate" || field === "eventDateTo") && value) {
        try { return format(new Date(value as string), "dd.MM.yyyy"); } catch { return String(value); }
      }
      if (field === "hoursPerEvent" && value) return Number(value).toFixed(1);
      if (field === "totalHoursEngaged" && value) return Number(value).toFixed(0);
      if (field === "amountSpent" && value) return `₹${Number(value).toLocaleString()}`;
      if (field === "reportUrl" && value) {
        return (
          <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
            Link
          </a>
        );
      }
      return String(value);
    };

    if (isEditing) {
      const inputClass = "w-full px-2 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none";
      if (type === "date") {
        const dateVal = value ? (typeof value === "string" ? value.split("T")[0] : format(new Date(value as string), "yyyy-MM-dd")) : "";
        return (
          <input type="date" defaultValue={dateVal} onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellBlur(eventId, field)} onKeyDown={(e) => handleCellKeyDown(e, eventId, field)}
            className={inputClass} autoFocus />
        );
      }
      if (type === "number") {
        return (
          <input type="number" step={field === "hoursPerEvent" ? "0.1" : "1"} defaultValue={String(value ?? "")}
            onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleCellBlur(eventId, field)}
            onKeyDown={(e) => handleCellKeyDown(e, eventId, field)} className={inputClass} autoFocus />
        );
      }
      return (
        <input type="text" defaultValue={String(value ?? "")} onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellBlur(eventId, field)} onKeyDown={(e) => handleCellKeyDown(e, eventId, field)}
          className={inputClass} autoFocus />
      );
    }

    return (
      <div
        className={`cursor-pointer hover:bg-blue-50 ${className} ${maxWidth ? "cell-scroll overflow-x-auto" : ""}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={() => handleCellClick(eventId, field, value)}
        title={typeof value === "string" || typeof value === "number" ? String(value) : ""}
      >
        {getDisplayValue()}
      </div>
    );
  };

  async function handleImport() {
    if (!selectedFile) { showAlert("warning", "No file selected", "Please select an Excel file"); return; }
    setUploading(true);
    setImportProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      setImportProgress(30);
      const res = await fetch("/api/unit-events/scouts-guides/import", { method: "POST", body: formData });
      setImportProgress(70);
      const data = await res.json();
      setImportProgress(100);
      if (data.success) {
        showAlert("success", "Import Successful!", `Imported ${data.imported} event${data.imported !== 1 ? "s" : ""} to Scouts & Guides.`);
        setShowImportModal(false);
        setSelectedFile(null);
        setImportProgress(0);
        fetchEvents();
      } else {
        showAlert("error", "Import Failed", data.error || "Unknown error");
        setImportProgress(0);
      }
    } catch (err) {
      showAlert("error", "Import Failed", err instanceof Error ? err.message : "Please try again");
      setImportProgress(0);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  const thClass = "px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50";
  const thSortClass = `${thClass} cursor-pointer hover:bg-gray-100`;

  return (
    <div className="flex flex-col h-[calc(100vh-1.5rem)] overflow-hidden">
      {alert.show && (
        <Alert type={alert.type} title={alert.title} message={alert.message}
          onClose={() => setAlert({ show: false, type: "info", title: "" })} />
      )}

      {/* Sticky Top Section */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Scouts & Guides Events</h1>
            <div className="flex gap-2">
              <Link href="/events/scouts-guides/new">
                <Button variant="default" className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  New Entry
                </Button>
              </Link>
              <Button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                <Upload className="h-3.5 w-3.5" />
                Import Excel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Year:</label>
                <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="w-28 text-xs px-2 py-1">
                  <option value="">All Years</option>
                  {uniqueYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Sub-unit:</label>
                <Select value={filters.subUnit} onChange={(e) => setFilters({ ...filters, subUnit: e.target.value })} className="w-36 text-xs px-2 py-1">
                  <option value="">All</option>
                  {uniqueSubUnits.map((s) => <option key={s as string} value={s as string}>{s}</option>)}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Activity Type:</label>
                <Select value={filters.activityType} onChange={(e) => setFilters({ ...filters, activityType: e.target.value })} className="w-40 text-xs px-2 py-1">
                  <option value="">All Types</option>
                  {uniqueActivityTypes.map((t) => <option key={t as string} value={t as string}>{t}</option>)}
                </Select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <Input type="text" placeholder="Search by name, location, sub-unit..." value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="text-xs py-1.5 px-3" />
              </div>
              {(filters.year || filters.activityType || filters.subUnit || filters.search) && (
                <Button onClick={() => setFilters({ year: "", activityType: "", subUnit: "", search: "" })} variant="outline" className="px-3 py-1 text-xs">
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-xs text-gray-600"><strong className="font-semibold">{sortedEvents.length}</strong> records</div>
              <Button onClick={() => setShowAll(!showAll)} variant="default"
                className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                {showAll ? <><AlignJustify className="h-3.5 w-3.5" />Show Paginated</> : <><LayoutGrid className="h-3.5 w-3.5" />Show All</>}
              </Button>
              {!showAll && (
                <>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-600 text-base">‹</button>
                  <div className="text-xs text-gray-700">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></div>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-600 text-base">›</button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-7 gap-2">
            <Card className="border-2" style={{ borderColor: "#1f2937" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-gray-900">{stats.total}</div><div className="text-xs text-gray-600">Total Events</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-cyan-600">{Math.round(stats.totalHoursEngaged).toLocaleString()}</div><div className="text-xs text-gray-600">Engaged Hours</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-emerald-600">₹{Math.round(stats.totalAmountSpent).toLocaleString()}</div><div className="text-xs text-gray-600">Amount Spent</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</div><div className="text-xs text-gray-600">Students</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-purple-600">{stats.totalFaculty.toLocaleString()}</div><div className="text-xs text-gray-600">Faculty</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5"><div className="text-lg font-bold text-indigo-600">{stats.totalExternal.toLocaleString()}</div><div className="text-xs text-gray-600">External</div></div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-rose-600">{uniqueSubUnits.length}</div>
                <div className="text-xs text-gray-600">Sub-units</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white overflow-hidden border-t border-gray-200 flex-1 flex flex-col border-x border-b">
          <div className="flex-1 overflow-x-auto overflow-y-auto cell-scroll">
            <table className="w-full text-xs min-w-[2400px]" style={{ borderCollapse: "collapse" }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className={thClass}>S.No</th>
                  <th className={thSortClass} onClick={() => handleSort("subUnitName")}>
                    <div className="flex items-center">Sub-unit<SortIcon field="subUnitName" /></div>
                  </th>
                  <th className={thSortClass} onClick={() => handleSort("title")}>
                    <div className="flex items-center">Activity Name<SortIcon field="title" /></div>
                  </th>
                  <th className={thSortClass} onClick={() => handleSort("eventDate")}>
                    <div className="flex items-center">Date From<SortIcon field="eventDate" /></div>
                  </th>
                  <th className={thClass}>Date To</th>
                  <th className={thSortClass} onClick={() => handleSort("year")}>
                    <div className="flex items-center">Year<SortIcon field="year" /></div>
                  </th>
                  <th className={thSortClass} onClick={() => handleSort("activityType")}>
                    <div className="flex items-center">Type<SortIcon field="activityType" /></div>
                  </th>
                  <th className={thSortClass} onClick={() => handleSort("sdgGoal")}>
                    <div className="flex items-center">SDG Goals<SortIcon field="sdgGoal" /></div>
                  </th>
                  <th className={thClass + " text-center"}>Students</th>
                  <th className={thClass + " text-center"}>Faculty</th>
                  <th className={thClass + " text-center"}>External</th>
                  <th className={thSortClass + " text-center"} onClick={() => handleSort("totalParticipants")}>
                    <div className="flex items-center justify-center">Total<SortIcon field="totalParticipants" /></div>
                  </th>
                  <th className={thClass}>Location</th>
                  <th className={thClass + " text-center"}>Hours/Event</th>
                  <th className={thSortClass + " text-center"} onClick={() => handleSort("totalHoursEngaged")}>
                    <div className="flex items-center justify-center">Total Hours<SortIcon field="totalHoursEngaged" /></div>
                  </th>
                  <th className={thSortClass + " text-right"} onClick={() => handleSort("amountSpent")}>
                    <div className="flex items-center justify-end">Amount Spent<SortIcon field="amountSpent" /></div>
                  </th>
                  <th className={thClass}>Beneficiaries</th>
                  <th className={thClass + " text-center"}>No. of Beneficiaries</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap bg-gray-50">Report Link</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="px-4 py-12 text-center text-gray-500">
                      <p className="text-lg font-medium">No events found</p>
                      <p className="text-sm">Import data or adjust your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 text-gray-700 whitespace-nowrap border-r border-b border-gray-200">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="subUnitName" value={event.subUnitName}
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" maxWidth="150px" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="title" value={event.title}
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" maxWidth="280px" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="eventDate"
                          value={event.eventDate ? event.eventDate.split("T")[0] : ""}
                          type="date" className="px-2 py-1 text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="px-2 py-1 text-gray-700 whitespace-nowrap border-r border-b border-gray-200">
                        {event.eventDateTo ? (() => { try { return format(new Date(event.eventDateTo), "dd.MM.yyyy"); } catch { return event.eventDateTo; } })() : "-"}
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="year" value={event.year} type="number"
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="activityType" value={event.activityType}
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" maxWidth="200px" />
                      </td>
                      <td className="px-2 py-1 text-gray-700 whitespace-nowrap border-r border-b border-gray-200">
                        {event.goals.length === 17 ? "All 17 Goals" : event.goals.map((g) => g.sdgGoal.goalNumber).join(", ") || "-"}
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="studentCount" value={event.studentCount} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="facultyCount" value={event.facultyCount} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="externalCount" value={event.externalCount} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="px-2 py-1 text-center text-gray-700 whitespace-nowrap border-r border-b border-gray-200">
                        {event.totalParticipants}
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="locationText" value={event.locationText}
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" maxWidth="200px" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="hoursPerEvent" value={event.hoursPerEvent} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="totalHoursEngaged" value={event.totalHoursEngaged} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="amountSpent" value={event.amountSpent} type="number"
                          className="px-2 py-1 text-right text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="beneficiaryText" value={event.beneficiaryText}
                          className="px-2 py-1 text-gray-700 whitespace-nowrap" maxWidth="200px" />
                      </td>
                      <td className="border-r border-b border-gray-200">
                        <EditableCell eventId={event.id} field="beneficiaryCount" value={event.beneficiaryCount} type="number"
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                      <td className="border-b border-gray-200">
                        <EditableCell eventId={event.id} field="reportUrl" value={event.reportUrl}
                          className="px-2 py-1 text-center text-gray-700 whitespace-nowrap" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Scouts & Guides Excel</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload the Excel file in the Scouts & Guides format (two header rows, school/district in column A).
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Excel File</label>
                <input type="file" accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
              </div>
              {uploading && (
                <ProgressBar progress={importProgress} label="Importing events..." showPercentage />
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowImportModal(false); setSelectedFile(null); setImportProgress(0); }} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!selectedFile || uploading} loading={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
