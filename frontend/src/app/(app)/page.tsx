"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/layout/app-shell";
import { LoadingScreen } from "../../components/common/loading-screen";
import { useAuthSession } from "../../hooks/use-auth-session";

export default function AppPage() {
  const router = useRouter();
  const { status } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return <LoadingScreen />;
  }

  return <AppShell />;
}
