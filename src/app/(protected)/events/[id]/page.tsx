"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Button, Badge, LoadingSpinner } from "@/components/ui";
import { ArrowLeft, Edit, Calendar, MapPin, Users, Clock, DollarSign, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  eventCode: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  year: number | null;
  activityType: string | null;
  status: string;
  studentCount: number;
  facultyCount: number;
  externalCount: number;
  totalParticipants: number;
  beneficiaryText: string | null;
  beneficiaryCount: number | null;
  hoursPerEvent: string | null;
  totalHoursEngaged: string | null;
  amountSpent: string | null;
  locationText: string | null;
  reportUrl: string | null;
  socialUrl: string | null;
  sourceSheet: string | null;
  sourceRowNumber: number | null;
  createdAt: string;
  updatedAt: string;
  unit: { code: string; name: string };
  goals: { isPrimary: boolean; sdgGoal: { goalNumber: number; name: string } }[];
  createdBy: { name: string };
  updatedBy?: { name: string };
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      const res = await fetch(`/api/events/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setEvent(data.data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <Badge
                variant={
                  event.status === "PUBLISHED" ? "success" :
                  event.status === "DRAFT" ? "warning" : "default"
                }
              >
                {event.status}
              </Badge>
            </div>
            <p className="text-gray-700 font-mono">{event.eventCode}</p>
          </div>
        </div>
        <Link href={`/events/${event.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {event.description && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Description</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Details Grid */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Event Details</h2>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-700">Unit</dt>
                  <dd className="font-medium">{event.unit.name}</dd>
                </div>
                {event.activityType && (
                  <div>
                    <dt className="text-sm text-gray-700">Activity Type</dt>
                    <dd className="font-medium">{event.activityType}</dd>
                  </div>
                )}
                {event.eventDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <dt className="text-sm text-gray-700">Event Date</dt>
                      <dd className="font-medium">{format(new Date(event.eventDate), "PPP")}</dd>
                    </div>
                  </div>
                )}
                {event.year && (
                  <div>
                    <dt className="text-sm text-gray-700">Year</dt>
                    <dd className="font-medium">{event.year}</dd>
                  </div>
                )}
                {event.locationText && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <dt className="text-sm text-gray-700">Location</dt>
                      <dd className="font-medium">{event.locationText}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Participation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Participation</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{event.studentCount}</p>
                  <p className="text-sm text-gray-700">Students</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{event.facultyCount}</p>
                  <p className="text-sm text-gray-700">Faculty</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{event.externalCount}</p>
                  <p className="text-sm text-gray-700">External</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{event.totalParticipants}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Impact</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(event.beneficiaryText || event.beneficiaryCount) && (
                  <div>
                    <p className="text-sm text-gray-700">Beneficiaries</p>
                    <p className="font-medium">{event.beneficiaryText || event.beneficiaryCount}</p>
                    {event.beneficiaryText && event.beneficiaryCount && (
                      <p className="text-sm text-gray-700">{event.beneficiaryCount} people</p>
                    )}
                  </div>
                )}
                {(event.hoursPerEvent || event.totalHoursEngaged) && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">Hours Engaged</p>
                      <p className="font-medium">
                        {event.totalHoursEngaged || event.hoursPerEvent} hours
                      </p>
                    </div>
                  </div>
                )}
                {event.amountSpent && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">Amount Spent</p>
                      <p className="font-medium">₹{parseFloat(event.amountSpent).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SDG Goals */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">SDG Goals</h2>
            </CardHeader>
            <CardContent>
              {event.goals.length > 0 ? (
                <div className="space-y-2">
                  {event.goals.map((goal, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        goal.isPrimary ? "bg-blue-50" : "bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                          goal.isPrimary
                            ? "bg-blue-500 text-white"
                            : "bg-slate-200 text-gray-900"
                        }`}
                      >
                        {goal.sdgGoal.goalNumber}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{goal.sdgGoal.name}</p>
                        {goal.isPrimary && (
                          <div className="mt-1">
                            <Badge variant="info">Primary</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 text-sm">No SDG goals assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          {(event.reportUrl || event.socialUrl) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Links</h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.reportUrl && (
                  <a
                    href={event.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Report
                  </a>
                )}
                {event.socialUrl && (
                  <a
                    href={event.socialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Social Media
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Metadata</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-700">Created by</p>
                <p className="font-medium">{event.createdBy.name}</p>
                <p className="text-gray-700">{format(new Date(event.createdAt), "PPp")}</p>
              </div>
              {event.updatedBy && (
                <div>
                  <p className="text-gray-700">Last updated by</p>
                  <p className="font-medium">{event.updatedBy.name}</p>
                  <p className="text-gray-700">{format(new Date(event.updatedAt), "PPp")}</p>
                </div>
              )}
              {event.sourceSheet && (
                <div>
                  <p className="text-gray-700">Imported from</p>
                  <p className="font-medium">{event.sourceSheet}</p>
                  {event.sourceRowNumber && (
                    <p className="text-gray-700">Row {event.sourceRowNumber}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
