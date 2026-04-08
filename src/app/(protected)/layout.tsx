"use client";

import { useRequireAuth } from "@/components/shared/AuthProvider";
import { MainLayout } from "@/components/shared/Layout";
import { LoadingSpinner } from "@/components/ui";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}
