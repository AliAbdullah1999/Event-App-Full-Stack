// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  capacity: { 
    type: Number,
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Event', eventSchema);
