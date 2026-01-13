import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

let currentVersion: string | null = null;

async function checkVersion() {
  try {
    const response = await fetch('/version.json?' + Date.now());
    const data = await response.json();
    
    if (currentVersion === null) {
      currentVersion = data.version;
    } else if (currentVersion !== data.version) {
      console.log('New version detected, reloading...');
      window.location.reload();
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
}

checkVersion();
setInterval(checkVersion, 10000);

createRoot(document.getElementById("root")!).render(<App />);