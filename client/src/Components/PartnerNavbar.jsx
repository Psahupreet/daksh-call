import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes, FaHome, FaClipboardList, FaMoneyBillAlt, FaChartLine, FaFileUpload, FaSignOutAlt, FaPlusCircle } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PartnerNavbar() {
  const navigate = useNavigate();
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem("partnerToken");
    if (!token) return;
    axios
      .get(`${BASE_URL}/api/partners/check-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPartnerInfo({
          verificationStatus: res.data.status,
          isDocumentsSubmitted: res.data.isDocumentsSubmitted,
        });
      })
      .catch(() => {
        localStorage.removeItem("partnerToken");
        navigate("/partner-login");
      });
  }, [navigate]);

  // Poll for status if not yet verified
  useEffect(() => {
    let interval;
    if (partnerInfo && partnerInfo.verificationStatus !== "verified") {
      interval = setInterval(() => {
        const token = localStorage.getItem("partnerToken");
        if (!token) return;
        axios
          .get(`${BASE_URL}/api/partners/check-documents`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setPartnerInfo({
              verificationStatus: res.data.status,
              isDocumentsSubmitted: res.data.isDocumentsSubmitted,
            });
          });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [partnerInfo]);

  const handleLogout = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerInfo");
    setPartnerInfo(null);
    navigate("/partner-login");
  };

  const handleregister = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerInfo");
    setPartnerInfo(null);
    navigate("/partner-register");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderLinks = () => {
    if (!partnerInfo) return null;
    const hasAccess = partnerInfo.isDocumentsSubmitted && partnerInfo.verificationStatus === "verified";
    return (
      <>
        {hasAccess ? (
          <>
            <Link to="/partner-home" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
              <FaHome className="mr-1" /> Home
            </Link>
            <Link to="/partner-orders" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
              <FaClipboardList className="mr-1" /> Orders
            </Link>
            <Link to="/partner-earnings" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
              <FaMoneyBillAlt className="mr-1" /> Earnings
            </Link>
            <Link to="/partner-dashboard" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
              <FaChartLine className="mr-1" /> Dashboard
            </Link>
          </>
        ) : (
          <div className="text-yellow-300 text-sm italic mr-4">🔒 Access restricted until documents are approved</div>
        )}
        <Link
          to="/upload-documents"
          className={`hover:text-blue-400 flex items-center gap-1 transition-colors ${
            partnerInfo?.isDocumentsSubmitted === false ? 'text-yellow-400 animate-pulse' : ''
          }`}
        >
          <FaFileUpload className="mr-1" /> Documents
        </Link>
        <button onClick={handleLogout} className="hover:text-red-400 flex items-center gap-1 transition-colors">
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </>
    );
  };

  return (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={toggleMenu} className="text-white p-2 rounded-md bg-gray-700 hover:bg-gray-600 focus:outline-none" aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
      <nav className="bg-gray-800 text-white p-4 flex flex-col md:flex-row justify-between items-center fixed w-full z-40">
        <div className="text-xl font-bold mb-4 md:mb-0">Partner Dashboard</div>
        <div className="hidden md:flex space-x-6">
          {partnerInfo ? renderLinks() : (
            <button onClick={handleregister} className="hover:text-green-400 flex items-center gap-1 transition-colors">
              <FaPlusCircle className="mr-1" /> Signup
            </button>
          )}
        </div>
        {isMenuOpen && (
          <div className="md:hidden w-full mt-4 bg-gray-700 rounded-lg p-4 animate-slideDown">
            <div className="flex flex-col space-y-4">
              {partnerInfo ? renderLinks() : (
                <button onClick={() => { handleregister(); toggleMenu(); }} className="hover:text-green-400 flex items-center gap-2 transition-colors py-2 px-3 rounded hover:bg-gray-600 text-left">
                  <FaPlusCircle /> Signup
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-16 md:h-20"></div>
    </>
  );
}