#!/bin/sh

aws s3 sync --region us-west-2 "`dirname "$0"`" s3://skullwall.calacademy.org --exclude=".*/*" --exclude="*.DS_Store" --delete
