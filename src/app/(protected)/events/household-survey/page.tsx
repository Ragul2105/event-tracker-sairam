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
import { Download, Upload, Search, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronDown, ChevronUp, LayoutGrid, AlignJustify, Plus } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  eventCode: string;
  title: string;
  activityType: string | null;
  eventDate: string | null;
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
  reportUrl: string | null;
  socialUrl: string | null;
  goals: Array<{ sdgGoal: { goalNumber: number; name: string } }>;
}

type SortField = keyof Event | 'sdgGoal';
type SortOrder = 'asc' | 'desc';

export default function HouseholdSurveyPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{rowId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    year: "",
    activityType: "",
    search: "",
  });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('eventCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [showAll, setShowAll] = useState(false);
  
  // Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // Alert state
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
  }>({ show: false, type: "info", title: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const unitsRes = await fetch('/api/masters/units');
      const unitsData = await unitsRes.json();
      const unit = unitsData.data?.find((u: any) => u.code === 'HOUSEHOLD_SURVEY_SIRD');
      
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "1000"); // Fetch up to 1000 events (max limit)
      if (unit?.id) params.append("unitId", unit.id);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      
      console.log("Fetch response:", data);
      
      if (data.success) {
        setEvents(data.data || []);
      } else {
        console.error("API error:", data.error);
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle cell click to start editing
  const handleCellClick = (rowId: string, field: string, currentValue: any) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue);
  };

  // Handle cell value change
  const handleCellChange = (value: any) => {
    setEditValue(value);
  };

  // Save cell value
  const handleCellSave = async (eventId: string, field: string, value: any) => {
    try {
      setSaving(true);
      
      // Prepare the update payload
      const updateData: any = {};
      
      // Map field names to API field names
      if (field === 'title') updateData.title = value;
      else if (field === 'eventDate') updateData.eventDate = value;
      else if (field === 'year') updateData.year = parseInt(value) || null;
      else if (field === 'activityType') updateData.activityType = value;
      else if (field === 'studentCount') updateData.studentCount = parseInt(value) || 0;
      else if (field === 'facultyCount') updateData.facultyCount = parseInt(value) || 0;
      else if (field === 'externalCount') updateData.externalCount = parseInt(value) || 0;
      else if (field === 'locationText') updateData.locationText = value;
      else if (field === 'hoursPerEvent') updateData.hoursPerEvent = parseFloat(value) || 0;
      else if (field === 'amountSpent') updateData.amountSpent = parseFloat(value) || 0;
      else if (field === 'beneficiaryText') updateData.beneficiaryText = value;
      else if (field === 'beneficiaryCount') updateData.beneficiaryCount = parseInt(value) || 0;
      else if (field === 'reportUrl') updateData.reportUrl = value;
      else if (field === 'sdgGoals') {
        // Handle SDG goals update (array of goal IDs)
        updateData.goalIds = value;
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updateData, totalParticipants: (updateData.studentCount || event.studentCount) + (updateData.facultyCount || event.facultyCount) + (updateData.externalCount || event.externalCount) }
          : event
      ));

      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to save cell:', error);
      showAlert("error", "Save Failed", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cell blur (auto-save)
  const handleCellBlur = (eventId: string, field: string) => {
    if (editingCell && editingCell.rowId === eventId && editingCell.field === field) {
      handleCellSave(eventId, field, editValue);
    }
  };

  // Cancel editing on Escape
  const handleCellKeyDown = (e: React.KeyboardEvent, eventId: string, field: string) => {
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'Enter') {
      handleCellSave(eventId, field, editValue);
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.year && event.year?.toString() !== filters.year) return false;
      if (filters.activityType && event.activityType !== filters.activityType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          event.eventCode.toLowerCase().includes(searchLower) ||
          event.title.toLowerCase().includes(searchLower) ||
          event.locationText?.toLowerCase().includes(searchLower) ||
          event.beneficiaryText?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [events, filters]);

  // Sort events
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'sdgGoal') {
        aVal = a.goals[0]?.sdgGoal.goalNumber || 0;
        bVal = b.goals[0]?.sdgGoal.goalNumber || 0;
      } else {
        aVal = a[sortField as keyof Event];
        bVal = b[sortField as keyof Event];
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredEvents, sortField, sortOrder]);

  // Paginate
  const paginatedEvents = useMemo(() => {
    if (showAll) {
      return sortedEvents;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEvents.slice(startIndex, startIndex + pageSize);
  }, [sortedEvents, currentPage, pageSize, showAll]);

  const totalPages = Math.ceil(sortedEvents.length / pageSize);
  
  // Reset to page 1 when toggling between modes
  useEffect(() => {
    setCurrentPage(1);
  }, [showAll]);

  // Stats
  const stats = useMemo(() => {
    const toNumber = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const total = filteredEvents.length;
    const totalStudents = filteredEvents.reduce((sum, e) => sum + toNumber(e.studentCount), 0);
    const totalFaculty = filteredEvents.reduce((sum, e) => sum + toNumber(e.facultyCount), 0);
    const totalExternal = filteredEvents.reduce((sum, e) => sum + toNumber(e.externalCount), 0);
    const totalHoursEngaged = filteredEvents.reduce((sum, e) => sum + toNumber(e.totalHoursEngaged), 0);
    const totalAmountSpent = filteredEvents.reduce((sum, e) => sum + toNumber(e.amountSpent), 0);
    const avgParticipantsPerEvent = total > 0
      ? Math.round((totalStudents + totalFaculty + totalExternal) / total)
      : 0;

    return {
      total,
      totalStudents,
      totalFaculty,
      totalExternal,
      totalHoursEngaged,
      totalAmountSpent,
      avgParticipantsPerEvent,
    };
  }, [filteredEvents]);

  // Get unique values for filters
  const uniqueYears = Array.from(new Set(events.map(e => e.year).filter(Boolean))).sort((a, b) => (b as number) - (a as number));
  const uniqueActivityTypes = Array.from(new Set(events.map(e => e.activityType).filter(Boolean)));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Editable Cell Component
  const EditableCell = ({ 
    eventId, 
    field, 
    value, 
    type = 'text',
    className = '',
    maxWidth 
  }: { 
    eventId: string;
    field: string;
    value: any;
    type?: 'text' | 'number' | 'date';
    className?: string;
    maxWidth?: string;
  }) => {
    const isEditing = editingCell?.rowId === eventId && editingCell?.field === field;
    
    // Format display value
    const getDisplayValue = () => {
      if (!value && value !== 0) return '-';
      
      if (field === 'eventDate' && value) {
        try {
          return format(new Date(value), 'dd.MM.yyyy');
        } catch {
          return value;
        }
      }
      
      if (field === 'hoursPerEvent' && value) {
        return Number(value).toFixed(1);
      }
      
      if (field === 'totalHoursEngaged' && value) {
        return Number(value).toFixed(0);
      }
      
      if (field === 'amountSpent' && value) {
        return `₹${Number(value).toLocaleString()}`;
      }
      
      if (field === 'reportUrl' && value) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
            Report Link
          </a>
        );
      }
      
      if (field === 'reportUrl' && !value) {
        return <span className="text-gray-400">NIL</span>;
      }
      
      return value;
    };
    
    if (isEditing) {
      if (type === 'date') {
        const dateValue = value ? (typeof value === 'string' ? value : format(new Date(value), 'yyyy-MM-dd')) : '';
        return (
          <input
            type="date"
            value={editValue || dateValue}
            onChange={(e) => handleCellChange(e.target.value)}
            onBlur={() => handleCellBlur(eventId, field)}
            onKeyDown={(e) => handleCellKeyDown(e, eventId, field)}
            className="w-full px-2 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      } else if (type === 'number') {
        return (
          <input
            type="number"
            step={field === 'hoursPerEvent' ? '0.1' : '1'}
            value={editValue ?? value ?? ''}
            onChange={(e) => handleCellChange(e.target.value)}
            onBlur={() => handleCellBlur(eventId, field)}
            onKeyDown={(e) => handleCellKeyDown(e, eventId, field)}
            className="w-full px-2 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      } else {
        return (
          <input
            type="text"
            value={editValue ?? value ?? ''}
            onChange={(e) => handleCellChange(e.target.value)}
            onBlur={() => handleCellBlur(eventId, field)}
            onKeyDown={(e) => handleCellKeyDown(e, eventId, field)}
            className="w-full px-2 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      }
    }

    const cellClasses = `cursor-pointer hover:bg-blue-50 ${className}`;
    const scrollableClasses = maxWidth ? "cell-scroll overflow-x-auto" : "";

    return (
      <div 
        className={`${cellClasses} ${scrollableClasses}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={() => handleCellClick(eventId, field, value)}
        title={typeof value === 'string' || typeof value === 'number' ? value?.toString() : ''}
      >
        {getDisplayValue()}
      </div>
    );
  };

  const showAlert = (type: "success" | "error" | "info" | "warning", title: string, message?: string) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => {
      setAlert({ show: false, type: "info", title: "" });
    }, 5000);
  };

  async function handleDownloadTemplate() {
    const link = document.createElement("a");
    link.href = "/household-survey-template.xlsx";
    link.download = "household-survey-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleImport() {
    if (!selectedFile) {
      showAlert("warning", "No file selected", "Please select an Excel file to import");
      return;
    }

    setUploading(true);
    setImportProgress(0);
    try {
      setImportProgress(10);

      const formData = new FormData();
      formData.append("file", selectedFile);

      setImportProgress(30);

      const res = await fetch("/api/unit-events/household-survey/import", {
        method: "POST",
        body: formData,
      });

      setImportProgress(70);

      const data = await res.json();
      setImportProgress(100);
      
      if (data.success) {
        showAlert(
          "success",
          "Import Successful!",
          `Successfully imported ${data.imported} event${data.imported !== 1 ? 's' : ''} to Household Survey & SIRD.`
        );
        setShowImportModal(false);
        setSelectedFile(null);
        setImportProgress(0);
        fetchEvents();
      } else {
        showAlert("error", "Import Failed", data.error || "Unknown error occurred");
        setImportProgress(0);
      }
    } catch (error) {
      showAlert("error", "Import Failed", error instanceof Error ? error.message : "Please try again");
      setImportProgress(0);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1.5rem)] overflow-hidden">
      {alert.show && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: "info", title: "" })}
        />
      )}

      {/* Sticky Top Section */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Household Survey & SIRD Events</h1>
            <div className="flex gap-2">
              <Link href="/events/household-survey/new">
                <Button variant="default" className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  New Entry
                </Button>
              </Link>
              <Button onClick={handleDownloadTemplate} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Download Template
              </Button>
              <Button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                <Upload className="h-3.5 w-3.5" />
                Import Excel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
            {/* Left side - Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Year:</label>
                <Select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="w-32 text-xs px-2 py-1"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year?.toString()}>{year}</option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Activity Type:</label>
                <Select
                  value={filters.activityType}
                  onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                  className="w-36 text-xs px-2 py-1"
                >
                  <option value="">All Types</option>
                  {uniqueActivityTypes.map(type => (
                    <option key={type} value={type || ''}>{type}</option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-[250px]">
                <Input
                  type="text"
                  placeholder="Search by code, activity name, location, or beneficiaries..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="text-xs py-1.5 px-3"
                />
              </div>

              {(filters.year || filters.activityType || filters.search) && (
                <Button
                  onClick={() => setFilters({ year: '', activityType: '', search: '' })}
                  variant="outline"
                  className="px-3 py-1 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Right side - Pagination Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-xs text-gray-600 font-normal">
                <strong className="font-semibold">{sortedEvents.length}</strong> records
              </div>
              
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="default"
                className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {showAll ? (
                  <>
                    <AlignJustify className="h-3.5 w-3.5" />
                    Show Paginated
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Show All
                  </>
                )}
              </Button>

              {!showAll && (
                <>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-base"
                  >
                    ‹
                  </button>
                  
                  <div className="text-xs text-gray-700 font-normal">
                    Page <strong className="font-semibold">{currentPage}</strong> of <strong className="font-semibold">{totalPages}</strong>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-base"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-7 gap-2">
            <Card className="border-2" style={{ borderColor: '#1f2937' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-cyan-600">{Math.round(stats.totalHoursEngaged).toLocaleString()}</div>
                <div className="text-xs text-gray-600">Engaged Hours</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-emerald-600">₹{Math.round(stats.totalAmountSpent).toLocaleString()}</div>
                <div className="text-xs text-gray-600">Amount Spent</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-rose-600">{stats.avgParticipantsPerEvent.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Avg Participants/Event</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-xs text-gray-600">Students</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-purple-600">{stats.totalFaculty}</div>
                <div className="text-xs text-gray-600">Faculty</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: '#d1d5db' }}>
              <div className="px-2 py-1.5">
                <div className="text-lg font-bold text-indigo-600">{stats.totalExternal}</div>
                <div className="text-xs text-gray-600">External</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Table */}
        <div className="bg-white overflow-hidden border-t border-gray-200 flex-1 flex flex-col border-x border-b">
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-xs min-w-[2000px]" style={{ borderCollapse: 'collapse' }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">S.No</th>
                  <th 
                    className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Activity Name
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                    onClick={() => handleSort('eventDate')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <SortIcon field="eventDate" />
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                    onClick={() => handleSort('year')}
                  >
                    <div className="flex items-center gap-1">
                      Year
                      <SortIcon field="year" />
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                    onClick={() => handleSort('activityType')}
                  >
                    <div className="flex items-center">
                      Type
                      <SortIcon field="activityType" />
                    </div>
                  </th>
                <th 
                  className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                  onClick={() => handleSort('sdgGoal')}
                >
                  <div className="flex items-center">
                    SDG Goals
                    <SortIcon field="sdgGoal" />
                  </div>
                </th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">Students</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">Faculty</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">External</th>
                <th 
                  className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                  onClick={() => handleSort('totalParticipants')}
                >
                  <div className="flex items-center justify-center">
                    Total
                    <SortIcon field="totalParticipants" />
                  </div>
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">Location</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">Hours/Person</th>
                <th 
                  className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50"
                  onClick={() => handleSort('totalHoursEngaged')}
                >
                  <div className="flex items-center justify-center">
                    Total Hours
                    <SortIcon field="totalHoursEngaged" />
                  </div>
                </th>
                <th 
                  className="px-2 py-1.5 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amountSpent')}
                >
                  <div className="flex items-center justify-end">
                    Amount Spent
                    <SortIcon field="amountSpent" />
                  </div>
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">Beneficiaries</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50">No. of Beneficiaries</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap bg-gray-50">Report Link</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">No events found</p>
                      <p className="text-sm">Import some data or adjust your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event, index) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap border-r border-b border-gray-200">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="title"
                      value={event.title}
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                      maxWidth="300px"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="eventDate"
                      value={event.eventDate ? format(new Date(event.eventDate), 'yyyy-MM-dd') : ''}
                      type="date"
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="year"
                      value={event.year}
                      type="number"
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="activityType"
                      value={event.activityType}
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                      maxWidth="200px"
                    />
                  </td>
                  <td className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap border-r border-b border-gray-200">
                    {event.goals.length === 17 
                      ? 'All 17 Goals' 
                      : event.goals.map(g => g.sdgGoal.goalNumber).join(', ') || '-'}
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="studentCount"
                      value={event.studentCount}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="facultyCount"
                      value={event.facultyCount}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="externalCount"
                      value={event.externalCount}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap border-r border-b border-gray-200">{event.totalParticipants}</td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="locationText"
                      value={event.locationText}
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                      maxWidth="350px"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="hoursPerEvent"
                      value={event.hoursPerEvent}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="totalHoursEngaged"
                      value={event.totalHoursEngaged}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="amountSpent"
                      value={event.amountSpent}
                      type="number"
                      className="px-2 py-1 text-right text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="beneficiaryText"
                      value={event.beneficiaryText}
                      className="px-2 py-1 text-gray-700 font-normal whitespace-nowrap"
                      maxWidth="300px"
                    />
                  </td>
                  <td className="border-r border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="beneficiaryCount"
                      value={event.beneficiaryCount}
                      type="number"
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                  <td className="border-b border-gray-200">
                    <EditableCell 
                      eventId={event.id}
                      field="reportUrl"
                      value={event.reportUrl}
                      className="px-2 py-1 text-center text-gray-700 font-normal whitespace-nowrap"
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
      </div> {/* End scrollable table section */}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Excel File</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload the Excel file with event data
                </p>
              </div>

              {uploading && (
                <div className="mt-4">
                  <ProgressBar
                    progress={importProgress}
                    label="Importing events..."
                    showPercentage={true}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setImportProgress(0);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || uploading}
                  loading={uploading}
                >
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
