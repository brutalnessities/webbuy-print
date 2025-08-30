import { PrintData, ItemData, TradeData, PricingData, RowItem } from "../src/types";

enum DealType {
  LEASE = "lease",
  RETAIL = "retail",
}

export function dataFromLead(lead: any): PrintData {
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
