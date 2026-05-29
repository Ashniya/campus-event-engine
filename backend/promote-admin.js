const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_events';

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address. Example: node promote-admin.js user@example.com");
    process.exit(1);
}

const promoteUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            mongoose.connection.close();
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`Successfully promoted ${email} to admin!`);
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
        process.exit(1);
    }
};

promoteUser();
