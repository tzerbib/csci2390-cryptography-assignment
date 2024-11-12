// client
const net = require('net');
const OPRF = require('oprf');
const oprf = new OPRF();

// Password is a command line argument.
const password = process.argv[2];
console.log('Checking if "' + password + '" is bad');

// Helper function to check if two elliptic curve points are equal.
function pointsEqual(point1, point2) {
    if (point1.length != point2.length) {
        return false;
    }
    
    for (let i = 0; i < point1.length; i++) {
        if (point1[i] != point2[i]) {
            return false;
        }
    }
    
    return true;
}

// Connect to server and begin PSI protocol.
function startClient() {
    const socket = net.Socket();
    socket.connect(9009);
    
    // Prepare query.
    const query = makeQuery(password);
    console.log(query);
    socket.write(query);
    socket.on('data', function (data) {
        if (handleResponse(JSON.parse(data))) {
            console.log('Good password!');
        } else {
            console.log('Bad password');
        }
        socket.end();
    });
}

// Make PSI query: this part is provided for you.
function makeQuery(password) {
    // Make the mask a global variable so you can use it in handleResponse() too
    global.mask;
    
    // Make a random mask.
    global.mask = oprf.generateRandomScalar();
    
    // Hash the password to an elliptic curve point, then mask it.
    const point = oprf.hashToPoint(password);
    const maskedPoint = oprf.scalarMult(point, global.mask);
    
    // Encode the point as a string so it can be sent to server easily.
    return oprf.encodePoint(maskedPoint, 'ASCII');
}

// Handle the response.
// The response is exactly the same object as what you return from server.js#psi()
function handleResponse(response) {
    // TODO solution goes here
    
    // You probably want to decode the response points and the masked query
    // then unmask the query using global.mask
    // and check if the unmasked query is equal to any of the points.
    // ...
    
    // return true if the password is ok, false if it is one of the bad passwords.
}

// Start the server
oprf.ready.then(function() {
   startClient(); 
});
