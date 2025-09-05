"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
const clipboardy_1 = __importDefault(require("clipboardy"));
const finance_with_trade_json_1 = __importDefault(require("../mocks/finance-with-trade.json"));
function compile(data) {
    // Load partials
    const header = fs_1.default.readFileSync("./templates/partials/header.hbs", "utf8");
    const body = fs_1.default.readFileSync("./templates/partials/print.hbs", "utf8");
    const footer = fs_1.default.readFileSync("./templates/partials/footer.hbs", "utf8");
    // Render parts
    const renderedHeader = handlebars_1.default.compile(header)(data);
    const renderedBody = handlebars_1.default.compile(body)(data);
    const renderedFooter = handlebars_1.default.compile(footer)(data);
    // Load main template
    const emailMjml = fs_1.default.readFileSync("./templates/email.mjml", "utf8");
    const emailTemplate = handlebars_1.default.compile(emailMjml);
    // Merge everything
    const mjmlWithPartials = emailTemplate({
        ...data,
        header: renderedHeader,
        body: renderedBody,
        footer: renderedFooter,
    });
    // Convert MJML → HTML
    const { html } = (0, mjml_1.default)(mjmlWithPartials, { validationLevel: "soft" });
    clipboardy_1.default.writeSync(html);
    return html;
}
//test
compile(finance_with_trade_json_1.default);
