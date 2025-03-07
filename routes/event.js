const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ...existing code...

app.use('/event', router);

router.get('/', (req, res) => {
  // Fetch events from the database or any other source
  const events = [
    { name: 'Event 1', date: '2023-10-01' },
    { name: 'Event 2', date: '2023-10-15' }
  ];

  // Ensure events are passed to the view
  res.render('events', { events });
});

// ...existing code...

module.exports = router;
