const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function convertPdfToImages(pdfPath) {
    console.log('Converting PDF to images...');
    const savePath = path.join(__dirname, '../tmp');

    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const outputPrefix = path.join(savePath, 'page');

    return new Promise((resolve, reject) => {
        execFile('pdftoppm', [
            '-png',
            '-r', '200',              // DPI
            pdfPath,
            outputPrefix
        ], (error, stdout, stderr) => {
            if (error) {
                console.error('pdftoppm failed:', stderr);
                return reject(error);
            }

            const imagePaths = [];
            for (let i = 1; i <= data.numpages; i++) {
                const imagePath = `${outputPrefix}-${i}.png`;
                imagePaths.push(imagePath);
            }

            resolve(imagePaths);
        });
    });
}

module.exports = convertPdfToImages;
