// routes/partnerRoutes.js
import express from "express";
import {
  registerPartner,
  verifyOTP,
  loginPartner,
  getAllPartners,
  deletePartner,
  getPartnerDashboardStats,forgotPassword, resetPassword,getMe
  // uploadDocuments, // ✅ NEW controller
} from "../controllers/partnerController.js";
import  {uploadPartnerDocuments,updateDocumentStatus}   from "../controllers/partnerDocs.js";
import { checkDocumentsStatus } from "../controllers/partnerDocs.js";
import { adminProtect } from "../middleware/adminAuthMiddleware.js";
// import { uploadDocs } from "../middleware/upload.js";
import  partnerAuth from "../middleware/partnerAuth.js";
import { protectPartner,uploadDocAccess,authPartner } from "../middleware/authPartner.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Authenticated partner details
router.get("/me", protectPartner, getMe);

// ✅ Existing routes
router.post("/register", registerPartner);
router.get("/", getAllPartners);
router.delete("/:id", deletePartner);
router.post("/verify", verifyOTP);
router.post("/login", loginPartner);

router.get("/check-documents", partnerAuth, checkDocumentsStatus);
router.post(
  "/upload-documents",
  authPartner,
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "marksheet10", maxCount: 1 },
    { name: "marksheet12", maxCount: 1 },
    { name: "diploma", maxCount: 1 },
    { name: "degree", maxCount: 1 },
    { name: "policeVerification", maxCount: 1 },
  ]),
  uploadPartnerDocuments
);

// Admin verifies or declines partner documents
router.put("/verify-documents/:partnerId", adminProtect, updateDocumentStatus);

//get partner dashboards 
router.get("/dashboard-stats",protectPartner , getPartnerDashboardStats);

router.post('/forget-password-partner', forgotPassword);
router.put('/reset-password-partner/:token', resetPassword);

export default router;
