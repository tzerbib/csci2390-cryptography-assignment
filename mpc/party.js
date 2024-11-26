const OPTIONS = ["DuneBrothers", "AleppoSweets", "GiftHorse", "BayberryGarden"];

// What to vote for is a command line argument
const voteFor = process.argv[2];
if (OPTIONS.indexOf(voteFor) < 0) {
    console.log('Invalid vote option');
    return;
}

// Setup a JIFF client and connect to the server.
function connect() {
  const { JIFFClient } = require('jiff-mpc');
  const jiffClient = new JIFFClient('http://localhost:10000', 'homework', {
    autoConnect: true,
    party_count: 3,
    onConnect: start,
    crypto_provider: true,
    // Shamir secret sharing operates modulo a prime number
    // If you solve the bonus question, consider making this a smaller prime number,
    // e.g. 13,
    // and see what impact this has on performance ;)
    Zp: 16777729
    // Zp: 13
  });
}

// The MPC computation
// Your solution goes here.
async function start(jiffClient) {
  // Iterate over every option
  for (let i = 0; i < OPTIONS.length; i++) {
      // Secret share 1 if this matches the user's vote, 0 otherwise.
      let vote = (i == OPTIONS.indexOf(voteFor))? 1 : 0
      let shares = jiffClient.share(vote);

      // Bonus question solution goes here: do sanity check to make sure none
      // of the users are cheating with their votes.
      for(let client = 1; client <= jiffClient.party_count; ++client){
        let check_0 = await jiffClient.open(shares[client].eq(0));
        let check_1 = await jiffClient.open(shares[client].eq(1));
        let correct = check_0 || check_1;
        if(!correct){
          console.log("\tIncorrect vote of client", client, "for", OPTIONS[i]);
        }
      }

      // Sum all the vote shares for this option
      // Look at https://github.com/multiparty/jiff-standalone-example/blob/a4aa88d562024b224dfef290a019b3c1dff33e10/party.js#L39
      let sum = shares[1];
      for (let i = 2; i <= jiffClient.party_count; i++) {
        sum = sum.sadd(shares[i]);
      }
  
      // Reveal the total vote tally for this option and print it.
      // Look at https://github.com/multiparty/jiff-standalone-example/blob/a4aa88d562024b224dfef290a019b3c1dff33e10/party.js#L45
      const output = await jiffClient.open(sum);
      console.log(OPTIONS[i], output.toString());

      // Inspect the share for option DuneBrothers, for client 1
      // let inspectedOption = "DuneBrothers"
      // let inspectedClient = 1; // Client id start at 1, not 0!
      // if(OPTIONS[i] == inspectedOption){
      //   console.log('value of share', await shares[inspectedClient].value);
      // }
  }
  
  // disconnect safely.
  jiffClient.disconnect(true, true);
}

// Connect and start computation
connect();
