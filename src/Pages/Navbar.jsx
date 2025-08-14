import React from "react";
import "./NavbarCustom.css";
import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import resume from "../assets/Mehraj hasan riaj.pdf";

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const navLinks = [
    { name: "Home", to: "home" },
    { name: "About", to: "about" },
    { name: "Projects", to: "projects" },
    { name: "Skills", to: "skills" },
    { name: "Contact", to: "contact" },
  ];

  return (
    <nav className="bg-base-100/80 backdrop-blur-lg shadow-lg sticky top-0 left-0 right-0 z-50">
      <div className="navbar max-w-11/12 mx-auto">
        {/* Logo */}
        <div className="navbar-start">
          <ScrollLink
            to="home"
            smooth={true}
            duration={500}
            className="text-primary text-2xl font-bold cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            MyPortfolio
          </ScrollLink>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <ScrollLink
                  to={link.to}
                  smooth={true}
                  duration={500}
                  offset={-70}
                  className="nav-link"
                  activeClass="active"
                  spy={true}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Theme Toggle + Resume + Mobile Menu Button */}
        <div className="navbar-end flex items-center gap-2">
          {/* Resume Download Button */}
          <a
            href={resume}
            download="Mehraj_Hasan_Riaj_Resume.pdf"
            className="resume-btn hidden md:inline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Resume"
          >
            Get Resume
          </a>
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="btn btn-sm btn-secondary"
            aria-label="Toggle Dark Mode"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="btn btn-sm btn-ghost lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-base-100 shadow-lg lg:hidden">
            <ul className="menu p-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <ScrollLink
                    to={link.to}
                    smooth={true}
                    duration={500}
                    offset={-70}
                    className="nav-link"
                    activeClass="active"
                    spy={true}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </ScrollLink>
                </li>
              ))}
              {/* Mobile Resume Button */}
              <li>
                <a
                  href={resume}
                  download="Mehraj_Hasan_Riaj_Resume.pdf"
                  className="resume-btn hidden md:inline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Resume"
                >
                  Get Resume
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
