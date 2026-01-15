import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="logo-group">
        <img src="/assets/MumaLogo.png" alt="USF Logo" className="logo-img" />
        <span className="logo-text">STATE OF THE REGION</span>
      </div>

      {/* mobile menu toggle */}
      <button
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        aria-controls="primary-menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* main nav (left) */}
      <nav id="primary-menu" className={`nav ${open ? "open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/reports" onClick={closeMenu}>Reports</NavLink>
        <NavLink to="/policy-playground" onClick={closeMenu}>Policy Playground</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
      </nav>
    </header>
  );
};

export default Header;
