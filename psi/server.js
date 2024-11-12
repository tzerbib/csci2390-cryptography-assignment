// server
const PASSWORDS = require('./badpasswords.json');
const net = require('net');
const OPRF = require('oprf');
const oprf = new OPRF();

// Starts a server that listens to connections.
function startServer() {
    // Listen on socket.
    const server =  net.createServer(
      function (socket) {
        console.log('connected');
        socket.on('data', function (data) {
            const payload = psi(socket, data.toString());
            socket.write(JSON.stringify(payload));
        });
        socket.on('close', function () {
            console.log('done');
            server.close();
        });
    });

    server.listen(9009);
    console.log('listening on 9009..');
}

// Your solution goes here.
function psi(socket, data) {
    // Decode the query point.
    const query = oprf.decodePoint(data, 'ASCII');
    
    // Hash all bad passwords to a point on the elliptic curve.
    const points = PASSWORDS.map(function(password) {
        return oprf.hashToPoint(password);
    });


    // You probably want to mask the query and the password points
    // and return them back to the client.
    // ...

    // Send masked query and points to client.
    return {
        // maskedQuery: encoded masked query,
        // maskedPoints: encoded masked points
    };
 
}

// Start the server
oprf.ready.then(function() {
    startServer();
});
