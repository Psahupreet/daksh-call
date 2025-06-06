import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default function UploadDocuments() {
  const [formData, setFormData] = useState({});
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("partnerToken");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(`${BASE_URL}/api/partners/check-documents`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setAlreadyUploaded(res.data.isDocumentsSubmitted);
          setVerificationStatus(res.data.status || "pending");

          if (res.data.status === "verified") {
            clearInterval(interval);
            navigate("/partner-dashboard");
          }
        })
        .catch(() => console.log("Status check failed"));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, token]);

  useEffect(() => {
    let timer;
    if (alreadyUploaded && verificationStatus !== "declined") {
      timer = setTimeout(() => {
        setShowLoginButton(true);
      }, 5 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [alreadyUploaded, verificationStatus]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => form.append(key, val));

    try {
      await axios.post(`${BASE_URL}/api/partners/upload-documents`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Documents uploaded successfully.");
      setAlreadyUploaded(true);
      setVerificationStatus("pending");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerInfo");
    navigate("/partner-login");
  };

  const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (match) => match.toUpperCase())
      .replace("10", "10th")
      .replace("12", "12th");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Document Verification</h1>
          <p className="mt-2 text-gray-600">
            {alreadyUploaded 
              ? "Your documents are being processed"
              : "Upload your documents to complete your profile"}
          </p>
        </div>

        {alreadyUploaded ? (
          verificationStatus === "declined" ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">
                    Your documents were declined. Please contact support or re-apply with correct documents.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">
                      Your documents have been successfully uploaded and are under review. 
                      Please wait for 2 working days for verification. We will contact you soon.
                    </p>
                  </div>
                </div>
              </div>
              
              {showLoginButton && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoginRedirect}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login Page
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> All documents are mandatory except Degree Certificate. 
                    Upload only <strong>PDF</strong> files. Police verification is <strong>required</strong>.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                "aadhaar",
                "pan",
                "marksheet10",
                "marksheet12",
                "diploma",
                "degree",
                "policeVerification",
              ].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {formatLabel(field)}
                    {field !== "degree" && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="file"
                      name={field}
                      accept="application/pdf"
                      required={field !== "degree"}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 p-2 border"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : 'Submit Documents'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}