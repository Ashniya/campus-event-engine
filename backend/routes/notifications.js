const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const lastRead = user.lastReadNotifications || new Date(0);
        
        let unreadCount = 0;
        const formattedNotifs = notifications.map(notif => {
            const isRead = notif.createdAt <= lastRead;
            if (!isRead) unreadCount++;
            return {
                id: notif._id,
                text: notif.text,
                emoji: notif.emoji,
                time: getRelativeTime(notif.createdAt),
                read: isRead,
                createdAt: notif.createdAt
            };
        });

        res.json({
            notifications: formattedNotifs,
            unreadCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark all notifications as read
router.put('/read', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $set: { lastReadNotifications: new Date() }
        });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new notification (Admin announcement)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }

        const { text, emoji } = req.body;
        if (!text) return res.status(400).json({ message: 'Text content is required' });

        const newNotif = new Notification({
            text,
            emoji: emoji || '📢'
        });

        await newNotif.save();
        res.status(201).json(newNotif);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
}

module.exports = router;
