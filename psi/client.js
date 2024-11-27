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
    
    // Make a random mask. (step 2)
    global.mask = oprf.generateRandomScalar();
    
    // Hash the password to an elliptic curve point, then mask it.
    const point = oprf.hashToPoint(password); // (step 1)
    const maskedPoint = oprf.scalarMult(point, global.mask); // (step 3)
    
    // Encode the point as a string so it can be sent to server easily.
    return oprf.encodePoint(maskedPoint, 'ASCII');
}

// Handle the response.
// The response is exactly the same object as what you return from server.js#psi()
function handleResponse(response) {
    // You probably want to decode the response points and the masked query
    // then unmask the query using global.mask
    // and check if the unmasked query is equal to any of the points. (step 7)
    const maskedPoint = oprf.decodePoint(response.maskedQuery, 'ASCII');
    const unmaskedPoint = oprf.unmaskPoint(maskedPoint, global.mask);

    const unmaskedPasswd = response.maskedPoints.map(function(e){
      return oprf.decodePoint(e, 'ASCII');
    });

    console.log("Test: ", unmaskedPoint);
    // return true if the password is ok, false if it is one of the bad passwords.
    return unmaskedPasswd.every((e) => { // (step 8)
      console.log("vs: ", e, " ", pointsEqual(e, unmaskedPoint));
      if(pointsEqual(e, unmaskedPoint)) {return false};
      return true;
    });
}

// Start the server
oprf.ready.then(function() {
   startClient(); 
});
