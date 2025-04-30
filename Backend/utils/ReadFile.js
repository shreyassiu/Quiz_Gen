const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const readTxtFile = (filePath) => {
    return fs.promises.readFile(filePath, 'utf8');
};
const readDocxFile = async (filePath) => {
    const data = await fs.promises.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: data });
    return result.value;
};
const readPdfFile = async (filePath) => {
    const dataBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
};
async function readFileBasedOnType(filePath){
    const ext = path.extname(filePath).toLowerCase();
    console.log("file extension:", ext);
    switch (ext) {
        case '.txt':
            return await readTxtFile(filePath);
        case '.docx':
            return await readDocxFile(filePath);
        case '.pdf':
            return await readPdfFile(filePath);
        default:
            throw new Error(`Unsupported file format: ${ext}`);
    }
};
module.exports = readFileBasedOnType;