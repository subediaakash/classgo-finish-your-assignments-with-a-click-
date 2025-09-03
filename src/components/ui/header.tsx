"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  onSignOut?: () => void;
}

export function Header({ user: propUser, onSignOut }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user: contextUser, signOut } = useAuthContext();
  const currentUser = propUser || contextUser;

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onSignOut) onSignOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">ClassGo</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/assignments"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Assignments
            </Link>
          </nav>

          {/* User Menu and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-accent"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {currentUser.image ? (
                    <Image
                      width={24}
                      height={24}
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline-block">{currentUser.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl py-2"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        {currentUser.image ? (
                          <Image
                            width={32}
                            height={32}
                            src={currentUser.image}
                            alt={currentUser.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[12rem]" title={currentUser.name}>{currentUser.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[12rem]" title={currentUser.email}>{currentUser.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline-block">Guest</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/courses"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Courses
              </Link>
              <Link
                href="/assignments"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Assignments
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
