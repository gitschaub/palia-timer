import './App.css';

import React, { useState, useEffect } from 'react';

function utcToPaliaTime(utcTimestamp) {
      var hour = Math.floor(utcTimestamp % 3600 / 150);
      var meridian = 'AM';
      if (hour > 12) {
        hour -= 12;
        meridian = 'PM';
      } else if (hour == 0) {
        hour = 12;
      }
      const paliaSecond = Math.floor(utcTimestamp / 2.5) % 60;
  return `${hour.toString().padStart(2, "0")}:${paliaSecond.toString().padStart(2, "0")} ${meridian}`;
}

function PaliaClock() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nowUtc = Math.floor(new Date().getTime() / 1000);
      setTimestamp(`Current Time: ${utcToPaliaTime(nowUtc)}`);
    }, 500); // 500ms = half second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ fontSize: '24px', fontFamily: 'Arial, sans-serif' }}>
      {timestamp}
    </div>
  );
}

function TargetTime() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nowUtc = Math.floor(new Date().getTime() / 1000);
      const platformInterval = 840; // Cycle reoccurs every 840 seconds
      const startOffset = 37;
      const startN = Math.ceil((nowUtc - startOffset) / 840);
      const startUtc = startN * platformInterval + startOffset;
      const target = utcToPaliaTime(startUtc);

      setTimestamp(`Next go-time: ${target}`);
    }, 500); // 500ms = half second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ fontSize: '24px', fontFamily: 'Arial, sans-serif' }}>
      {timestamp}
    </div>
  );
}

function PlatformCycles() {
  const [cycles, setCycles] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nowUtc = Math.floor(new Date().getTime() / 1000);
      const platforms = [6, 7, 8];
      var platformReadout = "";
      platforms.forEach(cycle => {
        var currentDir = (Math.floor(nowUtc / cycle) % 2) == 0 ? "UP" : "DOWN";
        platformReadout += `[${cycle}s]: ${currentDir}  `;
      });
      setCycles(platformReadout);
    }, 500); // 500ms = half second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ fontSize: '24px', fontFamily: 'Arial, sans-serif' }}>
      {cycles}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Palia Platform Tracker</h1>
      <PaliaClock />
      <TargetTime />
      <PlatformCycles />
    </div>
  );
}