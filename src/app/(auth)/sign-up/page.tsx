"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SignUpForm from "@/components/auth/signup-form";
import { Header } from "@/components/ui/header";
import { useAuthContext } from "@/components/auth/auth-provider";

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuthContext();

    useEffect(() => {
        if (!loading && user) {
            const redirectTo = searchParams.get('redirect') || '/';
            router.replace(redirectTo);
        }
    }, [user, loading, router, searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <SignUpForm />
            </div>
        </div>
    );
}

export default function Signup() {
    return (
        <Suspense>
            <SignUpContent />
        </Suspense>
    );
}