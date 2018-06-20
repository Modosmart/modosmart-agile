#!/bin/bash

echo "Running .."
npm install pm2 -g &&
npm install &&
pm2 start index.js
pm2 startup
pm2 save
