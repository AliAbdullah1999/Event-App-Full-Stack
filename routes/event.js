const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { ensureAuthenticated } = require('../middleware/auth');

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Validation middleware
const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('category').isIn(['Conference', 'Workshop', 'Social', 'Sports', 'Other']).withMessage('Valid category is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
];

app.use('/event', router);

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 'Published' })
      .populate('organizer', 'username')
      .sort({ date: 'asc' });
    
    res.render('events/index', { 
      events,
      user: req.user,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (error) {
    req.flash('error', 'Error loading events');
    res.redirect('/');
  }
});

// Get event creation form
router.get('/create', ensureAuthenticated, (req, res) => {
  res.render('events/create', {
    user: req.user,
    messages: {
      error: req.flash('error')
    }
  });
});

// Create new event
router.post('/', ensureAuthenticated, validateEvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(err => err.msg).join(', '));
    return res.redirect('/events/create');
  }

  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });
    await event.save();
    req.flash('success', 'Event created successfully');
    res.redirect(`/events/${event._id}`);
  } catch (error) {
    req.flash('error', 'Error creating event');
    res.redirect('/events/create');
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username')
      .populate('registeredAttendees', 'username');
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    res.render('events/show', {
      event,
      user: req.user,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (error) {
    req.flash('error', 'Error loading event');
    res.redirect('/events');
  }
});

// Get event edit form
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      req.flash('error', 'Not authorized');
      return res.redirect('/events');
    }

    res.render('events/edit', {
      event,
      user: req.user,
      messages: {
        error: req.flash('error')
      }
    });
  } catch (error) {
    req.flash('error', 'Error loading event');
    res.redirect('/events');
  }
});

// Update event
router.put('/:id', ensureAuthenticated, validateEvent, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      req.flash('error', 'Not authorized');
      return res.redirect('/events');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(err => err.msg).join(', '));
      return res.redirect(`/events/${req.params.id}/edit`);
    }

    await Event.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', 'Event updated successfully');
    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    req.flash('error', 'Error updating event');
    res.redirect(`/events/${req.params.id}/edit`);
  }
});

// Delete event
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      req.flash('error', 'Not authorized');
      return res.redirect('/events');
    }

    await Event.findByIdAndDelete(req.params.id);
    req.flash('success', 'Event deleted successfully');
    res.redirect('/events');
  } catch (error) {
    req.flash('error', 'Error deleting event');
    res.redirect('/events');
  }
});

// Register for event
router.post('/:id/register', ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    if (event.status !== 'Published') {
      req.flash('error', 'Event is not available for registration');
      return res.redirect(`/events/${req.params.id}`);
    }

    if (event.isFull) {
      req.flash('error', 'Event is full');
      return res.redirect(`/events/${req.params.id}`);
    }

    if (event.registeredAttendees.includes(req.user._id)) {
      req.flash('error', 'Already registered for this event');
      return res.redirect(`/events/${req.params.id}`);
    }

    event.registeredAttendees.push(req.user._id);
    await event.save();
    
    req.flash('success', 'Successfully registered for event');
    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    req.flash('error', 'Error registering for event');
    res.redirect(`/events/${req.params.id}`);
  }
});

// Cancel registration
router.delete('/:id/register', ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    const attendeeIndex = event.registeredAttendees.indexOf(req.user._id);
    if (attendeeIndex === -1) {
      req.flash('error', 'Not registered for this event');
      return res.redirect(`/events/${req.params.id}`);
    }

    event.registeredAttendees.splice(attendeeIndex, 1);
    await event.save();
    
    req.flash('success', 'Successfully cancelled registration');
    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    req.flash('error', 'Error cancelling registration');
    res.redirect(`/events/${req.params.id}`);
  }
});

module.exports = router;
