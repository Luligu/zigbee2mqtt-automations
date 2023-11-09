#!/bin/bash

# Define the path to your JavaScript file and the temporary JSON file
jsFilePath="./dist/automations.js"
jsonFilePath="./dist/__temp__automations.json"

# Read the content of the JS file, escape double quotes and newlines
jsContent=$(<"$jsFilePath")
escapedJsContent=$(echo "$jsContent" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Define the complete JSON payload with the JS content
jsonPayload="{\"name\": \"automations.js\", \"code\": \"$escapedJsContent\", \"transaction\": \"Luligu\"}"

# Write the complete JSON payload to the temporary file
echo "$jsonPayload" > "$jsonFilePath"

# Use the temporary file in the mosquitto_pub command
mosquitto_pub -h localhost -t 'zigbee2mqtt/bridge/request/extension/save' -f "$jsonFilePath"

# Optionally, clean up the temporary file after publishing
rm "$jsonFilePath"
