"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { Card, CardContent, CardHeader, LoadingSpinner, Badge } from "@/components/ui";
import { Calendar, Users, Clock, Heart, TrendingUp, Target } from "lucide-react";
import { DashboardSummary } from "@/modules/shared/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/dashboard/summary");
        const data = await res.json();
        if (data.success) {
          setSummary(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-700">Welcome back, {user?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Events"
          value={summary?.totalEvents || 0}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
        />
        <SummaryCard
          title="Total Participants"
          value={summary?.totalParticipants || 0}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <SummaryCard
          title="Beneficiaries"
          value={summary?.totalBeneficiaries || 0}
          icon={<Heart className="h-6 w-6" />}
          color="purple"
        />
        <SummaryCard
          title="Hours Engaged"
          value={Math.round(summary?.totalHoursEngaged || 0)}
          icon={<Clock className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Blood Donation Highlight */}
      {summary?.bloodDonationHighlight && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Blood Donation ({summary.bloodDonationHighlight.latestYear})</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-red-600">{summary.bloodDonationHighlight.campDonors}</p>
                <p className="text-sm text-gray-700 font-medium">Camp Donors</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{summary.bloodDonationHighlight.regularDonors}</p>
                <p className="text-sm text-gray-700 font-medium">Regular Donors</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{summary.bloodDonationHighlight.totalDonors}</p>
                <p className="text-sm text-gray-700 font-medium">Total Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Unit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Events by Unit</h2>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.eventsByUnit.length ? (
              <div className="space-y-3">
                {summary.eventsByUnit.map((item) => (
                  <div key={item.unitCode} className="flex items-center justify-between">
                    <span className="text-gray-900">{item.unitName}</span>
                    <Badge variant="info">{item.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No events yet</p>
            )}
          </CardContent>
        </Card>

        {/* Events by Year */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold">Events by Year</h2>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.eventsByYear.length ? (
              <div className="space-y-3">
                {summary.eventsByYear.slice(0, 5).map((item) => (
                  <div key={item.year} className="flex items-center justify-between">
                    <span className="text-gray-900">{item.year}</span>
                    <Badge variant="success">{item.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No events yet</p>
            )}
          </CardContent>
        </Card>

        {/* Events by SDG */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Events by SDG Goal</h2>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.eventsBySDG.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {summary.eventsBySDG.map((item) => (
                  <div key={item.goalNumber} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {item.goalNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">{item.goalName}</p>
                      <p className="text-sm font-semibold text-gray-900">{item.count} events</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No events yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-700 font-medium">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
