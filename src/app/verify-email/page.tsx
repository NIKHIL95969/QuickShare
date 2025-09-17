"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

function TokenHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    axios
      .post(`/api/v1/verify-email?token=${token}`)
      .then((res) => {
        if (res.status === 200) {
          toast({
            title: "Login Successful",
            description:
              res.data?.data?.message || "Email verified successfully!",
            variant: "success",
          });
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("API error:", err);
        toast({
          title: "Token expired or Invalid",
          description: "Invalid token!",
          variant: "destructive",
        });
        router.push("/login");
      });
  }, [searchParams, router]);

  return null;
}

export default function TokenHandler() {
  return (
    <Suspense fallback={<p>Verifying email...</p>}>
      <TokenHandlerInner />
    </Suspense>
  );
}
