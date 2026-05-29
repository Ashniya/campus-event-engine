const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('./models/Event');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_events';

const seedEvents = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check for admin user or create a dummy user
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
             console.log("No admin user found. Creating an admin user for the organizer.");
             const salt = await bcrypt.genSalt(10);
             const hashedPassword = await bcrypt.hash('admin123', salt);
             user = await User.create({
                 name: 'Admin Organizer',
                 email: 'admin@example.com',
                 password: hashedPassword,
                 role: 'admin'
             });
        }

        const events = [
            {
                title: "Music Festival 2026",
                description: "Join us for the biggest campus music festival of the year featuring live bands, DJs, and food trucks.",
                date: new Date("2026-12-25"),
                capacity: 500,
                category: "Cultural",
                venue: "Main Quad",
                time: "18:00",
                imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                organizer: user._id,
                registeredUsers: []
            },
            {
                title: "Tech Innovators Hackathon",
                description: "A 48-hour coding marathon. Build solutions, win prizes, and network with top tech companies.",
                date: new Date("2026-11-15"),
                capacity: 150,
                category: "Technical",
                venue: "Innovation Hub",
                time: "09:00",
                imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                organizer: user._id,
                registeredUsers: []
            },
            {
                title: "Annual Sports Meet",
                description: "Cheer for your department in track and field, basketball, and more. Trophies for the winners!",
                date: new Date("2026-10-20"),
                capacity: 1000,
                category: "Sports",
                venue: "University Stadium",
                time: "08:00",
                imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                organizer: user._id,
                registeredUsers: []
            },
            {
                title: "Alumni Networking Night",
                description: "Connect with successful alumni from various industries. A great opportunity for career growth.",
                date: new Date("2026-09-05"),
                capacity: 200,
                category: "Seminar",
                venue: "Conference Center",
                time: "17:30",
                imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                organizer: user._id,
                registeredUsers: []
            }
        ];

        // Clear existing events
        await Event.deleteMany();
        
        await Event.insertMany(events);
        console.log('Dummy events seeded successfully!');
        
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

seedEvents();
