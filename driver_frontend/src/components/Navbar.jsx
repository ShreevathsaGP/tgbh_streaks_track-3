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
            Namma Hackathon Submission (DRIVER SIDE)
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Take Me Home Button */}
          <button
            onClick={() => setShowHomeSearch(true)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 
    ${isHomeSet
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
              } hover:scale-105 active:scale-95`}
          >
            <FaHome className="text-xl" />
            Take Me Home
          </button>


          {/* X Button: Removes Home Marker but Keeps Button Green */}
          {isHomeSet && (
            <button
              onClick={resetHome}
              className="flex items-center px-3 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            >
              <FaTimes />
            </button>
          )}

          {/* Online/Offline Toggle */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className={`px-5 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 
    ${isOnline
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-400 text-gray-700"
                } hover:scale-105 active:scale-95`}
            >
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </button>


            {showDropdown && (
              <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <li
                  className="p-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleStatusChange(true)}
                >
                  <span className="font-semibold">Online</span> (suggest me
                  passenger requests)
                </li>
                <li
                  className="p-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleStatusChange(false)}
                >
                  <span className="font-semibold text-red-600">Offline</span>{" "}
                  (take me off the grid)
                </li>
              </ul>
            )}
          </div>

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
