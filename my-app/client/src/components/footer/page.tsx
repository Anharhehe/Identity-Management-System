'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const HIDE_ON = ['/auth', '/admin-dashboard'];

export default function Footer() {
  // All hooks MUST be called before any conditional returns
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null);
  
  useEffect(() => { 
    setYear(new Date().getFullYear()); 
  }, []);

  // Conditional logic comes AFTER all hooks
  if (HIDE_ON.some(path => pathname.startsWith(path))) return null;

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* ── Column 1: Brand ── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="IMS Logo"
              width={44}
              height={44}
              className="rounded-lg"
            />
          </div>

          <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
            Identity Management System — one account, infinite identities.
            Manage your professional, personal, family, and online personas
            with military-grade privacy controls.
          </p>

          <div className="flex items-center gap-4 mt-1">
            <a
              href="https://github.com/Anharhehe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/m-anhar-munir-b736252b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>

        {/* ── Column 2: Quick Links ── */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">
            Quick Links
          </h3>
          <nav className="flex flex-col gap-3 text-sm">
            <Link href="/" className="hover:text-white transition-colors w-fit">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors w-fit">
              Dashboard
            </Link>
            <Link href="/auth" className="hover:text-white transition-colors w-fit">
              Sign In / Register
            </Link>
          </nav>
        </div>

        {/* ── Column 3: Contact ── */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">
            Contact
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3">
              <MdEmail className="mt-0.5 shrink-0 text-purple-500" size={16} />
              <a
                href="mailto:anharhehe@gmail.com"
                className="hover:text-white transition-colors break-all"
              >
                anharhehe@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MdPhone className="mt-0.5 shrink-0 text-purple-500" size={16} />
              <span>+92 311 7791014</span>
            </li>
            <li className="flex items-start gap-3">
              <MdLocationOn className="mt-0.5 shrink-0 text-purple-500" size={16} />
              <span>FAST NUCES,<br />Islamabad, Pakistan</span>
            </li>
          </ul>

          <div className="mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/50 border border-purple-800/40 text-xs text-purple-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              System Operational
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 text-center text-xs text-gray-600">
          <p>
            © {year ?? new Date().getFullYear()}{' '}
            <span className="text-gray-500 font-medium">IMS Technologies Pvt. Ltd.</span>
            {' '}All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
