"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderInvoice = renderInvoice;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
// Read the MJML template
const templatePath = path_1.default.join(__dirname, "templates", "print.mjml");
const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
// Compile Handlebars
const invoiceTemplate = handlebars_1.default.compile(templateSource);
// Render function
function renderInvoice(data) {
    // Preprocess items for subtotal
    // Step 1: Inject data into MJML template
    const mjmlWithData = invoiceTemplate({ ...data });
    // Step 2: Compile MJML to HTML
    const { html, errors } = (0, mjml_1.default)(mjmlWithData, { minify: true });
    if (errors && errors.length > 0) {
        console.warn("MJML compilation errors:", errors);
    }
    console.log("🎯", html);
    // testing: save the file to check the render
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "test.html"), html);
    return html;
}
//test
renderInvoice({
    date: "2025-04-22 08:30:07",
    visitorName: "asdoiansd asodinasodi",
    accountName: "Lead Motors",
    dealerLogo: "https://webbuy-v2-api-seed-assets.s3-us-west-2.amazonaws.com/accounts/lead_motors.png",
    item: {
        details: "<tr><td style='font-weight: bold;'>Trim</td><td align='right'>Type S</td></tr><tr><td style='font-weight: bold;'>Mileage</td><td align='right'>5</td></tr><tr><td style='font-weight: bold;'>VIN</td><td align='right'>19UUB7F0XSA000419</td></tr><tr><td style='font-weight: bold;'>Stock ID</td><td align='right'>SA000419</td></tr>",
        ymm: "2025 Acura TLX",
        image: "http://localhost:4201/assets/2025/19UUB7F0XSA000419.jpg",
    },
    trade: {
        valuation: "<tr><td style=''>Trade-In Equity</td><td align='right'>$16,495.70</td></tr><tr><td style=''>Book Value</td><td align='right'>$16,925</td></tr>",
        details: "<tr><td style='font-weight: bold;'>Vehicle</td><td align='right'>2021 Subaru Crosstrek</td></tr><tr><td style='font-weight: bold;'>Mileage</td><td align='right'>106,000</td></tr><tr><td style='font-weight: bold;'>VIN</td><td align='right'>JF2GTHRC7MH288660</td></tr><tr><td style='font-weight: bold;'>Lien</td><td align='right'>$2,344</td></tr><tr><td style='font-weight: bold;'>Lienholder</td><td align='right'>asdasdcasd</td></tr>",
        adjustments: "<tr><td style=''>Has Fluid Leaks</td><td align='right'>$38</td></tr><tr><td style=''>Has Fluid Leaks</td><td align='right'>$691</td></tr><tr><td style=''>Test Electrical</td><td align='right'>-$111</td></tr><tr><td style=''>Body has rust</td><td align='right'>-$123</td></tr><tr><td style=''>Has Fluid Leaks</td><td align='right'>-$996</td></tr><tr><td style=''>Tires worn ( less than 30% tread left)</td><td align='right'>$927</td></tr><tr><td style=''>Tires worn ( less than 30% tread left)</td><td align='right'>-$744</td></tr>",
        fees: "<tr><td style=''>sample fee2</td><td align='right'>$1,000</td></tr><tr><td style=''>Administration Fee</td><td align='right'>$815.28</td></tr><tr><td style=''>Administration Fee</td><td align='right'>$815.28</td></tr><tr><td style=''>Inspection Fee</td><td align='right'>-$198.93</td></tr><tr><td style=''>Inspection Fee</td><td align='right'>-$198.93</td></tr>",
    },
    pricing: {
        monthlyPayment: "$750.61",
        summary: "<tr><td style='font-weight: bold;'>Dealer Price</td><td align='right'>$59,845</td></tr><tr><td style='font-weight: bold;'>Your Price</td><td align='right'>$59,695</td></tr>",
        termRate: "60 mo.",
        termLength: "10,000 mi/yr",
        offerType: "",
        dueAtSigning: "<tr><td style='font-weight: bold;'>Due at Signing</td><td align='right'>$20,036.03</td></tr>",
        dueBreakdown: "<tr><td style=''>First Monthly Payment</td><td align='right'>$750.61</td></tr><tr><td style=''>IGS Test Product #1</td><td align='right'>$117.32</td></tr><tr><td style=''>Key Replacement Plan</td><td align='right'>$803</td></tr><tr><td style=''>5 Year Platinum Coverage</td><td align='right'>$864</td></tr><tr><td style=''>IGS Test Product #2</td><td align='right'>$106.10</td></tr><tr><td style=''>Service Contract Platinum 60mo/60,000mi $100 Deductible</td><td align='right'>$2,395</td></tr>",
        breakdown: "<tr><td style='font-weight: bold;'>Cash Down</td><td align='right'>$15,000</td></tr><tr><td style='font-weight: bold;'>Gross Capitalized Cost</td><td align='right'>$85,832.22</td></tr><tr><td style='font-weight: bold;'>Total Cap. Cost Reduction</td><td align='right'>$31,495.70</td></tr><tr><td style='font-weight: bold;'>Adjusted Cap. Cost</td><td align='right'>$55,031.52</td></tr><tr><td style='font-weight: bold;'>Credit Tier</td><td align='right'>test</td></tr>",
    },
    incentives: "<tr><td style=''>Acura Military Appreciation Offer</td><td align='right'>$750</td></tr><tr><td style=''>Acura Graduate Offer</td><td align='right'>$500</td></tr>",
    accessories: "<tr><td style=''>IGS 12</td><td align='right'>$205.97</td></tr><tr><td style=''>IGS</td><td align='right'>$100</td></tr><tr><td style=''>Bedliner</td><td align='right'>$296</td></tr><tr><td style=''>Tool Box</td><td align='right'>$387</td></tr><tr><td style=''>IGS #5</td><td align='right'>$123.11</td></tr><tr><td style=''>VAV IGS</td><td align='right'>$138</td></tr><tr><td style=''>6151 IGS #2</td><td align='right'>$100</td></tr><tr><td style=''>Remote Start</td><td align='right'>$690</td></tr><tr><td style=''>Remote Start</td><td align='right'>$690</td></tr><tr><td style=''>Spoiler</td><td align='right'>$269</td></tr><tr><td style=''>Remote Start</td><td align='right'>$700</td></tr><tr><td style=''>Remote Start</td><td align='right'>$700</td></tr><tr><td style=''>Remote Start</td><td align='right'>$700</td></tr><tr><td style=''>Remote Start</td><td align='right'>$700</td></tr><tr><td style=''>SUBARU STARLINK</td><td align='right'>$179.99</td></tr><tr><td style=''>Spoiler</td><td align='right'>$940</td></tr><tr><td style=''>Accessory Grille</td><td align='right'>$629.95</td></tr><tr><td style=''>Accessory Grille</td><td align='right'>$829.95</td></tr><tr><td style=''>IGS Accessory #2</td><td align='right'>$127.22</td></tr><tr><td style=''>Clear Bra</td><td align='right'>$642</td></tr><tr><td style=''>Step Rails</td><td align='right'>$782</td></tr><tr><td style=''>Aero Splash Guards</td><td align='right'>$187.45</td></tr><tr><td style=''>Window Tint</td><td align='right'>$701</td></tr><tr><td style=''>Grill Guard</td><td align='right'>$143</td></tr><tr><td style=''>Wheel Locks</td><td align='right'>$344</td></tr><tr><td style=''>Window Tint</td><td align='right'>$162</td></tr><tr><td style=''>Window Tint</td><td align='right'>$701</td></tr><tr><td style=''>Window Tint</td><td align='right'>$701</td></tr><tr><td style=''>Window Tint</td><td align='right'>$701</td></tr><tr><td style=''>16-Inch Alloy Wheel</td><td align='right'>$1,448.84</td></tr><tr><td style=''>16-Inch Alloy Wheel</td><td align='right'>$1,516.96</td></tr><tr><td style=''>Window Tint</td><td align='right'>$443</td></tr><tr><td style=''>Remote Start</td><td align='right'>$29</td></tr><tr><td style=''>17- Inch Alloy Wheel</td><td align='right'>$1,830.28</td></tr><tr><td style=''>DVD Headrests</td><td align='right'>$988</td></tr><tr><td style=''>All Weather Floor Mats</td><td align='right'>$200</td></tr><tr><td style=''>All Weather Mats</td><td align='right'>$438</td></tr><tr><td style=''>Accessory Activity Mount</td><td align='right'>$773.50</td></tr><tr><td style=''>ADVANCED GLASS PROTECTION</td><td align='right'>$1,999</td></tr><tr><td style=''>Montana Wilderness Package</td><td align='right'>$2,899</td></tr><tr><td style=''>This is a very long accessory name made for testing</td><td align='right'>$1</td></tr>",
    protections: "<tr><td style=''>IGS Test Product #1</td><td align='right'>$117.32</td></tr><tr><td style=''>Key Replacement Plan</td><td align='right'>$803</td></tr><tr><td style=''>5 Year Platinum Coverage</td><td align='right'>$864</td></tr><tr><td style=''>IGS Test Product #2</td><td align='right'>$106.10</td></tr><tr><td style=''>Service Contract Platinum 60mo/60,000mi $100 Deductible</td><td align='right'>$2,395</td></tr>",
    taxesAndFees: "<tr><td style=''>Acquisition Fee</td><td align='right'>$695</td></tr><tr><td style=''>IGS Test Product #1</td><td align='right'>$117.32</td></tr><tr><td style=''>Key Replacement Plan</td><td align='right'>$803</td></tr><tr><td style=''>5 Year Platinum Coverage</td><td align='right'>$864</td></tr><tr><td style=''>IGS Test Product #2</td><td align='right'>$106.10</td></tr><tr><td style=''>Service Contract Platinum 60mo/60,000mi $100 Deductible</td><td align='right'>$2,395</td></tr>",
    disclaimers: {
        trade: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Trade In Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;">If we find significant issues not represented here, the offer may change and consequently affect your financing.<br /><p>this is a trade disclaimer without any of the nbsp</p></div></td></tr>',
        protection: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Protection Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;"><p>this is protection disclaimer without any of the nbsp</p></div></td></tr>',
        incentive: '<tr><td align="left" style="font-size:0px;padding:6px 0 3px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1;text-align:left;color:#000000;">Incentive Disclaimer</div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;padding-bottom:6px;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:12px;line-height:1;text-align:left;color:#000000;">Estimated APR is based on recent national averages and your estimated credit score but does not necessarily represent a rate or payment that will be available to you. Every effort is taken to ensure accurate incentive information is displayed; however, incentives can change without notice at any given time. Final review and eligibility of all incentive offers will be determined at time of delivery.<br /><p>EVERY EFFORT IS MADE TO ENSURE THE ACCURACY OF INCENTIVES/REBATES. HOWEVER, INCENTIVES AND REBATES CAN CHANGE ANYTIME WITHOUT NOTICE. FINAL DETERMINATION OF AVAILABLE OFFERS AND ELIGIBILITY WILL BE MADE AT THE TIME OF DELIVERY. SEE DEALER FOR DETAILS.</p><br />See dealer for details</div></td></tr>',
    },
    leadLink: "https://demo-v2.webbuy.dev#webbuyl=49dbd834-1f86-11f0-b682-2c7ba08d226d",
    address: "123 Main Streets Billings, MT 59101",
    phone: "(455) 454-5455",
    hide: {
        accessories: "",
        protections: "",
        taxesAndFees: "",
        incentives: "",
        trade: {
            none: "",
            costs: "",
            fees: "",
        },
    },
});
