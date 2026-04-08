"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Badge, Table, Thead, Tbody, Th, Td, LoadingSpinner } from "@/components/ui";

interface Unit { id: string; code: string; name: string; description: string | null; isActive: boolean; }
interface SDGGoal { id: string; goalNumber: number; name: string; shortLabel: string | null; }

export default function MastersPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [sdgGoals, setSdgGoals] = useState<SDGGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [unitsRes, sdgRes] = await Promise.all([
        fetch("/api/masters/units?includeInactive=true"),
        fetch("/api/masters/sdg-goals"),
      ]);
      const [unitsData, sdgData] = await Promise.all([unitsRes.json(), sdgRes.json()]);
      if (unitsData.success) setUnits(unitsData.data);
      if (sdgData.success) setSdgGoals(sdgData.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
        <p className="text-gray-700">View units and SDG goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Units / Programs</h2></CardHeader>
          <Table>
            <Thead><tr><Th>Code</Th><Th>Name</Th><Th>Status</Th></tr></Thead>
            <Tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <Td className="font-mono">{unit.code}</Td>
                  <Td>{unit.name}</Td>
                  <Td><Badge variant={unit.isActive ? "success" : "default"}>{unit.isActive ? "Active" : "Inactive"}</Badge></Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">SDG Goals</h2></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sdgGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold">
                    {goal.goalNumber}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{goal.name}</p>
                    {goal.shortLabel && <p className="text-sm text-gray-600">{goal.shortLabel}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
