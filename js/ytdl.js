'use strict';

const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

/** Use ytdl-core to check the URL and get info. */
function checkURL(res, url) {
  try {
    let obj = {url: url};
    const id = ytdl.getURLVideoID(obj.url);
    obj.id = id + randID(3);
    obj.videoFile = `${obj.id}.mp4`;
    // Get the title of the video
    ytdl
      .getInfo(id)
      .then((info) => {
        obj.title = info.videoDetails.title;
        obj.length = info.videoDetails.lengthSeconds;
        // Send video information to the client.
        res.json({obj: obj});
      })
      .catch((err) => {
        console.log(err);
        res.status(400).end();
      });
  } catch (error) {
    res.status(400).end();
        console.log(error);
  }
}

/** Use ytdl-core to fetch the video. */
function fetchMp4(obj, mp4Emitter) {
  let startTime;
  let progInt;
  let newEventID = `event${obj.id}`;
  obj.videoPath = path.join(__dirname, '..', obj.videoFile);
  const start = () => {
    const video = ytdl(obj.url);
    video.pipe(fs.createWriteStream(obj.videoPath));
    video.once('response', () => {
      startTime = Date.now();
    });
    // Check if it is slow connection. Restart stream if so.
    video.on('progress', (chunkLength, downloaded, total) => {
      let percent = downloaded / total;
      progInt = Math.floor(percent * 100);
      let downloadedMins = (Date.now() - startTime) / 1000 / 60;
      let estimate = Math.ceil(downloadedMins / percent - downloadedMins);
      if (estimate == 0) {
        estimate = 1;
      }
      if ((obj.length / estimate) >= 1600) { 
        mp4Emitter.emit(newEventID, -1); 
        video.destroy();
        start();
      } else {
        mp4Emitter.emit(newEventID, progInt);
      }
    });
    video.on('end', () => {
      if (progInt !== 100) {
        mp4Emitter.emit(newEventID, 100); 
      }
      // the video is on the server.
    });
  };
  start();
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/** Generate a random id (length n). */
function randID(n) {
  let id = '';
  for (let i = 0; i < n; i++) {
    let r = randomInt(62);
    if (r < 10) {
      id += r;
    } else if (r < 36) {
      id += String.fromCharCode(r + 55);
    } else {
      id += String.fromCharCode(r + 61);
    }
  }
  return id;
}


module.exports = {checkURL, fetchMp4}; 
