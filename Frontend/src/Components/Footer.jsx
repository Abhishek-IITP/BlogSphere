import React from "react";
import { Link } from "react-router-dom";
import { Feather, ArrowUpRight } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Feed", to: "/" },
    { label: "Write a Story", to: "/add-blog" },
    { label: "Explore Tags", to: "/" },
    { label: "Search", to: "/" },
  ];

  const companyLinks = [
    { label: "About", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Privacy Policy", to: "#" },
    { label: "Guidelines", to: "#" },
  ];

  const socialLinks = [
    { label: "Twitter / X", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Email Us", href: "mailto:hello@blogsphere.com" },
  ];

  return (
    <footer
      className="bg-[#1e1b18] text-[#faf7f2] relative overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Decorative top accent line */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-[#c84b31] to-transparent" />

      <div className="max-w-[1500px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#c84b31] flex items-center justify-center text-white">
                <Feather size={14} />
              </div>
              <span className="text-[20px] font-bold tracking-tight font-serif">
                BlogSphere
              </span>
            </div>
            <p className="text-[14px] text-[#a09890] leading-relaxed max-w-[320px] mb-7">
              A home for thoughtful writing. Share your stories, connect with readers, and build your creative voice — on your own terms.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#c84b31] mb-3">
                Stay Inspired
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-[#2a2623] border border-[#3a3530] text-[13px] text-[#faf7f2] placeholder-[#6a5f55] px-4 py-2.5 rounded-full outline-none focus:border-[#c84b31] transition w-full max-w-[260px]"
                />
                <button className="bg-[#c84b31] hover:bg-[#b03e28] text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#6a5f55] mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[14px] text-[#a09890] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#6a5f55] mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[14px] text-[#a09890] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="md:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#6a5f55] mb-5">
              Connect
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-[#a09890] hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#2a2623] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#6a5f55]">
            © {currentYear} BlogSphere. Crafted with care for writers.
          </p>
          <p className="text-[12px] text-[#6a5f55]">
            Made with <span className="text-[#c84b31]">♥</span> by the
            BlogSphere team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
