import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { PrintData } from "./types";
import clipboard from "clipboardy";

// Read the MJML/Handlebars template
const templatePath = path.join(__dirname, "templates", "print.hbs");
const templateSource = fs.readFileSync(templatePath, "utf-8");

// Compile Handlebars
const printTemplate = Handlebars.compile(templateSource);

// Render function
export function renderPrint(data: PrintData): string {
  // Preprocess items for subtotal

  // Step 1: Inject data into MJML template
  const mjmlWithData = printTemplate({ ...data });

  // Step 2: Compile MJML to HTML
  const { html, errors } = mjml2html(mjmlWithData, { minify: true });

  if (errors && errors.length > 0) {
    console.warn("MJML compilation errors:", errors);
  }

  // testing: save the file to check the render
  fs.writeFileSync(path.join(__dirname, "test.html"), html);

  // TODO: remove clipboardy
  clipboard.writeSync(html);
  return html;
}

//test
renderPrint({
  item: {
    details: [
      { title: "Trim", value: "Type S" },
      { title: "Mileage", value: "5" },
      { title: "VIN", value: "19UUB7F0XSA000419" },
      { title: "Stock ID", value: "SA000419" },
    ],
    ymm: "2025 Acura TLX",
    image: "https://cdn-v2.webbuy.dev/prod/b50af1e3-f2b7-11ea-b354-06a83b091c7a/inventory/3FMTK3SU4SMA02841_2025-4-8_22:8:33.jpg",
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
    dueAtSigning: [{ title: "Due at Signing", value: "$20,036.03" }],
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
    trade: "<p>this is a trade disclaimer without any of the nbsp</p>",
    protection: "<p>this is protection disclaimer without any of the nbsp</p>",
    incentive:
      "<p>EVERY EFFORT IS MADE TO ENSURE THE ACCURACY OF INCENTIVES/REBATES. HOWEVER, INCENTIVES AND REBATES CAN CHANGE ANYTIME WITHOUT NOTICE. FINAL DETERMINATION OF AVAILABLE OFFERS AND ELIGIBILITY WILL BE MADE AT THE TIME OF DELIVERY. SEE DEALER FOR DETAILS.</p>",
  },
  has: {
    item: true,
    accessories: true,
    protections: true,
    taxesAndFees: true,
    incentives: true,
    trade: {
      accepted: true,
      adjustments: true,
      fees: true,
    },
    secondColumn: true,
  },
});
