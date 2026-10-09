// launches Chrome through puppeteer-core (set CHROME_PATH to override the browser location)
const puppeteer = require('puppeteer-core');
const executablePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
module.exports = { launch: () => puppeteer.launch({ executablePath, headless: 'new', args: ['--no-sandbox'] }) };
