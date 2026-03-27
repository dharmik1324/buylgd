const Support = require("../../models/Support");
const { createNotification } = require("./notificationController");

const createSupportTicket = async (req, res) => {
    try {
        const { subject, message, diamondId, appliedFilters } = req.body;
        const userId = req.user.id;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: "Subject and message are required" });
        }

        const newTicket = new Support({
            user: userId,
            diamond: diamondId || null,
            subject,
            messages: [{
                sender: "user",
                text: message,
                createdAt: Date.now()
            }],
            appliedFilters: appliedFilters || {}
        });

        await newTicket.save();

        // Notify Admin
        await createNotification({
            title: "New Diamond Inquiry",
            message: `${req.user.name || 'someone'} is inquiring about diamonds with specific filters.`,
            type: "support",
            icon: "help-circle",
            link: "/admin/inquiries",
            metadata: { ticketId: newTicket._id, userId }
        });

        res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
        console.error("Error creating support ticket:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Support.find()
            .populate("user", "name email contact companyName image")
            .populate("diamond", "Stock Shape Weight Color Clarity")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply } = req.body;

        if (!adminReply) {
            return res.status(400).json({ success: false, message: "Reply message is required" });
        }

        const ticket = await Support.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.messages.push({
            sender: "admin",
            text: adminReply,
            createdAt: Date.now()
        });
        ticket.status = "replied";
        ticket.updatedAt = Date.now();

        await ticket.save();
        
        const updatedTicket = await Support.findById(id)
            .populate("user", "name email contact companyName image")
            .populate("diamond", "Stock Shape Weight Color Clarity");

        res.status(200).json({ success: true, data: updatedTicket });
    } catch (error) {
        console.error("Error replying to ticket:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addUserMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const ticket = await Support.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.messages.push({
            sender: "user",
            text: message,
            createdAt: Date.now()
        });
        ticket.status = "pending";
        ticket.updatedAt = Date.now();

        await ticket.save();

        // Notify Admin of new message
        await createNotification({
            title: "New Message from User",
            message: `${req.user.name || 'someone'} replied to an inquiry.`,
            type: "support",
            icon: "message-square",
            link: "/admin/inquiries",
            metadata: { ticketId: ticket._id, userId: req.user.id }
        }).catch(err => console.error("Notification Error:", err));

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        console.error("Error adding message to ticket:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        await Support.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await Support.find({ user: userId })
            .populate("diamond", "Stock Shape Weight Color Clarity")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        console.error("Error fetching user tickets:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await Support.findByIdAndUpdate(id, { status }, { new: true });
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

module.exports = {
    createSupportTicket,
    getAllTickets,
    replyToTicket,
    addUserMessage,
    deleteTicket,
    getMyTickets,
    updateTicketStatus
};
