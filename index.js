const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to use EJS
app.set('view engine', 'ejs');

let suggestions = []; // Store suggestions in memory

// Serve the index.html file
app.get('/', (req, res) => {
  res.render('index');
});

// Serve the admin.ejs file
app.get('/admin', (req, res) => {
  res.render('admin', { suggestions: suggestions });
});

// Handle POST requests to submit suggestions
app.post('/suggestions', (req, res) => {
  const suggestion = req.body.suggestion;
  console.log(`Received suggestion: ${suggestion}`);
  
  // Append the suggestion to the suggestions.txt file
  fs.appendFile('suggestions.txt', `${suggestion}\n`, (err) => {
    if (err) {
      console.error('Error appending suggestion:', err);
      res.status(500).send('Error submitting suggestion');
    } else {
      // Send the suggestion to the admin page via WebSocket
      io.emit('newSuggestion', suggestion);

      // Update the stored suggestions
      suggestions.push(suggestion);

      res.send('Thank you for your suggestion!');
    }
  });
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('A user has connected');

  // Handle new suggestion event
  socket.on('newSuggestion', (suggestion) => {
    console.log('New suggestion:', suggestion);
    io.emit('newSuggestion', suggestion);

    // Update the stored suggestions
    suggestions.push(suggestion);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user has disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
