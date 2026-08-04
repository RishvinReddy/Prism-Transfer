"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Settings, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/send", label: "Send" },
  { href: "/receive", label: "Receive" },
  { href: "/about", label: "About" },
];

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-18 md:h-20 items-center justify-between px-6 max-w-5xl">
        <Logo className="scale-110 origin-left" />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
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
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center ml-6 border-l border-border/40 pl-6 space-x-2">
            <Link href="/settings" className="text-foreground/60 hover:text-foreground/80 transition-colors p-2 rounded-full hover:bg-muted/50">
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
            className="p-2 -mr-2 text-foreground/80 hover:text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur-xl border-t border-border/40 flex flex-col items-center pt-8 space-y-6 overflow-hidden z-40"
          >
            <nav className="flex flex-col items-center space-y-6 text-lg font-medium w-full px-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "w-full text-center py-4 rounded-xl transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground/70 hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-full h-px bg-border/40 my-4" />
              <Link
                href="/settings"
                className={cn(
                  "w-full text-center py-4 rounded-xl flex justify-center items-center gap-2 transition-colors",
                  pathname === "/settings"
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground/70 hover:bg-muted/50"
                )}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
