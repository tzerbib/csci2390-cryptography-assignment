package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	. "checklist/driver"
	"checklist/rpc"
	"checklist/pir"
)

var VALUE_LEN = 7;
var DB = map[string]string {
    "aa": "string1",
    "ab": "string2",
    "dc": "string3",
    "zz": "string4",
}
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

// Construct the database the way checklist understands it:
// a map from an index in [0,4) to a 7-byte value.
func database() []RowIndexVal {
  var result []RowIndexVal
  // TODO: you may need to address gaps here
  for k, v := range DB {
    result = append(result, RowIndexVal { Index: key_to_index(k), Value: []byte(v) })
  }
  return result
}

func main() {
	config := new(Config).AddPirFlags().AddServerFlags()
	config.Parse()

  config.UseTLS = false;
  pirtype, _ := pir.PirTypeString("Punc")
  config.PirType = pirtype
	config.NumRows = 4
	config.RowLen = VALUE_LEN;
	config.Updatable = false;
	config.UpdateSize = 0;
	config.PresetRows = database()	

	driver, err := NewServerDriver()
	if err != nil {
		log.Fatalf("Failed to create server: %s", err)
	}
	var none int
	err = driver.Configure(config.TestConfig, &none)
	if err != nil {
		log.Fatalf("Failed to configure server: %s\n", err)
	}

	server, err := rpc.NewServer(config.Port, config.UseTLS, RegisteredTypes())
	if err != nil {
		log.Fatalf("Failed to create server: %s", err)
	}
	if err := server.RegisterName("PirServerDriver", driver); err != nil {
		log.Fatalf("Failed to register PIRServer, %s", err)
	}

	var inShutdown bool
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		inShutdown = true
		server.Close()
	}()

	prof := NewProfiler(config.CpuProfile)
	defer prof.Close()

	err = server.Serve()
	if err != nil && !inShutdown {
		log.Fatalf("Failed to serve: %s", err)
	} else {
		fmt.Printf("Shutting down")
	}
}
