"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatPercentage = formatPercentage;
exports.formatNumber = formatNumber;
const ThousandthsRegex = /\B(?=(\d{3})+(?!\d))/g;
function formatCurrency(value, log = false) {
    if (value === null || value === undefined)
        return null;
    if (log)
        console.log("Formatting currency:", value);
    return `$${Number(value).toFixed(2).replace(ThousandthsRegex, ",")}`;
}
function formatPercentage(value) {
    if (value === null || value === undefined)
        return null;
    return `${Number(value).toFixed(2)}%`;
}
// adds a comma for every 1000ths place
function formatNumber(value) {
    if (value === null || value === undefined)
        return null;
    return Number(value).toString().replace(ThousandthsRegex, ",");
}
