# Define the path to your JavaScript file and the temporary JSON file
$jsFilePath = ".\dist\automations.js"
$jsonFilePath = ".\dist\__temp__automations.js"

# Read the content of the JS file, escape double quotes and replace newlines with \n
$jsContent = (Get-Content -Path $jsFilePath -Raw) -replace '\\', '\\' -replace '"', '\"' -replace "`r`n", '\r\n' -replace "`n", '\n' -replace "`t", '\t' 

# Define the complete JSON payload with the JS content
$jsonPayload = '{"name": "automations.js", "code": "' + $jsContent + '", "transaction": "Luligu"}'

# Write the complete JSON payload to the temporary file
$jsonPayload | Set-Content -Path $jsonFilePath

# Use the temporary file in the mosquitto_pub command
& 'C:\Program Files\mosquitto\mosquitto_pub' -h localhost -t 'zigbee2mqtt/bridge/request/extension/save' -f $jsonFilePath

# Optionally, clean up the temporary file after publishing
Remove-Item -Path $jsonFilePath