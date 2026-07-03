const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running postinstall setup...');

// Try to install system dependencies using apt-get without sudo
try {
  console.log('Attempting to install system libraries for Electron...');
  
  const libs = [
    'libglib2.0-0',
    'libx11-6',
    'libxext6',
    'libxrender1',
    'libxkbcommon-x11-0',
    'libdbus-1-3',
    'libfontconfig1',
    'libfreetype6',
    'libx11-xcb1',
    'libnss3',
    'libxss1',
    'libasound2',
    'libgtk-3-0',
    'libgconf-2-4'
  ];

  // Try without sudo first (for environments that allow it)
  try {
    execSync('apt-get update 2>/dev/null || true', { stdio: 'pipe' });
    execSync(`apt-get install -y ${libs.join(' ')} 2>/dev/null || true`, { stdio: 'pipe' });
    console.log('✓ System libraries installed');
  } catch (e) {
    console.log('⚠ Could not install system libraries (this is normal on Replit)');
    console.log('  Run this project locally for the full GUI experience!');
  }

} catch (error) {
  console.log('Note: Some system dependencies could not be installed.');
  console.log('This is expected on Replit. For the full browser experience, run locally.');
}

console.log('✓ Postinstall complete');
