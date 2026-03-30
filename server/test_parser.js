const parseConfigString = (str) => {
    if (!str) return {};
    try {
        return JSON.parse(str);
    } catch (e) {
        const obj = {};
        const lines = str.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            const match = line.match(/^([^=:]+)[=:](.+)$/);
            if (match) {
                let key = match[1].trim();
                let value = match[2].trim();
                if ((value.startsWith("'") && value.endsWith("'")) || 
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith('“') && value.endsWith('”'))) {
                    value = value.substring(1, value.length - 1);
                }
                obj[key] = value;
            }
        }
        return obj;
    }
};

console.log('Headers:', parseConfigString("apikey = 'b6a36990-669f-4f2d-940f-9018cc48954a'"));
console.log('Body:', parseConfigString("diamondtype = “ALL”"));
