import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useAuth } from '../components/contexts/AuthContext'; // ✅ Added so we can use login state
import logo from '../assets/logo.png';

const Footer = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth(); // ✅ Same as Navbar

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Digital Indian Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">Digital Indian</span>
            </div>
            <p className="text-gray-400 mb-4">
              Leading provider of technology solutions specializing in telecom infrastructure,
              GIS solutions, and professional development services.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/digitalindian.org/" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/digital-indian/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.instagram.com/digital_indian16/?igsh=bWJ5dGZjbjJkZXht#" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.youtube.com/@digitalindianbusinesssolut108" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/industries" className="text-gray-400 hover:text-white transition-colors">
                  Industries
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Telecom Infrastructure</li>
              <li>Geospatial & GIS Solutions</li>
              <li>Skill Development</li>
              <li>Business Consultancy</li>
            </ul>
          </div>

          {/* Contact Info + Admin Login */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <a
                  href="https://www.google.com/maps/place/EN+BLOCK..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  EN-9, Salt Lake, Sec-5, Kolkata-700091
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <a href="tel:+917908735132" className="text-gray-400 hover:text-white transition-colors">
                  +91 7908735132
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <a href="mailto:info@digitalindian.co.in" className="text-gray-400 hover:text-white transition-colors">
                  info@digitalindian.co.in
                </a>
              </div>

              {/* ✅ Admin Login / Logout */}
              <div className="mt-4">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                  >
                    Logout {isAdmin && `(Admin: ${user?.username})`}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Digital Indian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
