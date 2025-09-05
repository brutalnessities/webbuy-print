"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
const finance_with_trade_json_1 = __importDefault(require("../mocks/finance-with-trade.json"));
const clipboardy_1 = __importDefault(require("clipboardy"));
// Read the MJML/Handlebars template
const templatePath = path_1.default.join(__dirname, "templates", "print.hbs");
const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
// Compile Handlebars
const printTemplate = handlebars_1.default.compile(templateSource);
// Render function
function compile(data) {
    // Preprocess items for subtotal
    // Step 1: Inject data into MJML template
    const mjmlWithData = printTemplate({ ...data });
    // Step 2: Compile MJML to HTML
    const { html, errors } = (0, mjml_1.default)(mjmlWithData, { minify: true });
    if (errors && errors.length > 0) {
        console.warn("MJML compilation errors:", errors);
    }
    // testing: save the file to check the render
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "test.html"), html);
    // TODO: remove clipboardy
    clipboardy_1.default.writeSync(`{html: ${html}}`);
    return html;
}
//test
compile(finance_with_trade_json_1.default.data);
