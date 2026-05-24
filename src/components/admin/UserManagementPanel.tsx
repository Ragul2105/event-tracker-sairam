"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Table,
  Thead,
  Tbody,
  Th,
  Td,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui";
import { Edit, Trash2, UserPlus, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  unitAccesses: { unit: { id: string; code: string; name: string } }[];
}

interface Unit {
  id: string;
  code: string;
  name: string;
}

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  unitIds: string[];
};

export default function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "UNIT_USER",
    unitIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [usersRes, unitsRes] = await Promise.all([
      fetch("/api/users?includeInactive=true"),
      fetch("/api/masters/units"),
    ]);
    const [usersData, unitsData] = await Promise.all([usersRes.json(), unitsRes.json()]);
    if (usersData.success) setUsers(usersData.data);
    if (unitsData.success) setUnits(unitsData.data);
    setLoading(false);
  }

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "UNIT_USER", unitIds: [] });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      unitIds: user.unitAccesses.map((ua) => ua.unit.id),
    });
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Omit<UserFormData, "password"> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        unitIds: formData.unitIds,
        ...(editingUser
          ? (formData.password ? { password: formData.password } : {})
          : { password: formData.password }),
      };

      const res = await fetch(
        editingUser ? `/api/users/${editingUser.id}` : "/api/users",
        {
          method: editingUser ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchData();
  };

  const toggleUnit = (unitId: string) => {
    const newIds = formData.unitIds.includes(unitId)
      ? formData.unitIds.filter((id) => id !== unitId)
      : [...formData.unitIds, unitId];
    setFormData({ ...formData, unitIds: newIds });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900">User Management</h1>
          <p className="text-[11px] text-gray-700">Manage user accounts and permissions</p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="px-3 py-1.5 text-xs">
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />New User
        </Button>
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState title="No users" action={<Button onClick={openCreateModal}>Create User</Button>} />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th className="px-2.5 py-1.5 text-[11px]">Name</Th>
                <Th className="px-2.5 py-1.5 text-[11px]">Email</Th>
                <Th className="px-2.5 py-1.5 text-[11px]">Role</Th>
                <Th className="px-2.5 py-1.5 text-[11px]">Units</Th>
                <Th className="px-2.5 py-1.5 text-[11px]">Status</Th>
                <Th className="px-2.5 py-1.5 text-[11px]">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <Td className="px-2.5 py-1.5 text-xs font-medium whitespace-normal">{user.name}</Td>
                  <Td className="px-2.5 py-1.5 text-xs whitespace-normal">{user.email}</Td>
                  <Td className="px-2.5 py-1.5 text-xs">
                    <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "MASTER" ? "warning" : "default"}>{user.role}</Badge>
                  </Td>
                  <Td className="px-2.5 py-1.5 text-xs">
                    <div className="flex gap-1 flex-wrap">
                      {user.unitAccesses.slice(0, 2).map((ua) => (
                        <Badge key={ua.unit.id}>{ua.unit.code}</Badge>
                      ))}
                      {user.unitAccesses.length > 2 && <span className="text-xs text-gray-700">+{user.unitAccesses.length - 2}</span>}
                    </div>
                  </Td>
                  <Td className="px-2.5 py-1.5 text-xs"><Badge variant={user.isActive ? "success" : "default"}>{user.isActive ? "Active" : "Inactive"}</Badge></Td>
                  <Td className="px-2.5 py-1.5 text-xs">
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" className="px-2 py-1" onClick={() => openEditModal(user)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="px-2 py-1" onClick={() => handleDelete(user.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editingUser ? "Edit User" : "Create User"}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input className="py-1.5 text-xs" label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input className="py-1.5 text-xs" label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <Input className="py-1.5 text-xs" label={editingUser ? "Password (leave blank to keep)" : "Password"} type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                <Select className="py-1.5 text-xs" label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[{ value: "ADMIN", label: "Admin" }, { value: "MASTER", label: "Master" }, { value: "UNIT_USER", label: "Unit User" }]} />
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1.5">Unit Access</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {units.map((unit) => (
                      <button key={unit.id} type="button" onClick={() => toggleUnit(unit.id)}
                        className={`p-1.5 text-xs rounded border ${formData.unitIds.includes(unit.id) ? "bg-blue-100 border-blue-500" : "bg-slate-50 border-slate-200"}`}>
                        {unit.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" loading={saving}>{editingUser ? "Save" : "Create"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
