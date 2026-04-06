const axios = require('axios');

async function testFetch() {
    try {
        console.log("Testing Akshar API fetch...");
        const response = await axios.post("https://akshar.kodllin.com/apis/api/getStockN?auth_key=zvkwybd3mqru", {}, { timeout: 15000 });
        const data = response.data;
        
        let diamonds = Array.isArray(data) ? data : (data.data || data.diamonds || data.stock || []);
        if (!Array.isArray(diamonds) && typeof diamonds === 'object') {
             for (let key in diamonds) {
                 if (Array.isArray(diamonds[key])) {
                     diamonds = diamonds[key];
                     break;
                 }
             }
        }

        console.log("Response Type:", typeof data);
        console.log("Items found:", Array.isArray(diamonds) ? diamonds.length : 0);
        if (Array.isArray(diamonds) && diamonds.length > 0) {
             console.log("Sample keys:", Object.keys(diamonds[0]));
        } else {
             console.log("Full response (first 200 chars):", JSON.stringify(data).substring(0, 200));
        }

    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

testFetch();
