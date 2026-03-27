import { Country, State, City } from "country-state-city";

export const getCountryOptions = () => {
    return Country.getAllCountries().map(country => ({
        label: `${country.flag} ${country.name}`,
        value: country.isoCode,
        name: country.name // Store the full name for the database
    }));
};

export const getStateOptions = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map(state => ({
        label: state.name,
        value: state.isoCode,
        name: state.name
    }));
};

export const getCityOptions = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map(city => ({
        label: city.name,
        value: city.name,
        name: city.name
    }));
};
