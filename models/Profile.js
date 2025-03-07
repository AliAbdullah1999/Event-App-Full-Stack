
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bio: { 
    type: String, 
    trim: true 
  },
  avatarUrl: { 
    type: String, 
    trim: true 
  },
  socialLinks: {
    type: Map,
    of: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Profile', profileSchema);