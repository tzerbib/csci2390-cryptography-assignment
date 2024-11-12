echo "Running servers..."

go run checklist_server.go -p=9000 &
go run checklist_server.go -p=9001 &

echo "Sleeping for 5 seconds..."
sleep 5

echo "Running client..."
go run checklist_client.go -tls=0 -serverAddr=127.0.0.1:9000 -serverAddr=127.0.0.1:9001
echo "Client done!"

echo "Killing server processes"
ps ax | grep "checklist_server" | grep -v grep | awk '{print $1}' | xargs kill
