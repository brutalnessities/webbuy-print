"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintComponent = void 0;
exports.renderPrint = renderPrint;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
const clipboardy_1 = __importDefault(require("clipboardy"));
const finance_with_trade_json_1 = __importDefault(require("../mocks/finance-with-trade.json"));
const lit_element_1 = require("lit-element");
// import leadData from "../mocks/leadsResponse.json";
// import { dataFromLead } from "../helpers/parseLead";
// Read the MJML/Handlebars template
const templatePath = path_1.default.join(__dirname, "templates", "print.hbs");
const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
// Compile Handlebars
const printTemplate = handlebars_1.default.compile(templateSource);
// Render function
function renderPrint(data) {
    // Preprocess items for subtotal
    // const data = dataFromLead(leadData.data.lead.data);
    // Step 1: Inject data into MJML template
    const mjmlWithData = printTemplate(data);
    // Step 2: Compile MJML to HTML
    const { html, errors } = (0, mjml_1.default)(mjmlWithData, { minify: true });
    if (errors && errors.length > 0) {
        console.warn("MJML compilation errors:", errors);
    }
    // testing: save the file to check the render
    fs_1.default.writeFileSync("./dist/test.html", html);
    // TODO: remove clipboardy
    clipboardy_1.default.writeSync(html);
    return html;
}
class PrintComponent extends lit_element_1.LitElement {
    constructor() {
        super();
    }
    render() {
        return (0, lit_element_1.html) `${renderPrint(finance_with_trade_json_1.default.data)}`;
    }
}
exports.PrintComponent = PrintComponent;
customElements.define("print-component", PrintComponent);
// renderPrint(mockData.data);
