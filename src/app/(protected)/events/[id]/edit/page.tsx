"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, Button, Input, Select, Textarea, LoadingSpinner } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Unit { id: string; code: string; name: string; }
interface SDGGoal { id: string; goalNumber: number; name: string; }

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [sdgGoals, setSdgGoals] = useState<SDGGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", unitId: "", eventDate: "", year: "",
    activityType: "", status: "DRAFT", studentCount: "", facultyCount: "",
    externalCount: "", totalParticipants: "", beneficiaryText: "",
    beneficiaryCount: "", hoursPerEvent: "", totalHoursEngaged: "",
    amountSpent: "", locationText: "", reportUrl: "", socialUrl: "",
    sdgGoalIds: [] as string[], primarySdgGoalId: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [unitsRes, sdgRes, eventRes] = await Promise.all([
        fetch("/api/masters/units"),
        fetch("/api/masters/sdg-goals"),
        fetch(`/api/events/${params.id}`),
      ]);
      const [unitsData, sdgData, eventData] = await Promise.all([
        unitsRes.json(), sdgRes.json(), eventRes.json()
      ]);
      
      if (unitsData.success) setUnits(unitsData.data);
      if (sdgData.success) setSdgGoals(sdgData.data);
      if (eventData.success) {
        const e = eventData.data;
        const primaryGoal = e.goals.find((g: any) => g.isPrimary);
        setFormData({
          title: e.title || "", description: e.description || "",
          unitId: e.unitId || "", activityType: e.activityType || "",
          status: e.status || "DRAFT",
          eventDate: e.eventDate ? e.eventDate.split("T")[0] : "",
          year: e.year?.toString() || "",
          studentCount: e.studentCount?.toString() || "",
          facultyCount: e.facultyCount?.toString() || "",
          externalCount: e.externalCount?.toString() || "",
          totalParticipants: e.totalParticipants?.toString() || "",
          beneficiaryText: e.beneficiaryText || "",
          beneficiaryCount: e.beneficiaryCount?.toString() || "",
          hoursPerEvent: e.hoursPerEvent || "",
          totalHoursEngaged: e.totalHoursEngaged || "",
          amountSpent: e.amountSpent || "",
          locationText: e.locationText || "",
          reportUrl: e.reportUrl || "", socialUrl: e.socialUrl || "",
          sdgGoalIds: e.goals.map((g: any) => g.sdgGoalId),
          primarySdgGoalId: primaryGoal?.sdgGoalId || "",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined,
        studentCount: formData.studentCount ? parseInt(formData.studentCount) : undefined,
        facultyCount: formData.facultyCount ? parseInt(formData.facultyCount) : undefined,
        externalCount: formData.externalCount ? parseInt(formData.externalCount) : undefined,
        totalParticipants: formData.totalParticipants ? parseInt(formData.totalParticipants) : undefined,
        beneficiaryCount: formData.beneficiaryCount ? parseInt(formData.beneficiaryCount) : undefined,
        hoursPerEvent: formData.hoursPerEvent ? parseFloat(formData.hoursPerEvent) : undefined,
        totalHoursEngaged: formData.totalHoursEngaged ? parseFloat(formData.totalHoursEngaged) : undefined,
        amountSpent: formData.amountSpent ? parseFloat(formData.amountSpent) : undefined,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
      };
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update event");
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const toggleSdgGoal = (goalId: string) => {
    const newIds = formData.sdgGoalIds.includes(goalId)
      ? formData.sdgGoalIds.filter((id) => id !== goalId)
      : [...formData.sdgGoalIds, goalId];
    setFormData({
      ...formData, sdgGoalIds: newIds,
      primarySdgGoalId: newIds.includes(formData.primarySdgGoalId) ? formData.primarySdgGoalId : "",
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${params.id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Basic Information</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Unit *" value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                options={[{ value: "", label: "Select Unit" }, ...units.map((u) => ({ value: u.id, label: u.name }))]} required />
              <Input label="Activity Type" value={formData.activityType} onChange={(e) => setFormData({ ...formData, activityType: e.target.value })} />
              <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }]} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Date & Location</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Event Date" type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} />
              <Input label="Year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
              <Input label="Location" value={formData.locationText} onChange={(e) => setFormData({ ...formData, locationText: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">SDG Goals</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {sdgGoals.map((goal) => (
                <button key={goal.id} type="button" onClick={() => toggleSdgGoal(goal.id)}
                  className={`p-2 rounded-lg border text-center transition-colors ${formData.sdgGoalIds.includes(goal.id) ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                  <span className="text-lg font-bold">{goal.goalNumber}</span>
                  <p className="text-xs truncate">{goal.name.split(" ")[0]}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Participation</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Students" type="number" value={formData.studentCount} onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })} />
              <Input label="Faculty" type="number" value={formData.facultyCount} onChange={(e) => setFormData({ ...formData, facultyCount: e.target.value })} />
              <Input label="External" type="number" value={formData.externalCount} onChange={(e) => setFormData({ ...formData, externalCount: e.target.value })} />
              <Input label="Total" type="number" value={formData.totalParticipants} onChange={(e) => setFormData({ ...formData, totalParticipants: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Impact</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Beneficiaries" value={formData.beneficiaryText} onChange={(e) => setFormData({ ...formData, beneficiaryText: e.target.value })} />
              <Input label="Count" type="number" value={formData.beneficiaryCount} onChange={(e) => setFormData({ ...formData, beneficiaryCount: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Hours/Event" type="number" value={formData.hoursPerEvent} onChange={(e) => setFormData({ ...formData, hoursPerEvent: e.target.value })} />
              <Input label="Total Hours" type="number" value={formData.totalHoursEngaged} onChange={(e) => setFormData({ ...formData, totalHoursEngaged: e.target.value })} />
              <Input label="Amount (₹)" type="number" value={formData.amountSpent} onChange={(e) => setFormData({ ...formData, amountSpent: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">References</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Report URL" type="url" value={formData.reportUrl} onChange={(e) => setFormData({ ...formData, reportUrl: e.target.value })} />
              <Input label="Social URL" type="url" value={formData.socialUrl} onChange={(e) => setFormData({ ...formData, socialUrl: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Link href={`/events/${params.id}`}><Button variant="secondary">Cancel</Button></Link>
          <Button type="submit" loading={saving}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
