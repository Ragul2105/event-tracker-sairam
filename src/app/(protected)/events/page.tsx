"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, Thead, Tbody, Th, Td, LoadingSpinner, EmptyState
} from "@/components/ui";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

interface Event {
  id: string;
  eventCode: string;
  title: string;
  year: number | null;
  status: string;
  totalParticipants: number;
  unit: { code: string; name: string };
  goals: { sdgGoal: { goalNumber: number } }[];
  createdAt: string;
}

interface Unit {
  id: string;
  code: string;
  name: string;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    unitId: "",
    year: "",
    status: "",
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [pagination.page, filters]);

  async function fetchUnits() {
    const res = await fetch("/api/masters/units");
    const data = await res.json();
    if (data.success) {
      setUnits(data.data);
    }
  }

  async function fetchEvents() {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      pageSize: String(pagination.pageSize),
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.unitId) params.set("unitId", filters.unitId);
    if (filters.year) params.set("year", filters.year);
    if (filters.status) params.set("status", filters.status);

    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    if (data.success) {
      setEvents(data.data);
      setPagination((p) => ({ ...p, total: data.pagination.total }));
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchEvents();
    }
  }

  const canDelete = user?.role === "ADMIN" || user?.role === "MASTER";
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-700">{pagination.total} total events</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.unitId}
              onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
              options={[
                { value: "", label: "All Units" },
                ...units.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />
            <Input
              type="number"
              placeholder="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: "", label: "All Status" },
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Create your first event or adjust your filters"
            action={
              <Link href="/events/new">
                <Button>Create Event</Button>
              </Link>
            }
          />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Title</Th>
                  <Th>Unit</Th>
                  <Th>Year</Th>
                  <Th>Participants</Th>
                  <Th>SDG Goals</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <Td className="font-mono text-sm">{event.eventCode}</Td>
                    <Td className="max-w-[200px] truncate">{event.title}</Td>
                    <Td>
                      <Badge>{event.unit.code}</Badge>
                    </Td>
                    <Td>{event.year || "-"}</Td>
                    <Td>{event.totalParticipants}</Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        {event.goals.slice(0, 3).map((g, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center justify-center w-6 h-6 text-xs bg-blue-100 text-blue-700 rounded-full"
                          >
                            {g.sdgGoal.goalNumber}
                          </span>
                        ))}
                        {event.goals.length > 3 && (
                          <span className="text-xs text-gray-700">+{event.goals.length - 3}</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge
                        variant={
                          event.status === "PUBLISHED" ? "success" :
                          event.status === "DRAFT" ? "warning" : "default"
                        }
                      >
                        {event.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
