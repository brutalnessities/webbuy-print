"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPrint = renderPrint;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
const clipboardy_1 = __importDefault(require("clipboardy"));
// Read the MJML/Handlebars template
const templatePath = path_1.default.join(__dirname, "templates", "print.hbs");
const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
// Compile Handlebars
const printTemplate = handlebars_1.default.compile(templateSource);
// Render function
function renderPrint(data) {
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
    clipboardy_1.default.writeSync(html);
    return html;
}
//test
renderPrint({
    date: "2025-04-22 08:30:07",
    visitorName: "asdoiansd asodinasodi",
    accountName: "Lead Motors",
    dealerLogo: "https://webbuy-v2-api-seed-assets.s3-us-west-2.amazonaws.com/accounts/lead_motors.png",
    item: {
        details: [
            { title: "Trim", value: "Type S" },
            { title: "Mileage", value: "5" },
            { title: "VIN", value: "19UUB7F0XSA000419" },
            { title: "Stock ID", value: "SA000419" },
        ],
        ymm: "2025 Acura TLX",
        image: "http://localhost:4201/assets/2025/19UUB7F0XSA000419.jpg",
    },
    trade: {
        valuation: [
            { title: "Trade-In Equity", value: "$16,495.70" },
            { title: "Book Value", value: "$16,925" },
        ],
        details: [
            { title: "Vehicle", value: "2021 Subaru Crosstrek" },
            { title: "Mileage", value: "106,000" },
            { title: "VIN", value: "JF2GTHRC7MH288660" },
            { title: "Lien", value: "$2,344" },
            { title: "Lienholder", value: "asdasdcasd" },
        ],
        adjustments: [
            { title: "Has Fluid Leaks", value: "$38" },
            { title: "Has Fluid Leaks", value: "$691" },
            { title: "Test Electrical", value: "-$111" },
            { title: "Body has rust", value: "-$123" },
            { title: "Has Fluid Leaks", value: "-$996" },
            { title: "Tires worn ( less than 30% tread left)", value: "$927" },
            { title: "Tires worn ( less than 30% tread left)", value: "-$744" },
        ],
        fees: [
            { title: "sample fee2", value: "$1,000" },
            { title: "Administration Fee", value: "$815.28" },
            { title: "Administration Fee", value: "$815.28" },
            { title: "Inspection Fee", value: "-$198.93" },
            { title: "Inspection Fee", value: "-$198.93" },
        ],
    },
    pricing: {
        monthlyPayment: "$750.61",
        summary: [
            { title: "Dealer Price", value: "$59,845" },
            { title: "Your Price", value: "$59,695" },
        ],
        termRate: "60 mo.",
        termLength: "10,000 mi/yr",
        offerType: "",
        dueAtSigning: { title: "Due at Signing", value: "$20,036.03" },
        dueBreakdown: [
            { title: "First Monthly Payment", value: "$750.61" },
            { title: "IGS Test Product #1", value: "$117.32" },
            { title: "Key Replacement Plan", value: "$803" },
            { title: "5 Year Platinum Coverage", value: "$864" },
            { title: "IGS Test Product #2", value: "$106.10" },
            {
                title: "Service Contract Platinum 60mo/60,000mi $100 Deductible",
                value: "$2,395",
            },
        ],
        breakdown: [
            { title: "Cash Down", value: "$15,000" },
            { title: "Gross Capitalized Cost", value: "$85,832.22" },
            { title: "Total Cap. Cost Reduction", value: "$31,495.70" },
            { title: "Adjusted Cap. Cost", value: "$55,031.52" },
            { title: "Credit Tier", value: "test" },
        ],
    },
    incentives: [
        { title: "Acura Military Appreciation Offer", value: "$750" },
        { title: "Acura Graduate Offer", value: "$500" },
    ],
    accessories: [
        { title: "CJT-1", value: "$100" },
        { title: "CJT-2", value: "$200" },
        { title: "CJT-3", value: "$300" },
        { title: "CJT-4", value: "$400" },
    ],
    protections: [
        { title: "IGS Test Product #1", value: "$117.32" },
        { title: "Key Replacement Plan", value: "$803" },
        { title: "5 Year Platinum Coverage", value: "$864" },
        { title: "IGS Test Product #2", value: "$106.10" },
        {
            title: "Service Contract Platinum 60mo/60,000mi $100 Deductible",
            value: "$2,395",
        },
    ],
    taxesAndFees: [
        { title: "Acquisition Fee", value: "$695" },
        { title: "IGS Test Product #1", value: "$117.32" },
        { title: "Key Replacement Plan", value: "$803" },
        { title: "5 Year Platinum Coverage", value: "$864" },
        { title: "IGS Test Product #2", value: "$106.10" },
        {
            title: "Service Contract Platinum 60mo/60,000mi $100 Deductible",
            value: "$2,395",
        },
    ],
    disclaimers: {
        trade: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Trade In Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;">If we find significant issues not represented here, the offer may change and consequently affect your financing.<br /><p>this is a trade disclaimer without any of the nbsp</p></div></td></tr>',
        protection: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Protection Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;"><p>this is protection disclaimer without any of the nbsp</p></div></td></tr>',
        incentive: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Incentive Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;">Estimated APR is based on recent national averages and your estimated credit score but does not necessarily represent a rate or payment that will be available to you. Every effort is taken to ensure accurate incentive information is displayed; however, incentives can change without notice at any given time. Final review and eligibility of all incentive offers will be determined at time of delivery.<br /><p>EVERY EFFORT IS MADE TO ENSURE THE ACCURACY OF INCENTIVES/REBATES. HOWEVER, INCENTIVES AND REBATES CAN CHANGE ANYTIME WITHOUT NOTICE. FINAL DETERMINATION OF AVAILABLE OFFERS AND ELIGIBILITY WILL BE MADE AT THE TIME OF DELIVERY. SEE DEALER FOR DETAILS.</p><br />See dealer for details</div></td></tr>',
    },
    leadLink: "https://demo-v2.webbuy.dev#webbuyl=49dbd834-1f86-11f0-b682-2c7ba08d226d",
    address: "123 Main Streets Billings, MT 59101",
    phone: "(455) 454-5455",
    has: {
        item: false,
        accessories: true,
        protections: true,
        taxesAndFees: true,
        incentives: false,
        trade: {
            accepted: true,
            adjustments: false,
            fees: true,
        },
        secondColumn: true,
    },
});
