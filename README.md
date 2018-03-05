## Direct Link
https://s3.us-west-2.amazonaws.com/skullwall.calacademy.org/index.html
## Chrome Extension
The Sketchfab embed requires some minor customization via [this extension](https://chrome.google.com/webstore/detail/calacademy-skull-wall/ebfdejnafjnclelfhccibdklekbiodei).
## Deploy to S3
```sh
$ aws s3 sync --region us-west-2 . s3://skullwall.calacademy.org --exclude=".*/*" --exclude="*.DS_Store" --delete
```
