const fs = require('fs');
const path = require('path');

async function extractText(pdfPath) {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }
    return fullText;
}

async function readAllPDFs() {
    const docsDir = './docs';
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));

    let allContent = '';

    for (const file of files) {
        allContent += '\n' + '='.repeat(80) + '\n';
        allContent += 'FILE: ' + file + '\n';
        allContent += '='.repeat(80) + '\n\n';

        const text = await extractText(path.join(docsDir, file));
        allContent += text + '\n';
    }

    fs.writeFileSync('./docs/ALL_FEATURES_EXTRACTED.txt', allContent);
    console.log('Extracted all PDFs to docs/ALL_FEATURES_EXTRACTED.txt');
}

readAllPDFs().catch(console.error);
