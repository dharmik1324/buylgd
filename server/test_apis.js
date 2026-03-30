const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const InventoryApi = require('./models/InventoryApi');
        const activeApis = await InventoryApi.find({ isActive: true });
        const fs = require('fs');
        let out = '';
        activeApis.forEach(a => {
            out += 'URL: ' + a.url + '\n';
            out += 'Headers: ' + a.headers + '\n';
            out += 'Body: ' + a.body + '\n\n';
        });
        fs.writeFileSync('apis.txt', out);
    } catch (e) {}
    process.exit(0);
});
