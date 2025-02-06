"use client";
import useAuthProtection from "@/hooks/useAuthProtection";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthProtection();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/questionary-selection");
    } else {
      router.push("/login");
    }
  }, [router, isAuthenticated]);

  return null;
}
