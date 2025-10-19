@echo off
echo Configuring Firebase Functions environment variables...
echo.
echo You need to run this command to set your Foursquare API key:
echo firebase functions:config:set foursquare.api_key="YOUR_ACTUAL_API_KEY_HERE"
echo.
echo Replace YOUR_ACTUAL_API_KEY_HERE with your real Foursquare API key
echo.
echo After setting the config, deploy your functions:
echo firebase deploy --only functions
echo.
pause