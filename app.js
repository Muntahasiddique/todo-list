const express = require('express');
const path = require('path');
const homecontroller = require('./routes/todos')
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Only render the page (no API routes needed)
app.use(homecontroller)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});