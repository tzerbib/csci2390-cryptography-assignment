// client
const net = require('net');
const OPRF = require('oprf');
const oprf = new OPRF();

// Password is a command line argument.
const passwords = process.argv.slice(2);
console.log('Checking if "' + passwords + '" is bad');

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
    const query = makeQuery(passwords);
    console.log(query);
    socket.write(JSON.stringify(query));
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
function makeQuery(passwords) {
    // Make the mask a global variable so you can use it in handleResponse() too
    global.mask;
    
    // Make a random mask. (step 2)
    global.mask = oprf.generateRandomScalar();
    
    // Hash the password to an elliptic curve point, then mask it.
    const points = passwords.map(function(pwd){ // (step 1)
      return oprf.hashToPoint(pwd);
    });
    // (step 3)
    const maskedPoints = points.map(function(pt) {
      return oprf.scalarMult(pt, global.mask);
    });
    
    // Encode the point as a string so it can be sent to server easily.
    const encodedPts = maskedPoints.map(function(mp) {
      return oprf.encodePoint(mp, 'ASCII');
    });

    return encodedPts;
}

// Handle the response.
// The response is exactly the same object as what you return from server.js#psi()
function handleResponse(response) {
    // You probably want to decode the response points and the masked query
    // then unmask the query using global.mask
    // and check if the unmasked query is equal to any of the points. (step 7)
  
    // Decode the response
    const maskedPoints = response.maskedQuery.map(function(ep) {
      return oprf.decodePoint(ep, 'ASCII');
    });
    const unmaskedPasswd = response.maskedPoints.map(function(e){
      return oprf.decodePoint(e, 'ASCII');
    });

    // Unmask the tested and stored passwords
    const unmaskedPoints = maskedPoints.map(function(mp){
      return oprf.unmaskPoint(mp, global.mask);
    });

    // console.log("Test: ", unmaskedPoints);
    
    let correct = true;
    for(let i = 0; i<passwords.length; ++i){
      correct = unmaskedPasswd.every((e) => { // (step 8)
        // console.log(passwords[i], " vs: ", e, " ", pointsEqual(e, unmaskedPoints[i]));
        if(pointsEqual(e, unmaskedPoints[i])) {return false};
        return true;
      });
      if(!correct) {
        console.log('Password "' + passwords[i] + '" is unsafe!');
        break;
      }
    }
    // return true if the password is ok, false if it is one of the bad passwords.
    return correct;
}

// Start the server
oprf.ready.then(function() {
   startClient(); 
});
