const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth-middleware");
const {
    createSupportTicket,
    getAllTickets,
    replyToTicket,
    deleteTicket,
    getMyTickets,
    updateTicketStatus,
    addUserMessage
} = require("../../controller/admin/supportController");
router.post("/ask", authMiddleware, createSupportTicket);
router.post("/message/:id", authMiddleware, addUserMessage);
router.get("/my", authMiddleware, getMyTickets);

// Admin routes (Postman: GET /api/support/admin/inquiries)
router.get("/admin/inquiries", authMiddleware, getAllTickets);
router.put("/reply/:id", authMiddleware, replyToTicket);
router.put("/status/:id", authMiddleware, updateTicketStatus);
router.delete("/:id", authMiddleware, deleteTicket);

module.exports = router;
