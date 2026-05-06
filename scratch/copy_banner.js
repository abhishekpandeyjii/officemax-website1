const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\ADMIN\\.resource_data\\antigravity\\brain\\b56e06d4-7b99-41e0-9e1d-c037ede96c8e\\corporate_gifting_banner_1777479124087.png";
const dest = "c:\\Users\\ADMIN\\Desktop\\officemax-website\\public\\images\\gifting-banner.png";

try {
    fs.copyFileSync(source, dest);
    console.log('Successfully copied banner image');
} catch (err) {
    console.error('Error copying file:', err);
}
