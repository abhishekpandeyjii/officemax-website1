const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ADMIN\\.resource_data\\antigravity\\brain\\0528bfc3-fffe-4e4c-b831-3c4e7eed093f';
const destDir = path.join(__dirname, 'public', 'images');

const files = [
    { src: 'media__1777373442822.jpg', dest: 'hero-slide-1.jpg' },
    { src: 'media__1777373474042.jpg', dest: 'hero-slide-2.jpg' },
    { src: 'media__1777373499298.jpg', dest: 'hero-slide-3.jpg' },
    { src: 'media__1777373520624.jpg', dest: 'hero-slide-4.jpg' },
    { src: 'media__1777373544653.jpg', dest: 'hero-slide-5.jpg' },
];

files.forEach(f => {
    const srcPath = path.join(srcDir, f.src);
    const destPath = path.join(destDir, f.dest);
    try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${f.dest}`);
    } catch (err) {
        console.error(`Error copying ${f.dest}:`, err.message);
    }
});

console.log('Done!');
