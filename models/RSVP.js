const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['attending', 'not attending', 'maybe'], 
    default: 'maybe' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('RSVP', rsvpSchema);
