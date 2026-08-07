"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Settings, Menu, X, Send, ScanLine, Info, Home, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/send", label: "Send", icon: Send },
  { href: "/receive", label: "Receive", icon: ScanLine },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/benchmark", label: "Benchmark", icon: Activity },
  { href: "/about", label: "About", icon: Info },
];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl transition-all duration-300">
      <div className="w-full max-w-6xl mx-auto flex h-16 md:h-20 items-center justify-between px-6">
        <Logo className="scale-105 origin-left" />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-6">
          <nav className="flex items-center space-x-8 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative transition-colors hover:text-foreground/80 py-2",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-foreground/60"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                )}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center ml-6 border-l border-border/30 pl-6 space-x-3">
            {/* GitHub Stars Shortcut */}
            <a
              href="https://github.com/RishvinReddy/Prism-Transfer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/50"
              title="GitHub Repository"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            
            <Link 
              href="/settings" 
              className={cn(
                "text-foreground/60 hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/50 relative",
                pathname === "/settings" && "text-primary bg-primary/10"
              )}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Toggle & Actions */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 text-foreground/80 hover:text-foreground relative z-50"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-2xl flex flex-col pt-8 space-y-6 overflow-hidden z-40"
          >
            <nav className="flex flex-col items-center space-y-3 w-full px-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border border-transparent",
                      isActive
                        ? "bg-primary/10 border-primary/20 text-primary font-bold shadow-sm"
                        : "text-foreground/70 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-base font-semibold">{item.label}</span>
                    <Icon className="w-5 h-5 opacity-70" />
                  </Link>
                );
              })}
              <div className="w-full h-px bg-border/30 my-4" />
              <Link
                href="/settings"
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border border-transparent",
                  pathname === "/settings"
                    ? "bg-primary/10 border-primary/20 text-primary font-bold shadow-sm"
                    : "text-foreground/70 hover:bg-muted/50"
                )}
              >
                <span className="text-base font-semibold">Settings</span>
                <Settings className="w-5 h-5 opacity-70" />
              </Link>
              <a
                href="https://github.com/RishvinReddy/Prism-Transfer"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-foreground/70 hover:bg-muted/50 transition-all"
              >
                <span className="text-base font-semibold">GitHub Source</span>
                <GithubIcon className="w-5 h-5 opacity-70" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
