"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = __importDefault(require("clipboardy"));
const accounts_and_groups_json_1 = __importDefault(require("./accounts_and_groups.json"));
const out = [];
for (const account of accounts_and_groups_json_1.default) {
    const numSiblings = account.group.siblings?.length || 0;
    let mapping = account.name + ",";
    if (numSiblings) {
        for (const sibling of account.group.siblings) {
            mapping += sibling.name;
            mapping += ";";
        }
    }
    mapping += `${account.name},`;
    for (const {} of Array.from(Array(numSiblings).keys())) {
        mapping += `CDK`;
        mapping += ";";
    }
    mapping += "CDK";
    out.push(mapping);
}
// console.log(out.join('\n'));
clipboardy_1.default.writeSync(out.join("\n"));
