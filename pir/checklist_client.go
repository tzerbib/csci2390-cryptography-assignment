// Adapted from https://github.com/dimakogan/checklist/blob/master/cmd/rpc_client/rpc_client.go
package main

import (
	"fmt"
	"time"

	"checklist/driver"
	"checklist/pir"

	"log"
)

var VALUE_LEN = 7;
var KEYS = []string{
    "aa",
    "ab",
    "dc",
    "zz",
}

// Transform key into an index in [0,4)
// TODO make a better version of this
func key_to_index(key string) int {
  for i, e := range KEYS {
    if e == key {
        return i
    }
  }
  return -1
}

// The key we will be querying.
func query_key() int {
  return key_to_index("dc")
}

func main() {
	config := new(driver.Config).AddPirFlags().AddClientFlags()
	config.Parse()
	
  config.UseTLS = false;
  pirtype, _ := pir.PirTypeString("Punc")
  config.PirType = pirtype
	config.NumRows = 4
	config.RowLen = VALUE_LEN;
	config.Updatable = false;
	config.UpdateSize = 0;
	
  // Connect to servers.
	proxyLeft, err := config.ServerDriver()
	if err != nil {
		log.Fatal("Connection error: ", err)
	}
	proxyRight, err := config.Server2Driver()
	if err != nil {
		log.Fatal("Connection error: ", err)
	}

  // Create client, get hint, set everything up.
	fmt.Printf("Connecting to the server; preprocessing hints, might take a minute...")
	
	client := pir.NewPIRReader(pir.RandSource(), pir.Server(proxyLeft), pir.Server(proxyRight))	
	err = client.Init(config.PirType)
	if err != nil {
		log.Fatalf("Failed to Initialize client: %s\n", err)
	}
	fmt.Printf("[OK]\n")

  // Perform a query.
	key := query_key()
	start := time.Now()
	result, err := client.Read(key)
	totalTime := time.Since(start)
	
	// Print output.
	if err != nil {
		log.Fatalf("Failed to read key %d: %v", key, err)
	}
	fmt.Printf("Result %v\n", string(result))
	fmt.Printf("Time needed %d microseconds\n", totalTime.Microseconds())
}
