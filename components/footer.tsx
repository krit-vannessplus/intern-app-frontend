// components/Footer.tsx
import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaAngleDoubleRight,
} from "react-icons/fa";

const navLinks = [
  { href: "#about", label: "About Us" },
  { href: "#service", label: "Services" },
  { href: "#client", label: "Clients" },
  { href: "#job", label: "Job" },
  { href: "#articles", label: "Career tips" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 sm:pt-16 mt-20">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Info */}
        <div className="flex flex-wrap -mx-4 mb-16">
          {/* Contact */}
          <div className="px-4 w-full sm:w-1/3 md:w-1/4 mb-8">
            <h4 className="text-xl font-semibold mb-6">CONTACT Us</h4>
            <address className="not-italic flex items-start mb-4">
              <FaMapMarkerAlt className="mt-1 mr-2 text-lg" />
              <span>
                98 Sathorn Square Building, North Sathorn Road, Silom, Bangrak,
                Bangkok 10500
              </span>
            </address>
            <ul className="space-y-2 mb-4">
              <li>
                <a
                  href="mailto:hr@vannessplus.com"
                  className="flex items-center hover:text-white"
                >
                  <FaEnvelope className="mr-2" /> hr@vannessplus.com
                </a>
              </li>
              <li>
                <a className="flex items-center hover:text-white">
                  <FaPhone className="mr-2" /> 084-922-3468
                </a>
              </li>
            </ul>
            <div className="flex space-x-4 text-xl">
              <a
                href="https://www.facebook.com/Vanness-Plus-Consulting-Co-Ltd-164103147363159/"
                className="hover:text-white"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="https://th.linkedin.com/in/vanness-plus-consulting-b5568a128"
                className="hover:text-white"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="px-4 w-full sm:w-1/4 md:w-1/6 mb-8">
            <h4 className="text-xl font-semibold mb-6">Links</h4>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>
                    <p className="flex items-center hover:text-white">
                      <FaAngleDoubleRight className="mr-2 text-sm" /> {label}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder Column */}
          <div className="px-4 w-full sm:w-1/2 md:w-1/4 mb-8">
            {/* e.g. newsletter signup */}
          </div>

          {/* Another Placeholder */}
          <div className="px-4 w-full md:w-1/3">{/* e.g. recent posts */}</div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()}{" "}
          <Link href="/">
            <p className="font-semibold hover:text-white">Vanness Plus</p>
          </Link>
        </div>
      </div>
    </footer>
  );
}
