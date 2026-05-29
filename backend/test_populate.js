const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_events';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    const Event = mongoose.model('Event', new mongoose.Schema({
      title: String,
      registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }));
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      collegeUid: String
    }));

    const events = await Event.find().populate('registeredUsers');
    console.log('Events from DB:');
    events.forEach(e => {
      console.log(`Event: ${e.title}`);
      console.log(`RegisteredUsers:`, JSON.stringify(e.registeredUsers, null, 2));
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
