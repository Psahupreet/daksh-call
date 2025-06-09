import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialPersonal = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  address: "",
};

export default function UploadDocuments() {
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState(initialPersonal);
  const [personalError, setPersonalError] = useState("");
  const [documents, setDocuments] = useState({});
  const [docError, setDocError] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharStatus, setAadharStatus] = useState(null);
  const [policeVerificationFile, setPoliceVerificationFile] = useState(null);
  const [policeVerificationStatus, setPoliceVerificationStatus] = useState(null);

  // For status after upload
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("partnerToken");
  const navigate = useNavigate();

  // Check document status on mount
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
        .catch(() => {});
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

  // ---- Step 1: PERSONAL DETAILS ----
  const handlePersonalChange = (e) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
    setPersonalError("");
  };
  const validatePersonal = () => {
    for (let key of Object.keys(initialPersonal)) {
      if (!personal[key].trim()) {
        setPersonalError("All fields are required.");
        return false;
      }
    }
    setPersonalError("");
    return true;
  };

  // ---- Step 2: DOCUMENTS ----
  const handleDocChange = (e) => {
    setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
    setDocError("");
  };
  // Only degree is optional, rest required
  const requiredDocs = [
    "aadhaar",
    "pan",
    "marksheet10",
    "marksheet12",
    "diploma",
    "policeVerification"
  ];
  const allDocs = [
    ...requiredDocs,
    "degree"
  ];
  const validateDocuments = () => {
    for (let key of requiredDocs) {
      if (!documents[key]) {
        setDocError("All required documents must be uploaded.");
        return false;
      }
    }
    setDocError("");
    return true;
  };

  // ---- Step 3: Aadhaar Verification (optional) ----
  const handleAadharVerify = async () => {
    setAadharStatus("verifying");
    try {
      // Replace with your Aadhaar verification API if any
      await new Promise((r) => setTimeout(r, 1500)); // Fake delay
      setAadharStatus("verified");
      alert("Aadhaar verified successfully!");
    } catch {
      setAadharStatus("error");
      alert("Aadhaar verification failed.");
    }
  };

  // ---- Step 4: Police Verification (optional upload) ----
  const handlePoliceVerificationFile = (e) => {
    setPoliceVerificationFile(e.target.files[0]);
  };

  // ---- Submit all data ----
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Submit personal details
    try {
      await axios.post(`${BASE_URL}/api/partners/update-personal-details`, personal, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.message || "Failed to submit personal details");
      return;
    }

    // 2. Submit documents
    const form = new FormData();
    allDocs.forEach((key) => {
      if (documents[key]) form.append(key, documents[key]);
    });
    // Optionally include police verification file from step 4
    if (policeVerificationFile) form.append("policeVerification", policeVerificationFile);

    try {
      await axios.post(`${BASE_URL}/api/partners/upload-documents`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.message || "Document upload failed");
      return;
    }
    setIsLoading(false);
    setAlreadyUploaded(true);
    setVerificationStatus("pending");
    alert("Documents and details uploaded successfully.");
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerInfo");
    navigate("/partner-login");
  };

  // ---- Steps UI ----
  const StepIndicator = () => (
    <div className="flex justify-center gap-2 mb-6">
      {["Personal Details", "Documents", "Aadhaar (Optional)", "Police Verification (Optional)"].map(
        (label, idx) => (
          <div
            key={label}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              step === idx + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {idx + 1}. {label}
          </div>
        )
      )}
    </div>
  );

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Partner Onboarding</h1>
          <p className="mt-2 text-gray-600">
            Complete all required steps. Personal details and document upload are <b>mandatory</b>. Aadhaar and Police Verification are <span className="text-blue-600">optional for now</span>.
          </p>
        </div>

        <StepIndicator />

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
            {/* ---- Step 1: Personal Details ---- */}
            {step === 1 && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (validatePersonal()) setStep(2);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Full Name<span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" value={personal.fullName} onChange={handlePersonalChange} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email<span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={personal.email} onChange={handlePersonalChange} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone<span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={personal.phone} onChange={handlePersonalChange} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Date of Birth<span className="text-red-500">*</span></label>
                    <input type="date" name="dob" value={personal.dob} onChange={handlePersonalChange} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Gender<span className="text-red-500">*</span></label>
                    <select name="gender" value={personal.gender} onChange={handlePersonalChange} className="input" required>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium">Address<span className="text-red-500">*</span></label>
                    <textarea name="address" value={personal.address} onChange={handlePersonalChange} className="input" rows={2} required />
                  </div>
                </div>
                {personalError && <div className="text-red-600 text-sm">{personalError}</div>}
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">Next: Documents</button>
                </div>
              </form>
            )}

            {/* ---- Step 2: Documents ---- */}
            {step === 2 && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (validateDocuments()) setStep(3);
                }}
                className="space-y-4"
              >
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Upload all required documents (PDF only). Degree is optional.
                </div>
                {allDocs.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">
                      {field.replace("marksheet10", "10th Marksheet").replace("marksheet12", "12th Marksheet").replace(/([A-Z])/g, " $1").replace(/^./, m => m.toUpperCase())}
                      {field !== "degree" && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="file"
                      name={field}
                      accept="application/pdf"
                      required={field !== "degree"}
                      onChange={handleDocChange}
                      className="input"
                    />
                  </div>
                ))}
                {docError && <div className="text-red-600 text-sm">{docError}</div>}
                <div className="flex justify-between">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn-primary">Next: Aadhaar</button>
                </div>
              </form>
            )}

            {/* ---- Step 3: Aadhaar Verification (Optional) ---- */}
            {step === 3 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Aadhaar verification is optional for now. You can complete it later.</p>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Aadhaar Number</label>
                  <input type="text" value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} className="input" maxLength={12} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAadharVerify}
                    type="button"
                    className="btn-primary"
                    disabled={aadharStatus === "verifying" || !aadharNumber}
                  >
                    {aadharStatus === "verifying" ? "Verifying..." : "Verify Aadhaar"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                  <button type="button" className="btn-primary" onClick={() => setStep(4)}>Next: Police Verification</button>
                </div>
                {aadharStatus === "verified" && <div className="text-green-600 mt-2">Aadhaar Verified!</div>}
                {aadharStatus === "error" && <div className="text-red-600 mt-2">Aadhaar verification failed.</div>}
              </div>
            )}

            {/* ---- Step 4: Police Verification (Optional) ---- */}
            {step === 4 && (
              <form
                onSubmit={handleSubmitAll}
                className="space-y-4"
              >
                <div className="mb-2">
                  <label className="block text-sm font-medium">Upload Police Verification (optional, PDF)</label>
                  <input type="file" accept="application/pdf" onChange={handlePoliceVerificationFile} className="input" />
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit All"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      <style>
        {`
        .input {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem;
          width: 100%;
          font-size: 1rem;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 600;
        }
        .btn-secondary {
          background: #e5e7eb;
          color: #111827;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 600;
        }
        `}
      </style>
    </div>
  );
}