"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#entreprises", label: "Entreprises" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-tp-navy-600/95 backdrop-blur-md shadow-tp-md border-b border-tp-cyan-500/10"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo — utilise le SVG officiel de docs/design-system/assets/ */}
            <Link href="/" className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-8 h-8 group-hover:scale-110 transition-transform">
                <path d="M18 28h8l10 36h36l8-28H32" stroke="#00D4C8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="38" cy="70" r="5" fill="#00D4C8"/>
                <circle cx="62" cy="70" r="5" fill="#00D4C8"/>
              </svg>
              <span className="text-white font-display font-bold text-xl tracking-tight">
                TruePrice<span className="text-tp-cyan-500">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tp-cyan-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm">Se connecter</Button>
              <Button size="sm">Essayer gratuitement</Button>
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Ouvrir le menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        className="fixed inset-0 z-40 bg-tp-navy-700 md:hidden"
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: isMobileOpen ? 1 : 0, x: isMobileOpen ? "0%" : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-10">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-xl font-medium py-4 border-b border-white/10 hover:text-tp-cyan-500 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 mt-auto">
            <Button variant="outline" size="lg" className="w-full">Se connecter</Button>
            <Button size="lg" className="w-full">Essayer gratuitement</Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
