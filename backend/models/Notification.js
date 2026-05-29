const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    emoji: { type: String, default: '📢' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
