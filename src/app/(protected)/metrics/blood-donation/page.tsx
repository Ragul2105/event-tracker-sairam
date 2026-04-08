"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Button, Input, Table, Thead, Tbody, Th, Td, LoadingSpinner, EmptyState } from "@/components/ui";
import { Plus, Droplet, Save, X, Trash2 } from "lucide-react";

interface BloodDonationMetric {
  year: number;
  campDonors: number;
  regularDonors: number;
  totalDonors: number;
}

export default function BloodDonationPage() {
  const [metrics, setMetrics] = useState<BloodDonationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ year: new Date().getFullYear(), campDonors: 0, regularDonors: 0 });

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    const res = await fetch("/api/metrics/blood-donation");
    const data = await res.json();
    if (data.success) setMetrics(data.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/metrics/blood-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalDonors: formData.campDonors + formData.regularDonors,
        }),
      });
      fetchMetrics();
      setShowForm(false);
      setFormData({ year: new Date().getFullYear(), campDonors: 0, regularDonors: 0 });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(year: number) {
    if (!confirm(`Delete metrics for ${year}?`)) return;
    await fetch(`/api/metrics/blood-donation/${year}`, { method: "DELETE" });
    fetchMetrics();
  }

  const totalCamp = metrics.reduce((sum, m) => sum + m.campDonors, 0);
  const totalRegular = metrics.reduce((sum, m) => sum + m.regularDonors, 0);
  const totalAll = metrics.reduce((sum, m) => sum + m.totalDonors, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Droplet className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blood Donation Metrics</h1>
            <p className="text-gray-700">Yearly blood donation statistics</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Year
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-red-600">{totalCamp.toLocaleString()}</p>
            <p className="text-gray-700">Total Camp Donors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-red-600">{totalRegular.toLocaleString()}</p>
            <p className="text-gray-700">Total Regular Donors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-red-600">{totalAll.toLocaleString()}</p>
            <p className="text-gray-700">All Time Donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Yearly Metrics</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
              <Input label="Year" type="number" value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
              <Input label="Camp Donors" type="number" value={formData.campDonors}
                onChange={(e) => setFormData({ ...formData, campDonors: parseInt(e.target.value) || 0 })} />
              <Input label="Regular Donors" type="number" value={formData.regularDonors}
                onChange={(e) => setFormData({ ...formData, regularDonors: parseInt(e.target.value) || 0 })} />
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4 mr-2" />Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Yearly Data</h2></CardHeader>
        {metrics.length === 0 ? (
          <EmptyState title="No data yet" description="Add yearly blood donation metrics" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Year</Th>
                <Th className="text-right">Camp Donors</Th>
                <Th className="text-right">Regular Donors</Th>
                <Th className="text-right">Total</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {metrics.map((m) => (
                <tr key={m.year} className="hover:bg-slate-50">
                  <Td className="font-bold">{m.year}</Td>
                  <Td className="text-right">{m.campDonors.toLocaleString()}</Td>
                  <Td className="text-right">{m.regularDonors.toLocaleString()}</Td>
                  <Td className="text-right font-semibold text-red-600">{m.totalDonors.toLocaleString()}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.year)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
