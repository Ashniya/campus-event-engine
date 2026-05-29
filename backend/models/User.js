const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }, // student or admin
    collegeUid: { type: String, default: '' },   // College UID / Roll number
    lastReadNotifications: { type: Date, default: () => new Date(0) }
});

module.exports = mongoose.model('User', userSchema);
