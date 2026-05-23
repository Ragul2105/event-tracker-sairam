"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, Button, LoadingSpinner, Alert, ProgressBar } from "@/components/ui";
import { Upload, ChevronUp, ChevronDown, ChevronsUpDown, Droplet, Plus } from "lucide-react";

interface BloodDonationRecord {
  id: string;
  year: number;
  campDonors: number;
  regularDonors: number;
  totalDonors: number;
  college: string | null;
}

type SortField = "year" | "campDonors" | "regularDonors" | "totalDonors";
type SortOrder = "asc" | "desc";

export default function BloodDonationPage() {
  const [records, setRecords] = useState<BloodDonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortField, setSortField] = useState<SortField>("year");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
  }>({ show: false, type: "info", title: "" });

  useEffect(() => { fetchRecords(); }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch("/api/blood-donation");
      const data = await res.json();
      setRecords(data.success ? (data.data || []) : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  const showAlert = (type: "success" | "error" | "info" | "warning", title: string, message?: string) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => setAlert({ show: false, type: "info", title: "" }), 5000);
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) =>
      sortOrder === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    );
  }, [records, sortField, sortOrder]);

  const stats = useMemo(() => {
    if (records.length === 0) return { totalCamp: 0, totalRegular: 0, grandTotal: 0, latestYear: null, latestTotal: 0 };
    const totalCamp = records.reduce((s, r) => s + r.campDonors, 0);
    const totalRegular = records.reduce((s, r) => s + r.regularDonors, 0);
    const grandTotal = totalCamp + totalRegular;
    const latest = [...records].sort((a, b) => b.year - a.year)[0];
    return { totalCamp, totalRegular, grandTotal, latestYear: latest.year, latestTotal: latest.totalDonors };
  }, [records]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-50" />;
    return sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
  };

  async function handleImport() {
    if (!selectedFile) { showAlert("warning", "No file selected", "Please select an Excel file"); return; }
    setUploading(true);
    setImportProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      setImportProgress(30);
      const res = await fetch("/api/unit-events/blood-donation/import", { method: "POST", body: formData });
      setImportProgress(70);
      const data = await res.json();
      setImportProgress(100);
      if (data.success) {
        showAlert("success", "Import Successful!", `Imported ${data.imported} year${data.imported !== 1 ? "s" : ""} of blood donation data.`);
        setShowImportModal(false);
        setSelectedFile(null);
        setImportProgress(0);
        fetchRecords();
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

  const thClass = "px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200 bg-gray-50 select-none";

  return (
    <div className="flex flex-col h-[calc(100vh-1.5rem)] overflow-hidden">
      {alert.show && (
        <Alert type={alert.type} title={alert.title} message={alert.message}
          onClose={() => setAlert({ show: false, type: "info", title: "" })} />
      )}

      {/* Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-red-500" />
              <h1 className="text-lg font-semibold text-gray-900">Blood Donation Records</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/events/blood-donation/new">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-2">
            <Card className="border-2" style={{ borderColor: "#dc2626" }}>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-red-600">{stats.grandTotal.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Donors (All Years)</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-orange-600">{stats.totalCamp.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Camp Donors</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-amber-600">{stats.totalRegular.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Regular Donors</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-gray-900">{records.length}</div>
                <div className="text-xs text-gray-600">Years of Data</div>
              </div>
            </Card>
            <Card className="border" style={{ borderColor: "#d1d5db" }}>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-blue-600">
                  {stats.latestYear ? `${stats.latestTotal.toLocaleString()}` : "-"}
                </div>
                <div className="text-xs text-gray-600">Donors in {stats.latestYear ?? "—"}</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white overflow-hidden border-t border-gray-200 flex-1 flex flex-col border-x border-b">
          <div className="flex-1 overflow-x-auto overflow-y-auto cell-scroll">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 bg-gray-50 w-12">
                    S.No
                  </th>
                  <th className={thClass} onClick={() => handleSort("year")}>
                    <div className="flex items-center">Year<SortIcon field="year" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort("campDonors")}>
                    <div className="flex items-center">Camp Donors<SortIcon field="campDonors" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort("regularDonors")}>
                    <div className="flex items-center">Regular Donors<SortIcon field="regularDonors" /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort("totalDonors")}>
                    <div className="flex items-center">Total Donors<SortIcon field="totalDonors" /></div>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap bg-gray-50">
                    College(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Droplet className="h-10 w-10 text-red-300" />
                        <p className="text-base font-medium">No records yet</p>
                        <p className="text-sm">Import the Blood Donation Excel file to get started</p>
                        <Button onClick={() => setShowImportModal(true)} className="mt-1 flex items-center gap-1.5 px-4 py-2 text-sm">
                          <Upload className="h-4 w-4" />
                          Import Excel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record, index) => {
                    const campPct = record.totalDonors > 0 ? (record.campDonors / record.totalDonors) * 100 : 0;
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-4 py-2 text-gray-500 text-xs border-r border-gray-200">{index + 1}</td>
                        <td className="px-4 py-2 font-semibold text-gray-900 border-r border-gray-200">{record.year}</td>
                        <td className="px-4 py-2 text-orange-700 font-medium border-r border-gray-200">
                          {record.campDonors.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-amber-700 font-medium border-r border-gray-200">
                          {record.regularDonors.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">{record.totalDonors.toLocaleString()}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
                              <div className="h-full bg-red-400 rounded-full" style={{ width: `${campPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{record.college || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {sortedRecords.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-300 sticky bottom-0">
                  <tr>
                    <td className="px-4 py-2 border-r border-gray-200" />
                    <td className="px-4 py-2 font-semibold text-gray-700 text-xs border-r border-gray-200 uppercase tracking-wide">Total</td>
                    <td className="px-4 py-2 font-bold text-orange-700 border-r border-gray-200">{stats.totalCamp.toLocaleString()}</td>
                    <td className="px-4 py-2 font-bold text-amber-700 border-r border-gray-200">{stats.totalRegular.toLocaleString()}</td>
                    <td className="px-4 py-2 font-bold text-red-600 border-r border-gray-200">{stats.grandTotal.toLocaleString()}</td>
                    <td className="px-4 py-2" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold">Import Blood Donation Data</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload the Excel file with columns: <strong>YEAR | CAMP DONORS | REGULAR DONORS | COLLEGE</strong>.
              Existing records for the same year will be updated.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Excel File</label>
                <input type="file" accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
              </div>
              {uploading && (
                <ProgressBar progress={importProgress} label="Importing records..." showPercentage />
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
