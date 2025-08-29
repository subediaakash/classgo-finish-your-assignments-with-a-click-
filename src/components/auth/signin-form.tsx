'use client';

import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, BookOpenIcon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
    
export default function SignInForm() {
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Glassy background effect */}
            <div className="relative">
                {/* Animated background elements */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-2xl opacity-50"></div>
                
                {/* Main card */}
                <Card className="relative border-0 bg-card/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-2xl"></div>
                    <div className="relative">
                        <CardHeader className="text-center pb-6">
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                                        <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <SparklesIcon className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                Welcome to ClassGo
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-base mt-2">
                                Sign in to access your classroom automation tools
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pb-8">
                            <Button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 border-0 py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                                <ArrowRightIcon className="w-4 h-4" />
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                    <a href="/sign-up" className="text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                                        Sign up
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
    );
}