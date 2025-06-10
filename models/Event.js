// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    required: true,
    trim: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: {
    type: String,
    required: true
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: {
    type: String,
    required: true,
    enum: ['Conference', 'Workshop', 'Social', 'Sports', 'Other']
  },
  capacity: { 
    type: Number,
    required: true,
    min: 1
  },
  registeredAttendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
    default: 'Draft'
  },
  imageUrl: {
    type: String,
    default: '/images/default-event.jpg'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registeredAttendees.length >= this.capacity;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.registeredAttendees.length;
});

module.exports = mongoose.model('Event', eventSchema);
