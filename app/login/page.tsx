"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GothicLandingView } from "../components/landing/gothic-landing-view";
import { WardrobeProvider, useWardrobe } from "../../lib/store/wardrobe-context";

function LoginEntry() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useWardrobe();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return <GothicLandingView />;
}

export default function LoginPage() {
  return (
    <WardrobeProvider>
      <LoginEntry />
    </WardrobeProvider>
  );
}
