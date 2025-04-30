function chunkText(text, chunkSize = 500) {
    const words = text.split(/\s+/);   // split text into words
    const chunks = [];                 // array to hold chunks

    for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' '); // create a chunk
        chunks.push(chunk);           // store the chunk
    }

    return chunks;                    // return all the chunks
}

module.exports = chunkText;
