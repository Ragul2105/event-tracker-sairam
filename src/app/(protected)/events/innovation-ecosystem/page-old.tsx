"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Th,
  Td,
  Badge,
  LoadingSpinner,
} from "@/components/ui";
import { Download, Upload, Plus, Filter, FileText, ExternalLink, Eye, Edit, Trash2, Calendar, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
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
  status: string;
  goals: Array<{ sdgGoal: { goalNumber: number } }>;
}

export default function InnovationEcosystemPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    search: "",
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  async function fetchEvents() {
    try {
      // First get the unit ID from the unit code
      const unitsRes = await fetch('/api/masters/units');
      const unitsData = await unitsRes.json();
      const unit = unitsData.data?.find((u: any) => u.code === 'INNOVATION_ECOSYSTEM');
      
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "100");
      if (unit?.id) params.append("unitId", unit.id);
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      // Use the pre-generated template from public folder
      const link = document.createElement("a");
      link.href = "/innovation-ecosystem-template.xlsx";
      link.download = "innovation-ecosystem-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download template:", error);
      alert("Failed to download template");
    }
  }

  async function handleImport() {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/unit-events/innovation-ecosystem/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Import response:", data);
      
      if (data.success) {
        alert(`Import successful! ${data.imported} events imported.`);
        setShowImportModal(false);
        setSelectedFile(null);
        fetchEvents();
      } else {
        console.error("Import error:", data.error);
        alert(`Import failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert(`Import failed: ${error instanceof Error ? error.message : "Please try again"}`);
    } finally {
      setUploading(false);
    }
  }

  const years = Array.from(
    new Set(events.map((e) => e.year).filter((y) => y !== null))
  ).sort((a, b) => (b as number) - (a as number));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Innovation Ecosystem Events</h1>
          <p className="text-gray-700 mt-1">
            Manage and track innovation ecosystem activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadTemplate}
            icon={<Download size={16} />}
          >
            Download Template
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            icon={<Upload size={16} />}
          >
            Import Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              placeholder="Search by activity name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              label="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({ year: "", search: "" })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Events ({events.length})</h2>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No events found</p>
              <Button onClick={() => setShowImportModal(true)}>
                Import Your First Event
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Activity Name</Th>
                    <Th>Type</Th>
                    <Th>Date</Th>
                    <Th>Participants</Th>
                    <Th>Hours</Th>
                    <Th>Beneficiaries</Th>
                    <Th>Actions</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <Td className="font-mono text-sm">{event.eventCode}</Td>
                      <Td>
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          {event.locationText && (
                            <p className="text-sm text-gray-600 truncate">
                              {event.locationText}
                            </p>
                          )}
                        </div>
                      </Td>
                      <Td>
                        {event.activityType && (
                          <Badge variant="info">{event.activityType}</Badge>
                        )}
                      </Td>
                      <Td>
                        {event.eventDate
                          ? format(new Date(event.eventDate), "dd MMM yyyy")
                          : "-"}
                      </Td>
                      <Td>
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {event.totalParticipants}
                          </div>
                          <div className="text-gray-600 text-xs">
                            S:{event.studentCount} F:{event.facultyCount} E:
                            {event.externalCount}
                          </div>
                        </div>
                      </Td>
                      <Td>{event.totalHoursEngaged || "-"}</Td>
                      <Td>{event.beneficiaryCount || "-"}</Td>
                      <Td>
                        <Link
                          href={`/events/${event.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Import Events from Excel</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Download the Excel template using the button above</li>
                    <li>Fill in your event data following the format</li>
                    <li>Upload the completed Excel file below</li>
                  </ol>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload size={48} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-700">
                      {selectedFile ? selectedFile.name : "Click to select Excel file"}
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowImportModal(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? "Importing..." : "Import Events"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
