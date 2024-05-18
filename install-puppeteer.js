const puppeteer = require('puppeteer');

puppeteer
  .install()
  .then(() => {
    console.log('Puppeteer installed successfully.');
  })
  .catch((error) => {
    console.error('Error installing Puppeteer:', error);
  });