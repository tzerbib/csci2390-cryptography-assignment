# Private Information Retrieval (PIR)

PIR allows a client to issue a private query (call it q) to a server that has a public database (call it DB).

PIR guarantees that the query is unknown to the server, while still enabling the server to respond to the query and send the output. 
We can think of this as the server seeeing an encrypted or obfuscated version of the query.

In its most basic form, PIR supports a DB where the keys and queries are numbers between [0, size of DB), and the values are some fixed-size byte string.
Specifically, basic PIR does not support *gaps* (e.g. all indices must be mapped to something),
and does not support variable sized values for security (e.g. all values must be 0-padded to some maximum length).

This homework uses a state-of-the-art PIR protocol, checklist, written in golang.

## Running the protocol

Make sure you have go installed. We tested this using go `v1.13` and `v1.16`.

Run `go build` to compile the code, if you see some warnings, ignore them.

After building, execute `./run.sh` to run a simple version of the protocol.
This will execute a single query against a fixed database with 4 elements.

You can find the database in `checklist_server.go` and the query in `checklist_client.go`.

## Info about checklist

Checklist is a 2 server PIR protocol: it requires that the database be available to 2 non-colluding servers.

The client then communicates with both servers, sending each some seemingly random information. Each server responds separately, and the client combines their responses to get the final output.

The authors of checklist used it to implement a privacy-preserving version of Google's Safe Browsing: essentially using PIR to look up whether a URL that a user wants to visit is known to host malware without revealing the URL to the service.

You can see the paper here if you are curious [https://www.usenix.org/conference/usenixsecurity21/presentation/kogan](https://www.usenix.org/conference/usenixsecurity21/presentation/kogan)

## Your task

First, run the code and observe the output. Familiarize yourself with the code in the two go files.

Then, note that the DB here has string keys. Remember, basic PIR only supports contigious indices lookups. The way the provided code gets around this is by fixing an order on these keys:
1. The server pre-processed the DB, replacing the keys with their index in this order.
2. The client has a hardcoded list of all these keys in order. When making a query, the client code looks up the index of the desired key, and then queries it using PIR.

This is clearly not ideal: it requires storing the entire key list at the client side. Imagine if there are millions of keys!

Your task is to find a different way to translate the keys from strings to contiguous indices. Use information about the keys in the database: the keys are all 2 character strings!

Hint 1: consider either hashing the strings, or building a hash-like function yourself that transforms the string to a number, e.g. using ASCII encoding.

Hint 2: alternatively, consider enumerating all of the length-2 strings in the english alphabet and coming up with some succinct way of determining the location of a particular string in that order.

Hint 3: your scheme will likely translate strings to a domain larger than 4, i.e., it will have gaps (it has to translate other similar strings, e.g. az or xy), make sure the entire domain is mapped to equal sized values in the DB.

Whatever scheme you end up using, you will need to implement it in `key_to_index(...)`  in **both** `checklist_client.go` and `checklist_server.go`.
You may also need to modify `database()` in `checklist_server.go` to ensure the entire domain is mapped in the database with no gaps.

Your final solution **should not** have a hardcoded list of keys on the client side!



