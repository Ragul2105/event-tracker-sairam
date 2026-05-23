"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button, Card, CardContent, CardHeader, Input } from "@/components/ui";

export default function BloodDonationNewRecordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    campDonors: "",
    regularDonors: "",
    college: "",
  });

  const camp = formData.campDonors ? parseInt(formData.campDonors) : 0;
  const regular = formData.regularDonors ? parseInt(formData.regularDonors) : 0;
  const total = camp + regular;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        year: parseInt(formData.year),
        campDonors: formData.campDonors ? parseInt(formData.campDonors) : 0,
        regularDonors: formData.regularDonors ? parseInt(formData.regularDonors) : 0,
        college: formData.college || undefined,
      };

      const res = await fetch("/api/blood-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create record");

      router.push("/events/blood-donation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/events/blood-donation">
            <Button variant="ghost" size="sm" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Blood Donation Record</h1>
            <p className="text-sm text-gray-700">Fill in the details below.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="text-xs font-semibold tracking-wider text-gray-800 uppercase">Basic Information</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Year *"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
              <Input
                label="College(s)"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g., Sairam Engineering College"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-semibold tracking-wider text-gray-800 uppercase">Donor Details</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Camp Donors"
                type="number"
                value={formData.campDonors}
                onChange={(e) => setFormData({ ...formData, campDonors: e.target.value })}
              />
              <Input
                label="Regular Donors"
                type="number"
                value={formData.regularDonors}
                onChange={(e) => setFormData({ ...formData, regularDonors: e.target.value })}
              />
              <Input
                label="Total Donors"
                type="number"
                value={String(total)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/events/blood-donation">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Create Record
          </Button>
        </div>
      </form>
    </div>
  );
}
