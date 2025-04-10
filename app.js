// app.js - Main application file
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Store stream URL securely on server side
// sandbix const STREAM_URL = 'https://ams.sandbrix.live/LiveApp/streams/vC19gZapiqRVC2ry35467275934172.m3u8';
// Tsport
// const STREAM_URL = 'https://live-test.tsports.com/live-02/master_1080.m3u8?hdntl=Expires=1744293989~_GO=Generated~URLPrefix=aHR0cHM6Ly9saXZlLXRlc3QudHNwb3J0cy5jb20v~Signature=AVTZpUuvMAO0jMjVeCqYzxZGHNJAbHTlTRUDnSB_tOogMNAb2O8PbntNmK9b6Bd7nzjkrPaWLsrB8rPMt6J0MsbpBlAM';
// smartcric.ch 
//chttps://003.fclplayer.net/live/csstream1/chunklist.m3u8?vidictid=201886909031&id=1001&pk=b1f3e63c5bb79b8bef6fe4b35c7d59b01ab29937fa20606825cebb7c2fdb3b43';

//https://eplayhd.com/live/tsports/
const STREAM_URL = 'https://live.tsports.com/?bitrate=1024000&channel=tsports_live_2_720&res=720'
// Secret key for token validation (should be stored in environment variables in production)
const SECRET_KEY = process.env.SECRET_KEY || 'your-secure-secret-key-change-this';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Watch Live route - generates a token and redirects to watch page
app.get('/watch', (req, res) => {
  const timestamp = Date.now();
  const sessionToken = crypto.createHash('md5')
    .update(`${timestamp}-${SECRET_KEY}`)
    .digest('hex');
    
  res.redirect(`/watch-stream?token=${sessionToken}&t=${timestamp}`);
});

// Actual watch page with the video player
app.get('/watch-stream', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

// Simple API endpoint to get the stream URL with token validation
app.get('/api/stream-url', (req, res) => {
  const { token, t } = req.query;
  
  if (!token || !t) {
    return res.status(403).json({ error: 'Missing parameters' });
  }
  
  // Validate the token
  const expectedToken = crypto.createHash('md5')
    .update(`${t}-${SECRET_KEY}`)
    .digest('hex');
    
  // Check if token is valid and not expired (valid for 6 hours)
  const currentTime = Date.now();
  const tokenTime = parseInt(t, 10);
  const tokenExpiration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  if (token !== expectedToken || currentTime - tokenTime > tokenExpiration) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  // Return the stream URL directly - it's still protected by the token authentication
  res.json({ streamUrl: STREAM_URL });
});

// Time Table route
app.get('/timetable', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timetable.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
