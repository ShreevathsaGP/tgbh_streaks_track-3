import { useState } from "react";
import { FaUserCircle, FaHome, FaTimes } from "react-icons/fa";

const Navbar = ({ setShowHomeSearch, resetHome, isHomeSet }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleStatusChange = (status) => {
    setIsOnline(status);
    setShowDropdown(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white p-4 flex justify-between items-center shadow-md relative z-50">
        {/* Left Section: Logo & App Name */}
        <div className="flex items-center gap-3">
          <img
            src="https://play-lh.googleusercontent.com/2XqI7lhcrck9uZoFh25zC3PlrYENQbgKpbQyZI76015jUMnD8GuYPDb1Fq8HcN4PbQ"
            alt="Namma Yatri Logo"
            className="w-12 h-12"
          />
          <h1 className="text-xl font-bold text-black">
            Namma Hackathon Submission (PASSENGER SIDE)
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* My Account Icon */}
          <FaUserCircle
            className="text-3xl text-gray-700 cursor-pointer hover:text-black"
            onClick={() => setShowProfile(!showProfile)}
          />
        </div>
      </nav>

      {/* Account Sidebar (Slides in from Right) */}
      {showProfile && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white shadow-lg p-4 transition-transform transform translate-x-0 z-50">
          <h2 className="text-lg font-bold mb-4">My Account</h2>
          <p className="text-gray-700">User details go here...</p>
          <button
            onClick={() => setShowProfile(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <FaTimes size={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
