"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import { Button, Card, LoadingSpinner, Badge } from "@/components/ui";
import { AlignJustify, LayoutGrid } from "lucide-react";

interface EventRow {
  id: string;
  eventCode: string;
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  activityType: string | null;
  eventDate: string | null;
  year: number | null;
  studentCount: number;
  facultyCount: number;
  externalCount: number;
  totalParticipants: number;
  hoursPerEvent: string | null;
  totalHoursEngaged: string | null;
  amountSpent: string | null;
  beneficiaryText: string | null;
  beneficiaryCount: number | null;
  locationText: string | null;
  reportUrl: string | null;
  socialUrl: string | null;
  createdAt: string;
  unit: { code: string; name: string };
  createdBy: { name: string };
}

type TabKey = "pending" | "approved" | "users";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [pendingEvents, setPendingEvents] = useState<EventRow[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllApproved, setShowAllApproved] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        fetchEvents("PENDING"),
        fetchEvents("APPROVED"),
      ]);
      setPendingEvents(pending);
      setApprovedEvents(approved);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents(status: "PENDING" | "APPROVED") {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("pageSize", "1000");
    params.append("status", status);

    const res = await fetch(`/api/events?${params.toString()}`);
    const data = await res.json();
    return data.success ? (data.data as EventRow[]) : [];
  }

  async function updateStatus(eventId: string, status: "APPROVED" | "REJECTED") {
    setWorkingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      if (status === "APPROVED") {
        const approved = pendingEvents.find((event) => event.id === eventId);
        if (approved) {
          setApprovedEvents((prev) => [approved, ...prev]);
        }
      }

      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));
    } finally {
      setWorkingId(null);
    }
  }

  async function handleApproveAll() {
    if (pendingEvents.length === 0) return;
    setWorkingId("__all__");
    try {
      const approvals = await Promise.all(
        pendingEvents.map((event) =>
          fetch(`/api/events/${event.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "APPROVED" }),
          })
        )
      );

      const failed = approvals.find((res) => !res.ok);
      if (failed) {
        const data = await failed.json();
        throw new Error(data.error || "Failed to approve all");
      }

      setApprovedEvents((prev) => [...pendingEvents, ...prev]);
      setPendingEvents([]);
    } finally {
      setWorkingId(null);
    }
  }

  const pendingTotalPages = Math.max(1, Math.ceil(pendingEvents.length / pageSize));
  const approvedTotalPages = Math.max(1, Math.ceil(approvedEvents.length / pageSize));

  const paginatedPending = useMemo(() => {
    if (showAllPending) return pendingEvents;
    const start = (pendingPage - 1) * pageSize;
    return pendingEvents.slice(start, start + pageSize);
  }, [pendingEvents, pendingPage, showAllPending]);

  const paginatedApproved = useMemo(() => {
    if (showAllApproved) return approvedEvents;
    const start = (approvedPage - 1) * pageSize;
    return approvedEvents.slice(start, start + pageSize);
  }, [approvedEvents, approvedPage, showAllApproved]);

  const activeList = activeTab === "pending" ? paginatedPending : paginatedApproved;

  if (loading) return <LoadingSpinner />;

  const tabs: Array<{ key: TabKey; label: string; count?: number }> = [
    { key: "users", label: "User Management" },
    { key: "pending", label: "Pending Approvals", count: pendingEvents.length },
    { key: "approved", label: "Approved Records", count: approvedEvents.length },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
        <p className="text-xs text-gray-700">Review entries and manage users</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-gray-700"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "users" && <UserManagementPanel />}

      {activeTab !== "users" && (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
            <div className="text-xs text-gray-600">
              {activeTab === "pending" ? pendingEvents.length : approvedEvents.length} record{(activeTab === "pending" ? pendingEvents.length : approvedEvents.length) === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "pending" && (
                <Button
                  size="sm"
                  className="px-3 py-1 text-xs"
                  onClick={handleApproveAll}
                  disabled={pendingEvents.length === 0 || workingId === "__all__"}
                >
                  Approve All
                </Button>
              )}
              <Button
                onClick={() => (activeTab === "pending" ? setShowAllPending((prev) => !prev) : setShowAllApproved((prev) => !prev))}
                variant="default"
                className="px-3 py-1 text-xs font-medium flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {(activeTab === "pending" ? showAllPending : showAllApproved) ? (
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

              {!(activeTab === "pending" ? showAllPending : showAllApproved) && (
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <button
                    onClick={() =>
                      activeTab === "pending"
                        ? setPendingPage((prev) => Math.max(1, prev - 1))
                        : setApprovedPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={activeTab === "pending" ? pendingPage === 1 : approvedPage === 1}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-base"
                  >
                    ‹
                  </button>
                  <div>
                    Page <strong className="font-semibold">{activeTab === "pending" ? pendingPage : approvedPage}</strong> of <strong className="font-semibold">{activeTab === "pending" ? pendingTotalPages : approvedTotalPages}</strong>
                  </div>
                  <button
                    onClick={() =>
                      activeTab === "pending"
                        ? setPendingPage((prev) => Math.min(pendingTotalPages, prev + 1))
                        : setApprovedPage((prev) => Math.min(approvedTotalPages, prev + 1))
                    }
                    disabled={activeTab === "pending" ? pendingPage >= pendingTotalPages : approvedPage >= approvedTotalPages}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-base"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs min-w-[1800px] whitespace-nowrap" style={{ borderCollapse: "collapse" }}>
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wider text-gray-600">
                  <th className="px-3 py-2 border-r border-gray-200">S.No</th>
                  <th className="px-3 py-2 border-r border-gray-200">Title</th>
                  <th className="px-3 py-2 border-r border-gray-200">Unit</th>
                  <th className="px-3 py-2 border-r border-gray-200">Activity Type</th>
                  <th className="px-3 py-2 border-r border-gray-200">Event Date</th>
                  <th className="px-3 py-2 border-r border-gray-200">Year</th>
                  <th className="px-3 py-2 border-r border-gray-200">Students</th>
                  <th className="px-3 py-2 border-r border-gray-200">Faculty</th>
                  <th className="px-3 py-2 border-r border-gray-200">External</th>
                  <th className="px-3 py-2 border-r border-gray-200">Total</th>
                  <th className="px-3 py-2 border-r border-gray-200">Hours/Person</th>
                  <th className="px-3 py-2 border-r border-gray-200">Total Hours</th>
                  <th className="px-3 py-2 border-r border-gray-200">Amount Spent</th>
                  <th className="px-3 py-2 border-r border-gray-200">Beneficiaries</th>
                  <th className="px-3 py-2 border-r border-gray-200">Beneficiary Count</th>
                  <th className="px-3 py-2 border-r border-gray-200">Location</th>
                  <th className="px-3 py-2 border-r border-gray-200">Report</th>
                  <th className="px-3 py-2 border-r border-gray-200">Social</th>
                  <th className="px-3 py-2 border-r border-gray-200">Created By</th>
                  <th className="px-3 py-2 border-r border-gray-200">Created At</th>
                  <th className="px-3 py-2 border-r border-gray-200">Status</th>
                  <th className="px-3 py-2 sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeList.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="px-4 py-10 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  activeList.map((event, index) => (
                    <tr key={event.id} className="border-b border-gray-200 hover:bg-slate-50">
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">
                        {activeTab === "pending"
                          ? (showAllPending ? index + 1 : (pendingPage - 1) * pageSize + index + 1)
                          : (showAllApproved ? index + 1 : (approvedPage - 1) * pageSize + index + 1)}
                      </td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "320px" }}>
                          {event.title}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.unit.code}</td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "180px" }}>
                          {event.activityType || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">
                        {event.eventDate ? format(new Date(event.eventDate), "dd/MM/yyyy") : "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.year ?? "-"}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.studentCount ?? 0}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.facultyCount ?? 0}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.externalCount ?? 0}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.totalParticipants ?? 0}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.hoursPerEvent ?? "-"}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.totalHoursEngaged ?? "-"}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">
                        {event.amountSpent ? `₹${Number(event.amountSpent).toLocaleString()}` : "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "240px" }}>
                          {event.beneficiaryText || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.beneficiaryCount ?? "-"}</td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "220px" }}>
                          {event.locationText || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "180px" }}>
                          {event.reportUrl ? (
                            <a className="text-blue-600 hover:underline" href={event.reportUrl} target="_blank" rel="noreferrer">
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 border-r border-gray-200">
                        <div className="cell-scroll overflow-x-auto whitespace-nowrap" style={{ maxWidth: "180px" }}>
                          {event.socialUrl ? (
                            <a className="text-blue-600 hover:underline" href={event.socialUrl} target="_blank" rel="noreferrer">
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{event.createdBy?.name || "-"}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200">{format(new Date(event.createdAt), "dd/MM/yyyy")}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200">
                        <Badge variant={event.status === "APPROVED" ? "success" : event.status === "REJECTED" ? "danger" : "warning"}>
                          {event.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 sticky right-0 bg-white">
                        <div className="flex items-center gap-2">
                          <Link href={`/events/${event.id}`} className="text-blue-600 hover:underline text-xs">
                            View
                          </Link>
                          {activeTab === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="px-2 py-1 text-xs"
                                onClick={() => updateStatus(event.id, "APPROVED")}
                                disabled={workingId === event.id}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="px-2 py-1 text-xs"
                                onClick={() => updateStatus(event.id, "REJECTED")}
                                disabled={workingId === event.id}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
