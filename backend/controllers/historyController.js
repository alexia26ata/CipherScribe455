const Message = require('../models/Message');

exports.getHistory = async (req, res) => {
    const messages = await Message.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(messages);
};

exports.clearHistory = async (req, res) => {
    try {
      await Message.deleteMany({ user: req.user.id });
      res.json({ message: "History cleared" });
    } catch (err) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  };
  
  exports.deleteHistoryItem = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await Message.findOneAndDelete({ _id: id, user: req.user.id });
      if (!result) return res.status(404).json({ error: "Item not found" });
      res.json({ message: "Item deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  };
  