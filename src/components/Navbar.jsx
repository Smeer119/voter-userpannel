import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, ChevronRight } from 'lucide-react';
import { selectIsLoggedIn } from '../../store/userSlice';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto transition-all duration-300">
        {/* Floating Pill Container */}
        <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-6 py-3 flex items-center justify-between md:gap-16 border border-gray-100">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
              Elections
              <span className="text-blue-600 ml-1">System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
            <NavLink to="/elections" currentPath={location.pathname}>Elections</NavLink>
            <NavLink to="/news" currentPath={location.pathname}>News</NavLink>
            <NavLink to="/research" currentPath={location.pathname}>Research</NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/account"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                My Account
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              <div
                className={`transform transition-all duration-300 ${isMobileMenuOpen ? "rotate-90" : "rotate-0"}`}
              >
                {!isMobileMenuOpen ? <Menu size={24} /> : <X size={24} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-md transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
        style={{ paddingTop: '100px' }}
      >
        <div className="p-6 space-y-8 h-full overflow-y-auto">
          <div className="space-y-4">
            <MobileNavLink to="/" icon="🏠" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/elections" icon="🗳️" onClick={() => setIsMobileMenuOpen(false)}>
              Elections
            </MobileNavLink>
            <MobileNavLink to="/news" icon="📰" onClick={() => setIsMobileMenuOpen(false)}>
              News
            </MobileNavLink>
            <MobileNavLink to="/research" icon="ℹ️" onClick={() => setIsMobileMenuOpen(false)}>
              Research
            </MobileNavLink>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            {isLoggedIn ? (
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                My Account
              </Link>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const NavLink = ({ to, children, currentPath }) => {
  const isActive = currentPath === to;
  return (
    <Link 
      to={to} 
      className={`relative font-medium transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
      )}
    </Link>
  );
};

const MobileNavLink = ({
  to,
  children,
  icon,
  onClick
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
  >
    <div className="flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {children}
      </span>
    </div>
    <ChevronRight
      size={20}
      className="text-gray-400 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all"
    />
  </Link>
);

export default Navbar;