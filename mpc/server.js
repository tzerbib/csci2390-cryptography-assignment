var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Create server instance
const { JIFFServer } = require('jiff-mpc');
const jiffServer = new JIFFServer(http, { logs: true });

// Serve static files.
http.listen(10000, function () {
  console.log('listening on *:10000');
});
