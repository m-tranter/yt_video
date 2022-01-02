"use strict";

/** Pads a number with a leading 0. */
function pad(str) {
  return (`0${str}`).slice(-2);
}

/** Human-friendly video length. */
function lengthStr(s) {
  let msg = "Video length: ";
  let hours;
  let mins = Math.floor(s / 60);
  let seconds = s - (mins * 60);
  if (mins > 59) {
    hours = Math.floor(mins / 60);
    mins = mins - (hours * 60);
    msg += `${hours}:${pad(mins)}:${pad(seconds)}`;
  } else {
    msg += `${pad(mins)}:${pad(seconds)}`;
  }
  return `${msg}&nbsp;&nbsp;&nbsp;&nbsp`;
}



