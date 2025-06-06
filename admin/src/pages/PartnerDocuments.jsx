import { useEffect, useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PartnerDocuments() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = () => {
    setIsLoading(true);
    axios
      .get(`${BASE_URL}/api/admin/partner-documents`, { withCredentials: true })
      .then((res) => setPartners(res.data))
      .catch((err) => {
        console.error("Error fetching documents:", err);
        alert("Failed to fetch documents");
      })
      .finally(() => setIsLoading(false));
  };

  // Updated: Accepts both partnerDocId and partnerId
  const handleVerification = async (partnerDocId, partnerId, action) => {
    try {
      const Token = localStorage.getItem("adminToken");

      let endpoint;
      if (action === "verify") {
        endpoint = `${BASE_URL}/api/admin/partners/${partnerDocId}/verify`;
      } else {
        endpoint = `${BASE_URL}/api/admin/partners/${partnerId}/decline`;
      }

      await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      alert(`Partner ${action}ed successfully`);
      fetchPartners();
    } catch (err) {
      console.error(`Failed to ${action} partner`, err);
      alert(`${action === "verify" ? "Verification" : "Decline"} failed`);
    }
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Partner Documents
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">No partner documents submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {partners.map((partner) => (
            <div key={partner._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 truncate">
                {partner.name} <span className="text-gray-500">({partner.email})</span>
              </h3>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                {partner.documents && Object.entries(partner.documents).map(([key, url]) => (
                  url && (
                    <div key={key} className="flex flex-col">
                      <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <a 
                        href={`${BASE_URL}/${url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-800 underline truncate"
                      >
                        View PDF
                      </a>
                    </div>
                  )
                ))}
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4 mt-3">
                <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                  (partner.verificationStatus ?? "pending") === "verified"
                    ? "bg-green-100 text-green-800"
                    : (partner.verificationStatus ?? "pending") === "declined"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  Status: {partner.verificationStatus ?? "pending"}
                </span>

                {(partner.verificationStatus ?? "pending") === "pending" && partner.partnerDocId && (
                  <div className="flex gap-2 sm:gap-4">
                    <button
                      onClick={() => handleVerification(partner.partnerDocId, partner._id, "verify")}
                      className="bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-green-700 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerification(partner.partnerDocId, partner._id, "decline")}
                      className="bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}