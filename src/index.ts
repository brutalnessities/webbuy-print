import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { ItemData, PricingData, PrintData, RowItem, TradeData } from "./types";
import clipboard from "clipboardy";

enum DealType {
  LEASE = "lease",
  RETAIL = "retail",
}

// Read the MJML/Handlebars template
const templatePath = path.join(__dirname, "templates", "print.hbs");
const templateSource = fs.readFileSync(templatePath, "utf-8");

// Compile Handlebars
const printTemplate = Handlebars.compile(templateSource);

// Render function
export function renderPrint(data: any): string {
  // Preprocess items for subtotal
  // const data: PrintData = dataFromLead(leadData);
  // data.has = {
  //   item: !!data.item,
  //   accessories: !!data.accessories,
  //   protections: !!data.protections,
  //   taxesAndFees: !!data.taxesAndFees,
  //   incentives: !!data.incentives,
  //   trade: {
  //     accepted: !!data.trade,
  //     adjustments: !!data.trade?.adjustments,
  //     fees: !!data.trade?.fees,
  //   },
  //   secondColumn: !!data.pricing,
  // };

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
  clipboard.writeSync(`{html: ${html}}`);
  return html;
}

function dataFromLead(lead: any): PrintData {
  // Map the lead data to the PrintData structure
  return {
    item: itemData(lead),
    trade: tradeData(lead),
    pricing: pricingData(lead),
    incentives: incentivesData(lead),
    accessories: accessoriesData(lead),
    protections: protectionsData(lead),
    taxesAndFees: taxesAndFeesData(lead),
    disclaimers: lead?.disclaimers,
  };
}

function itemData(lead: any): ItemData | null {
  const item = lead?.inventory?.vin;
  if (!item) return null;

  const placeholder = "https://webbuy-v2-api-static-assets.s3.us-west-2.amazonaws.com/vehicle-placeholder.png";

  return {
    details: [
      { title: "Trim", value: item?.trim },
      { title: "Mileage", value: item?.mileage },
      { title: "VIN", value: item?.vin },
      { title: "Stock ID", value: item?.stockId },
    ],
    // Remove extra spaces
    ymm: `${item?.year || ""} ${item?.make || ""} ${item?.model || ""}`.replace(/ +(?= )/g, ""),
    image: item?.image || placeholder,
  };
}

function tradeData(lead: any): TradeData | null {
  const tradeIn = lead?.tradeIn;
  const tradePricing = lead?.finance?.pricing?.Request?.TradeIn;
  if (!tradeIn?.uid) {
    return null;
  }

  // create the html for the trade in adjustments
  let adjustments = [];
  if (tradePricing?.Adjustments?.length) {
    for (const adjustment of tradePricing.Adjustments) {
      adjustments.push({ title: adjustment.title, value: adjustment.price, calculate: adjustment.calculate });
    }
  }

  // and the html for the trade in fees
  let fees = [];
  if (tradePricing?.Fees?.length) {
    for (const fee of tradePricing.Fees) {
      fees.push({ title: fee.title, value: fee.price, calculate: fee.calculate });
    }
  }

  return {
    valuation: [
      { title: "Trade-In Equity", value: tradePricing?.Equity },
      { title: "Book Value", value: tradePricing?.Offer },
    ],
    details: [
      { title: "Vehicle", value: `${tradeIn.year} ${tradeIn.make} ${tradeIn.model}` },
      { title: "Trim", value: tradeIn?.trim },
      { title: "Mileage", value: tradeIn.mileage },
      { title: "VIN", value: tradeIn.vin },
      { title: "Lien", value: tradeIn?.lien },
      { title: "Lienholder", value: tradeIn?.lienHolder },
    ],
    adjustments,
    fees,
  };
}

function pricingData(data: any): PricingData {
  const dealType: DealType = data?.finance?.method;
  const dt = dealType === DealType.LEASE ? "Lease" : "Retail";
  const pricing = data?.finance?.pricing?.[dt]?.Terms[0]?.Programs[0];
  // const acceptedOffer = false; // TODO: if accepted bidboard offer
  const terms = data?.lead?.meta?.find((meta) => meta.name === `${dt.toLowerCase()}_term_length`)?.data ?? 0;
  const termLengthData = Number(
    data?.lead?.meta?.find((meta) => meta.name === `${dt.toLowerCase()}_annual_mileage`)?.data
  );

  const termName = "TODO❗";
  let termRate = "";
  let termLength = "";
  let dueAtSigning = [];
  let breakdown = [];

  // create html specific to lease deal type
  if (dealType === DealType.LEASE) {
    for (const fee of pricing?.FullDetails?.PartRecap?.InceptionFees?.Item) {
      dueAtSigning.push({ title: fee?.StringValue, value: fee?.DecimalValue });
    }
    termLength = `${termLengthData} mi/yr`;
    breakdown = [
      { title: "Cash Down", value: pricing?.FullDetails?.DownpaymentFromCash },
      { title: "Gross Capitalized Cost", value: pricing?.FullDetails?.AdjustedSellingPrice },
      { title: "Total Cap. Cost Reduction", value: pricing?.FullDetails?.Downpayment },
      { title: "Adjusted Cap. Cost", value: pricing?.AmountFinanced },
      { title: "Credit Tier", value: termName },
    ];
  }

  // create html for finance/cash deal type
  else {
    termRate = ` @ ${pricing?.BuyRate}%`;
    breakdown = [
      { title: "Total Down Payment", value: pricing?.FullDetails?.Downpayment },
      { title: "Remaining Balance", value: data?.finance?.pricing?.Request?.RetailPart?.RemainingBalance },
    ];
  }

  const dealerPrice = data?.finance?.pricing?.Request?.YourPrice;
  const discount = +data?.lead?.meta?.find((meta) => meta.name === "qualified_discount")?.data;
  const discountPrice = dealerPrice - discount;
  const summary = [
    { title: "Dealer Price", value: dealerPrice },
    { title: "Your Price", value: discountPrice },
  ];

  return {
    monthlyPayment: pricing?.FullDetails?.MonthlyPayment,
    summary,
    termRate: `${terms} mo.${termRate}`,
    termLength,
    offerType: "", // TODO: ESTIMATE or ACTUAL HTML (currently hardcoded to highlight ESTIMATE)
    dueAtSigning: [{ title: "Due at Signing", value: pricing?.OutOfPocketCash }],
    dueBreakdown: dueAtSigning,
    breakdown: breakdown,
  };
}

