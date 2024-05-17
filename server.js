const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, req.file.path);

    try {
        const companyNames = await fs.readFile(filePath, 'utf8');
        const companies = companyNames.split('\n').map(name => name.trim()).filter(name => name);

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const results = [];
        for (const companyName of companies) {
            try {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName)}`;
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

                const firstResult = await page.evaluate(() => {
                    const result = document.querySelector('div#search a[href^="http"]:not([href*="google.com"])');
                    return result ? result.href : 'No valid URL found';
                });

                results.push({ company: companyName, url: firstResult });
            } catch (error) {
                results.push({ company: companyName, url: 'Failed to retrieve URL' });
            }
        }

        await browser.close();
        await fs.unlink(filePath);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
