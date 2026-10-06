import Contact from "../models/contact.model.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "name, email and message are required" });
        }

        const contact = await Contact.create({ name, email, message });
        return res.status(201).json({ message: "Message sent", contact });
    } catch (error) {
        return res.status(500).json({ message: `Failed to send message ${error.message}` });
    }
};
