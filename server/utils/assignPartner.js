import Partner from "../models/Partner.js";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

export const assignNextAvailablePartner = async (order) => {
  try {
    const serviceCategory = order.items[0]?.title?.trim();
    if (!serviceCategory) {
      order.requestStatus = "NoPartner";
      order.status = "Declined";
      await order.save();
      return;
    }

    const eligiblePartners = await Partner.find({
      category: serviceCategory,
      isApproved: true,
      isVerified: true,
      isDeclined: false,
      verificationStatus: "verified",
      isDocumentsSubmitted: true,
    });

    // Partners already tried
    const previouslyTriedPartnerIds = order.rejectedPartners || [];
    const availablePartners = eligiblePartners.filter(
      (partner) => !previouslyTriedPartnerIds.includes(partner._id.toString())
    );

    if (availablePartners.length === 0) {
      order.requestStatus = "NoPartner";
      order.status = "Declined";
      await order.save();
      console.log("No partners left; marked as NoPartner/Declined:", order._id);
      return;
    }

    const newPartner = availablePartners[0];
    order.assignedPartner = newPartner._id;
    order.requestStatus = "Pending";
    order.requestExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    order.rejectedPartners = [
      ...previouslyTriedPartnerIds,
      newPartner._id.toString(),
    ];
    await order.save();

    // Optionally: send email notification to newPartner here
     // OPTIONAL: Notify the partner (add your logic here, e.g. email or SMS)
 
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newPartner.email,
      subject: "New Service Request",
      html: `
        <h3>New Service Request Assigned</h3>
        <p><strong>Order:</strong> ${order._id}</p>
        <p><strong>Service:</strong> ${order.items[0]?.title}</p>
        <p><strong>Scheduled Time:</strong> ${order.address?.timeSlot}</p>
        <p>Please log in to your dashboard to accept or decline.</p>
      `,
    });
 
    console.log("Order reassigned to partner:", newPartner._id, "Order:", order._id);
  } catch (err) {
    console.error("Failed to reassign order:", err);
    order.requestStatus = "NoPartner";
    order.status = "Declined";
    await order.save();
  }
};