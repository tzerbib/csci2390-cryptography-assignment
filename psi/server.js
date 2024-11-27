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

    // Make a random mask. (step 2)
    const mask = oprf.generateRandomScalar();

    // Masking the point and the password (step 5)
    const maskedPoint = oprf.scalarMult(query, mask);
    const maskedPasswd = points.map(function(psw){
      return oprf.scalarMult(psw, mask);
    });

    const encodedPasswd = maskedPasswd.map(function(p){
      return oprf.encodePoint(p, 'ASCII');
    });

    console.log(maskedPasswd);

    // Send masked query and points to client. (step 6)
    return {
      maskedQuery: oprf.encodePoint(maskedPoint, 'ASCII'),
      maskedPoints: encodedPasswd
    };
 
}

// Start the server
oprf.ready.then(function() {
    startServer();
});