function incentivesData(data: any): RowItem[] | null {
  const dealType: DealType = data?.finance?.method;
  const dt = dealType === DealType.LEASE ? "Lease" : "Retail";
  const incentives = data?.finance?.pricing?.[dt]?.Terms[0]?.Programs[0]?.AppliedRebate ?? [];
  if (!incentives?.length) {
    return null;
  }

  // create the html for the incentives
  let html = [];
  for (const incentive of incentives) {
    html.push({ title: incentive.Name, value: incentive.Value });
  }
  return html;
}

function accessoriesData(data: any): RowItem[] | null {
  const accessoriesObj = data?.finance?.pricing?.Request?.Products?.Accessories;
  if (!accessoriesObj?.length) {
    return null;
  }

  // create the html for the accessories
  let accessories = [];
  for (const accessory of accessoriesObj) {
    accessories.push({ title: accessory.Name, value: accessory.Price });
  }
  return accessories;
}

function protectionsData(data: any): RowItem[] | null {
  const productsData = data?.finance?.pricing?.Request?.Products?.ProtectionProducts;
  if (!productsData?.length) {
    return null;
  }

  // create the html for the protections
  let products = [];
  for (const product of productsData) {
    products.push({ title: product.Name, value: product.Price });
  }
  return products;
}

function taxesAndFeesData(data: any): RowItem[] | null {
  const dealType: DealType = data?.finance?.method;
  const dt = dealType === DealType.LEASE ? "Lease" : "Retail";
  const pricing = data?.finance?.pricing?.[dt]?.Terms[0].Programs[0];
  const feesAndTaxes = pricing?.FullDetails;
  const taxes: RowItem[] = [
    {
      title: "Acquisition Fee",
      value: feesAndTaxes?.Lease?.AcqusitionFee ?? 0,
    },
    {
      title: "City Tax",
      value: feesAndTaxes?.CityTax ?? 0,
    },
    {
      title: "County Tax",
      value: feesAndTaxes?.CountyTax ?? 0,
    },
    {
      title: "Documentary Stamp Tax",
      value: feesAndTaxes?.DocStampTax ?? 0,
    },
    {
      title: "Down Payment Tax",
      value: feesAndTaxes?.Lease?.DownpaymentTax ?? 0,
    },
    {
      title: "Luxury Tax",
      value: feesAndTaxes?.LuxuryTax ?? 0,
    },
    {
      title: "Processing Fee",
      value: pricing?.ProcessingFee ?? 0,
    },
    {
      title: "Registration Fee",
      value: feesAndTaxes?.RegistrationFee ?? 0,
    },
    {
      title: "RTA Tax",
      value: feesAndTaxes?.RTATax ?? 0,
    },
    {
      title: "State Tax",
      value: feesAndTaxes?.StateTax ?? 0,
    },
    {
      title: "Supplemental Title Fee",
      value: feesAndTaxes?.SupplementalTitleFee ?? 0,
    },
    {
      title: "Use Tax",
      value: feesAndTaxes?.Lease?.UseTax ?? 0,
    },
    {
      title: "Waste Tire Fee",
      value: feesAndTaxes?.WasteTireFee ?? 0,
    },
  ];

  const feeObject = pricing?.FullDetails?.[dt];
  const customFees = feeObject?.CustomFee ?? [];

  // TODO: const taxBreakDown = feeObject.TaxBreakDown; this should exist (for retail?)??
  for (const fee of customFees) {
    if (!!fee.Value) {
      taxes.push({
        title: fee?.Description,
        value: fee?.Value,
      });
    }
  }

  taxes.filter((tax) => !!tax.value);
  if (!taxes.length) {
    return null;
  }

  return taxes;
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
    image:
      "https://cdn-v2.webbuy.dev/prod/b50af1e3-f2b7-11ea-b354-06a83b091c7a/inventory/3FMTK3SU4SMA02841_2025-4-8_22:8:33.jpg",
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
