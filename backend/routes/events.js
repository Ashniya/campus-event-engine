const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name')
            .populate('registeredUsers', 'name email collegeUid')
            .sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name')
            .populate('registeredUsers', 'name email collegeUid');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an event (Protected, could check for 'admin' role)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, date, capacity, category, venue, time, imageUrl } = req.body;
        const newEvent = new Event({
            title,
            description,
            date,
            capacity,
            category,
            venue,
            time,
            imageUrl,
            organizer: req.user.id
        });

        const event = await newEvent.save();

        // 1. Create In-App Notification for all students
        try {
            const formattedDate = event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
            const newNotif = new Notification({
                text: `✨ New Event Published: "${event.title}"! Join us at ${event.venue || 'Main Campus'} on ${formattedDate}.`,
                emoji: '🎫'
            });
            await newNotif.save();
            console.log('In-app notification created for new event:', event.title);
        } catch (notifErr) {
            console.error('Failed to create in-app notification:', notifErr.message);
        }

        // 2. Fetch all student emails and send email announcements
        try {
            const students = await User.find({ role: 'student' }).select('email name');
            if (students.length > 0) {
                const formattedEmailDate = event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';
                const emailPromises = students.map(student => 
                    sendEmail({
                        to: student.email,
                        subject: `New Campus Event: ${event.title}`,
                        text: `Hi ${student.name},\n\nA new event has been published on Campus Event Engine!\n\nEvent: ${event.title}\nDate: ${formattedEmailDate}\nVenue: ${event.venue || 'Main Campus'}\n\nLog in to your account to register now!\n\nBest regards,\nCampus Event Engine Team`,
                        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fafafa;">
                            <h2 style="color: #f97316; text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px;">New Event Announcement!</h2>
                            <p style="font-size: 16px; color: #333;">Hi <strong>${student.name}</strong>,</p>
                            <p style="font-size: 15px; color: #555; line-height: 1.6;">A new event has been published and is now open for registration:</p>
                            <div style="background-color: #fff; border: 1px solid #ddd; border-left: 4px solid #f97316; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #111;">${event.title}</h3>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">📅 <strong>Date:</strong> ${formattedEmailDate}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">📍 <strong>Venue:</strong> ${event.venue || 'Main Campus'}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">🏷️ <strong>Category:</strong> ${event.category || 'General'}</p>
                            </div>
                            <p style="text-align: center; margin-top: 30px;">
                                <a href="http://localhost:5173/login" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 100px; font-weight: bold; box-shadow: 0 4px 15px rgba(249,115,22,0.3);">Register Now</a>
                            </p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 15px;" />
                            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated notification from Campus Event Engine. Please do not reply to this email.</p>
                        </div>`
                    })
                );
                // Dispatch emails in background so it doesn't block API response
                Promise.all(emailPromises).catch(err => console.error('Failed to dispatch event email notifications:', err));
            }
        } catch (emailErr) {
            console.error('Failed to initiate email announcements:', emailErr.message);
        }

        res.status(201).json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update event (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, date, capacity, category, venue, time, imageUrl } = req.body;
        let event = await Event.findById(req.params.id);
        
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check user authorization (only organizer or admin should update, simplified here)
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, date, capacity, category, venue, time, imageUrl } },
            { new: true }
        );
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete event (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Register for event (Protected)
router.post('/:id/register', auth, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check capacity
        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ message: 'Event is at full capacity' });
        }

        // Check if already registered
        if (event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        event.registeredUsers.push(req.user.id);
        await event.save();
        res.json({ message: 'Successfully registered for the event', event });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
