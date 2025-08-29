"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/components/auth/signup-form";
import { Header } from "@/components/ui/header";
import { authClient } from "@/lib/auth-client";

export default function Signup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession();
                if (session?.data) {
                    // User is already signed in, redirect to courses
                    router.push("/courses");
                    return;
                }
            } catch (error) {
                console.error("Auth check error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

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

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <SignUpForm />
            </div>
        </div>
    );
}