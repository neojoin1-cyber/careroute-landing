import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

function getHash(path) {
    return new Promise(resolve => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(path);
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

const file = fs.createWriteStream("downloaded.pdf");
https.get("https://careroute-landing.web.app/guide.pdf", function (response) {
    response.pipe(file);
    file.on("finish", async () => {
        file.close();
        const localHash = await getHash("public/guide.pdf");
        const downloadedHash = await getHash("downloaded.pdf");
        console.log("Local Hash:", localHash);
        console.log("Remote Hash:", downloadedHash);
        console.log("Match?", localHash === downloadedHash ? "YES" : "NO");
        const downloadedStats = fs.statSync("downloaded.pdf");
        console.log("Downloaded Size:", downloadedStats.size);
    });
});
