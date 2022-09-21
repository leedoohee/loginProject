import camelcaseKeys from 'camelcase-keys';

function getCamelcase(result) {
    if (Array.isArray(result)) {
        if (result.length > 0) {
            return camelcaseKeys(result);
        } else {
            return [];
    }
    } else {
        if (result) {
            return camelcaseKeys(result);
        } else {
            return null;
        }
    }
};

export default getCamelcase;