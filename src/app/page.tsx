"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/blocks/hero-section";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookOpenIcon, ClockIcon, ZapIcon, UsersIcon, ShieldIcon } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { useAuthContext } from "@/components/auth/auth-provider";

export default function Home() {
  const { user, loading } = useAuthContext();
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection
        badge={{
          text: user ? "Welcome Back" : "New Feature",
          action: user ? {
            text: "Go to Courses",
            href: "/courses",
          } : {
            text: "Automated Grading",
            href: "#features",
          },
        }}
        title={user ? `Welcome back, ${user.name}!` : "Transform Your Classroom with ClassGo"}
        description={user 
          ? "Ready to continue managing your classroom? Access your courses and assignments, or explore new features."
          : "Streamline your Google Classroom workflow with intelligent automation. Manage assignments, track student progress, and save hours of manual work with our powerful tools designed specifically for educators."
        }
        actions={user ? [
          {
            text: "Go to Courses",
            href: "/courses",
            variant: "default" as const
          },
          {
            text: "View Assignments",
            href: "/assignments",
            variant: "default" as const
          }
        ] : [
          {
            text: "Get Started",
            href: "/sign-in",
            variant: "default" as const
          },
          {
            text: "GitHub",
            href: "https://github.com/your-repo",
            variant: "default" as const,
            icon: <Icons.gitHub className="h-5 w-5" />
          }
        ]}
        image={{
          light: "https://www.launchuicomponents.com/app-light.png",
          dark: "https://www.launchuicomponents.com/app-dark.png",
          alt: "ClassGo Dashboard Preview",
        }}
      />

      {/* Features Section */}
      <section id="features" className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to streamline your classroom
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for educators to save time and enhance student engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ZapIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Automated Submissions</CardTitle>
                <CardDescription>
                  Automatically handle assignment submissions and grading workflows with intelligent automation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpenIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Management</CardTitle>
                <CardDescription>
                  Intelligent course and assignment organization with real-time updates and notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ClockIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Time Saving</CardTitle>
                <CardDescription>
                  Reduce manual tasks and focus on what matters most - teaching and student engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <UsersIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Student Engagement</CardTitle>
                <CardDescription>
                  Enhanced tools for tracking student progress and fostering better communication.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Enterprise-grade security with full data privacy and compliance with educational standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRightIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Easy Integration</CardTitle>
                <CardDescription>
                  Seamless integration with Google Classroom and Google Drive for a unified experience.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {user ? "Ready to continue managing your classroom?" : "Ready to transform your classroom?"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {user 
              ? "Access your courses, manage assignments, and explore new features to enhance your teaching experience."
              : "Join thousands of educators who are already saving time and improving student outcomes with ClassGo."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/courses" className="flex items-center gap-2">
                  <ArrowRightIcon className="w-4 h-4" />
                  Go to Courses
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href="/sign-in" className="flex items-center gap-2">
                  <ArrowRightIcon className="w-4 h-4" />
                  Get Started Free
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 ClassGo. Built for educators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
