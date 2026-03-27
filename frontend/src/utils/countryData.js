import countries from 'world-countries';

export const countryOptions = countries
    .map((c) => {
        const root = c.idd.root || '';
        const suffix = (c.idd.suffixes && c.idd.suffixes.length > 0) ? c.idd.suffixes[0] : '';
        const dialCode = `${root}${suffix}`;

        return {
            value: c.name.common,
            label: `${c.flag} ${c.name.common} (${dialCode})`,
            flag: c.flag,
            dialCode: dialCode,
            name: c.name.common,
        };
    })
    .filter((c) => c.dialCode) // Only include countries with valid dial codes
    .sort((a, b) => a.name.localeCompare(b.name));
