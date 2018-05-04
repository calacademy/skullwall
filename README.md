## Direct Link
https://s3.us-west-2.amazonaws.com/skullwall.calacademy.org/index.html
## Chrome Flags
```sh
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --chrome --kiosk https://s3.us-west-2.amazonaws.com/skullwall.calacademy.org/index.html --disable-pinch --disk-cache-size=1 --overscroll-history-navigation=0
```
## Chrome Extension
The Sketchfab embed requires some minor customization via [this extension](https://chrome.google.com/webstore/detail/calacademy-skull-wall/ebfdejnafjnclelfhccibdklekbiodei).
## Deploy to S3
```sh
$ ./deploy
```
