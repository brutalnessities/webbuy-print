"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFromLead = dataFromLead;
const utils_1 = require("./utils");
var DealType;
(function (DealType) {
    DealType["LEASE"] = "lease";
    DealType["RETAIL"] = "retail";
})(DealType || (DealType = {}));
function dataFromLead(lead) {
    // Map the lead data to the PrintData structure
    const item = itemData(lead);
    const trade = tradeData(lead);
    const pricing = pricingData(lead);
    const incentives = incentivesData(lead);
    const accessories = accessoriesData(lead);
    const protections = protectionsData(lead);
    const taxesAndFees = taxesAndFeesData(lead);
    const disclaimers = lead?.disclaimers;
    return {
        item,
        trade,
        pricing,
        incentives,
        accessories,
        protections,
        taxesAndFees,
        disclaimers,
        has: {
            item: !!item,
            accessories: !!accessories,
            protections: !!protections,
            taxesAndFees: !!taxesAndFees,
            incentives: !!incentives,
            trade: {
                accepted: !!lead?.trade?.tradeDecision,
                adjustments: !!lead?.trade?.adjustments?.length,
                fees: !!lead?.trade?.fees?.length,
            },
            secondColumn: !!item && !!trade,
        },
    };
    ``;
}
function itemData(data) {
    const item = data?.item;
    if (!item?.vin)
        return null;
    const { vin, make, model, year, trim, mileage, stockNumber, image } = item;
    const placeholder = "https://webbuy-v2-api-static-assets.s3.us-west-2.amazonaws.com/vehicle-placeholder.png";
    return {
        details: [
            { title: "Trim", value: trim },
            { title: "Mileage", value: (0, utils_1.formatNumber)(mileage) },
            { title: "VIN", value: vin },
            { title: "Stock ID", value: stockNumber },
        ],
        // Remove extra spaces
        ymm: `${year || ""} ${make || ""} ${model || ""}`.replace(/ +(?= )/g, ""),
        image: image || placeholder,
    };
}
function tradeData(data) {
    const trade = data?.trade;
    const tradePricing = data?.pricing?.Request?.TradeIn;
    if (!trade?.vin)
        return null;
    const { vin, make, model, year, trim, mileage, lien, lienHolder, adjustments, fees } = trade;
    // create the html for the trade in adjustments
    let adjustmentsRow = [];
    if (adjustments?.length) {
        for (const adjustment of adjustments) {
            adjustmentsRow.push({ title: adjustment.title, value: (0, utils_1.formatCurrency)(adjustment.price), calculate: adjustment.calculate });
        }
    }
    // and the html for the trade in fees
    let feesRow = [];
    if (fees?.length) {
        for (const fee of fees) {
            feesRow.push({ title: fee.title, value: (0, utils_1.formatCurrency)(fee.price), calculate: fee.calculate });
        }
    }
    return {
        valuation: [
            { title: "Trade-In Equity", value: (0, utils_1.formatCurrency)(tradePricing?.Equity) },
            { title: "Book Value", value: (0, utils_1.formatCurrency)(tradePricing?.Offer) },
        ],
        details: [
            { title: "Vehicle", value: `${year} ${make} ${model}` },
            { title: "Trim", value: trim },
            { title: "Mileage", value: (0, utils_1.formatNumber)(mileage) },
            { title: "VIN", value: vin },
            { title: "Lien", value: (0, utils_1.formatCurrency)(lien) },
            { title: "Lienholder", value: lienHolder },
        ],
        adjustments: adjustmentsRow,
        fees: feesRow,
    };
}
function pricingData(data) {
    const dealType = data?.finance?.method;
    const dt = dealType === DealType.LEASE ? "Lease" : "Retail";
    const pricing = data?.finance?.pricing?.[dt]?.Terms[0]?.Programs[0];
    // const acceptedOffer = false; // TODO: if accepted bidboard offer
    // const terms = data?.lead?.meta?.find((meta) => meta.name === `${dt.toLowerCase()}_term_length`)?.data ?? 0;
    // const termLengthData = Number(
    //   data?.lead?.meta?.find((meta) => meta.name === `${dt.toLowerCase()}_annual_mileage`)?.data
    // );
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
        termLength = `${ /*termLengthData*/10000} mi/yr`;
        breakdown = [
            { title: "Cash Down", value: (0, utils_1.formatCurrency)(pricing?.FullDetails?.DownpaymentFromCash) },
            { title: "Gross Capitalized Cost", value: (0, utils_1.formatCurrency)(pricing?.FullDetails?.AdjustedSellingPrice) },
            { title: "Total Cap. Cost Reduction", value: (0, utils_1.formatCurrency)(pricing?.FullDetails?.Downpayment) },
            { title: "Adjusted Cap. Cost", value: (0, utils_1.formatCurrency)(pricing?.AmountFinanced) },
            { title: "Credit Tier", value: termName },
        ].filter((item) => item.value);
    }
    // create html for finance/cash deal type
    else {
        termRate = ` @ ${pricing?.BuyRate}%`;
        breakdown = [
            { title: "Total Down Payment", value: (0, utils_1.formatCurrency)(pricing?.FullDetails?.Downpayment) },
            { title: "Remaining Balance", value: (0, utils_1.formatCurrency)(data?.finance?.pricing?.Request?.RetailPart?.RemainingBalance) },
        ].filter((item) => item.value);
    }
    const dealerPrice = pricing?.Request?.YourPrice;
    const discount = 0; //+data?.lead?.meta?.find((meta) => meta.name === "qualified_discount")?.data;
    const discountPrice = dealerPrice - discount;
    const summary = [
        { title: "Dealer Price", value: (0, utils_1.formatCurrency)(dealerPrice) },
        { title: "Your Price", value: (0, utils_1.formatCurrency)(discountPrice, true) },
    ].filter((item) => item.value);
    return {
        monthlyPayment: pricing?.FullDetails?.MonthlyPayment,
        summary,
        termRate: `${ /*terms*/36} mo.${termRate}`,
        termLength,
        offerType: "", // TODO: ESTIMATE or ACTUAL HTML (currently hardcoded to highlight ESTIMATE)
        dueAtSigning: [{ title: "Due at Signing", value: pricing?.OutOfPocketCash }],
        dueBreakdown: dueAtSigning,
        breakdown: breakdown,
    };
}
function incentivesData(data) {
    const test = {
        rebates: [
            {
                FinancialInstitution: "Honda Finance",
                FinancialInstitutionID: 17,
                ID: 501,
                IdentCode: "Acura Spl",
                LenderCode: "AHFC_SPL",
                MaxCreditScore: 1000,
                Name: "Acura Specials",
                NameDisplay: "Acura Specials",
                Number: "Acura Spl",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-12-01 06:59:59",
                TransactionType: 1,
                Type: 1,
                UpdateTS: "2024-06-11 17:05:46",
                CustomerTypes: [{ AutoSelect: false, ID: 29, Recipient: 1 }],
                Terms: [{ End: 1000, TransactionType: 1, Value: { Values: [] } }],
            },
            {
                FinancialInstitution: "Honda Finance",
                FinancialInstitutionID: 17,
                ID: 506,
                IdentCode: "Acura SplAPR",
                LenderCode: "AHFC",
                MaxCreditScore: 1000,
                Name: "Acura Specials",
                NameDisplay: "Acura Specials",
                Number: "Acura Specials",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-12-01 06:59:59",
                TransactionType: 3,
                Type: 5,
                UpdateTS: "2025-07-03 17:57:44",
                CustomerTypes: [{ AutoSelect: false, ID: 29, Recipient: 1 }],
                Terms: [{ End: 1000, TransactionType: 3, Value: { Values: [] } }],
            },
            {
                FinancialInstitution: "Honda Finance",
                FinancialInstitutionID: 17,
                ID: 530,
                IdentCode: "Mfr Retail",
                IsGeneric: true,
                LenderCode: "AHFC",
                MaxCreditScore: 1000,
                Name: "Acura Std",
                NameDisplay: "Acura Std",
                Number: "Mfr Retail",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-01-02 06:59:59",
                TransactionType: 4,
                Type: 5,
                UpdateTS: "2015-10-13 14:17:59",
            },
            {
                FinancialInstitution: "Honda Finance",
                FinancialInstitutionID: 17,
                ID: 476,
                IdentCode: "Mfr Lease",
                IsGeneric: true,
                LenderCode: "AHFC",
                MaxCreditScore: 1000,
                Name: "Acura Std",
                NameDisplay: "Acura Std",
                Number: "Mfr Lease",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-01-02 06:59:59",
                TransactionType: 2,
                Type: 1,
                UpdateTS: "2015-10-13 14:18:01",
            },
            {
                FinancialInstitution: "ANY",
                ID: 432,
                IdentCode: "Bank Lease",
                IsGeneric: true,
                LenderCode: "_ANY_",
                MaxCreditScore: 1000,
                Name: "Other Banks",
                NameDisplay: "Other Banks",
                Number: "Bank Lease",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-01-02 06:59:59",
                TransactionType: 2,
                Type: 1,
                UpdateTS: "2015-10-13 14:18:01",
            },
            {
                FinancialInstitution: "ANY",
                ID: 527,
                IdentCode: "Bank Retail",
                IsGeneric: true,
                LenderCode: "_ANY_",
                MaxCreditScore: 1000,
                Name: "Other Banks",
                NameDisplay: "Other Banks",
                Number: "Bank Retail",
                ReceipientType: 1,
                RevisionDate: "2013-11-01 00:00:00",
                Selected: true,
                StartDate: "2013-11-01 07:00:00",
                StopDate: "2099-01-02 06:59:59",
                TransactionType: 4,
                Type: 5,
                UpdateTS: "2015-10-13 14:18:00",
            },
            {
                CashCanBeUsedAsCCR: true,
                CategoryID: 2,
                FinancialInstitution: "ANY",
                ID: 563272,
                IdentCode: "AP-Y81",
                LenderCode: "_ANY_",
                MaxCreditScore: 1000,
                Name: "Acura Graduate Offer",
                NameDisplay: "Acura Graduate Offer",
                Number: "AP-Y81",
                ReceipientType: 1,
                RevisionDate: "2025-04-01 00:00:00",
                StartDate: "2025-04-01 07:00:00",
                StopDate: "2026-04-01 06:59:59",
                TransactionType: 1000,
                Type: 3,
                UpdateTS: "2025-04-02 02:50:15",
                UseCashAsCCR: true,
                CustomerTypes: [{ AutoSelect: false, ID: 29, Recipient: 1 }],
                Value: { Values: [{ Type: 1000, Value: 500 }] },
            },
            {
                CashCanBeUsedAsCCR: true,
                CategoryID: 1,
                FinancialInstitution: "ANY",
                ID: 563278,
                IdentCode: "AP-Y80",
                LenderCode: "_ANY_",
                MaxCreditScore: 1000,
                Name: "Acura Military Appreciation Offer",
                NameDisplay: "Acura Military Appreciation Offer",
                Number: "AP-Y80",
                ReceipientType: 1,
                RevisionDate: "2025-04-01 00:00:00",
                StartDate: "2025-04-01 07:00:00",
                StopDate: "2026-04-01 06:59:59",
                TransactionType: 1000,
                Type: 3,
                UpdateTS: "2025-04-02 02:51:11",
                UseCashAsCCR: true,
                CustomerTypes: [{ AutoSelect: false, ID: 29, Recipient: 1 }],
                Value: { Values: [{ Type: 1000, Value: 750 }] },
            },
            {
                FinancialInstitution: "ANY",
                ID: 578442,
                IdentCode: "ALLY-LTR-ACURA",
                LenderCode: "_ANY_",
                MaxCreditScore: 1000,
                Name: "Ally Lease to Retail Dealer Payment Program",
                NameDisplay: "Ally Lease to Retail Dealer Payment Program",
                Number: "ALLY-LTR-ACURA",
                ReceipientType: 1,
                RevisionDate: "2025-09-03 00:00:00",
                StartDate: "2025-09-03 07:00:00",
                StopDate: "2025-10-01 06:59:59",
                TransactionType: 11,
                Type: 3,
                UpdateTS: "2025-09-02 22:59:15",
                CustomerTypes: [{ AutoSelect: false, ID: 29, Recipient: 1 }],
                Programs: [
                    { Code: "ALLY", IsMask: 1 },
                    { Code: "ALLT", IsMask: 1 },
                    { Code: "ALS", IsMask: 1 },
                    { Code: "ALT", IsMask: 1 },
                ],
                Value: { Values: [{ Type: 11, Value: 300 }] },
            },
        ],
        customerTypes: [{ ID: 29, IsMostCommon: true, Name: "Individual" }],
        generalCompatibilities: [
            { RebateID: 432 },
            { CompatibilityList: [563272, 563278], RebateID: 476 },
            { CompatibilityList: [563272, 563278], RebateID: 501 },
            { CompatibilityList: [563272, 563278], RebateID: 506 },
            { CompatibilityList: [578442], RebateID: 527 },
            { CompatibilityList: [563272, 563278], RebateID: 530 },
        ],
        categories: [
            { ID: 1, Name: "Military", Subcategory: null },
            { ID: 2, Name: "College Grad", Subcategory: null },
            {
                ID: 3,
                Name: "Membership",
                Subcategory: [
                    { ID: 1, Name: "USAA" },
                    { ID: 2, Name: "Farm Bureau" },
                    { ID: 3, Name: "Dairy Farmers Of America" },
                    { ID: 4, Name: "American Quarter Horse Association" },
                    { ID: 5, Name: "Mobility" },
                    { ID: 6, Name: "Associated Builders & Contractors" },
                    { ID: 7, Name: "Associated General Contractors" },
                    { ID: 8, Name: "Future Farmers of America (FFA)" },
                    { ID: 9, Name: "National Association of Realtors" },
                    { ID: 10, Name: "National Association of Remodelers" },
                    { ID: 11, Name: "National Federation of Independent Buisnesses" },
                    { ID: 12, Name: "National Funeral Directors Association (NFDA)" },
                    { ID: 13, Name: "New Holland Equipment" },
                    { ID: 14, Name: "Plumbing Heating Cooling Contractors Association" },
                    { ID: 15, Name: "Snow & Ice Managements Association (SIMA)" },
                    { ID: 16, Name: "Case Construction Equip" },
                    { ID: 17, Name: "Police Association IUPA and NAPO" },
                    { ID: 18, Name: "United Auto Workers (UAW)" },
                    { ID: 21, Name: "Costco" },
                    { ID: 22, Name: "Driving School Association of America" },
                ],
            },
            { ID: 4, Name: "Brand Loyalty", Subcategory: null },
            { ID: 5, Name: "Conquest", Subcategory: null },
            { ID: 6, Name: "First Responders", Subcategory: null },
            { ID: 7, Name: "Partner Program", Subcategory: null },
            { ID: 8, Name: "Medical Professionals", Subcategory: null },
            { ID: 9, Name: "Veteran", Subcategory: null },
            { ID: 10, Name: "Private Offer", Subcategory: null },
            { ID: 11, Name: "Targeted Offer", Subcategory: null },
            { ID: 12, Name: "Employee Program", Subcategory: null },
            { ID: 13, Name: "Loyalty Offer", Subcategory: null },
            { ID: 14, Name: "Conquest Offer", Subcategory: null },
            { ID: 15, Name: "Federal Tax Credit", Subcategory: null },
            { ID: 16, Name: "State Tax Credit", Subcategory: null },
            { ID: 17, Name: "Non-Advertised", Subcategory: null },
            { ID: 18, Name: "Brand Loyalty - Non-Advertised", Subcategory: null },
            { ID: 19, Name: "Pull Ahead Cash", Subcategory: null },
            {
                ID: 1000,
                Name: "Info Purposes Only",
                Subcategory: [
                    { ID: 19, Name: "Pull Forward" },
                    { ID: 20, Name: "Mobility" },
                    { ID: 23, Name: "EV Credit" },
                    { ID: 24, Name: "First Payment Waiver" },
                ],
            },
        ],
        lenders: [{ Code: "AHFC", Name: "American Honda Finance Corp." }],
        lenderMakeMap: {
            ALL: ["ALLY", "USB"],
            HONDA: ["AHFC"],
            "ASTON MARTIN": ["AFS"],
            AUDI: ["AUD"],
            BENTLEY: ["BFS"],
            BMW: ["BMWFS"],
            CHRYSLER: ["CCAP", "SCU", "SCI", "SCL", "SFS"],
            DODGE: ["CCAP", "SCU", "SCI", "SCL", "SFS"],
            JEEP: ["CCAP", "SCU", "SCI", "SCL", "SFS"],
            RAM: ["CCAP", "SCU", "SCI", "SCL", "SFS"],
            FERRARI: ["FFS"],
            FORD: ["FMCC"],
            LINCOLN: ["FMCC", "LAFS"],
            GENESIS: ["GEN", "HMF"],
            BUICK: ["GMF"],
            CADILLAC: ["GMF"],
            CHEVROLET: ["GMF"],
            GMC: ["GMF"],
            HYUNDAI: ["HMF"],
            INFINITI: ["IFS"],
            JAGUAR: ["JFG"],
            KIA: ["KIA"],
            LAMBORGHINI: ["LAM"],
            "LAND ROVER": ["LRF"],
            LEXUS: ["LFS"],
            MASERATI: ["MCU"],
            MAZDA: ["MAZDA"],
            MCLAREN: ["MCL"],
            "MERCEDES-BENZ": ["MBCC"],
            MINI: ["MFS"],
            MITSUBISHI: ["MMCA"],
            NISSAN: ["NMAC"],
            POLESTAR: ["POL"],
            PORSCHE: ["PFS"],
            "ROLLS-ROYCE": ["RRM"],
            SMART: ["SMC"],
            SUBARU: ["SUB"],
            TOYOTA: ["SETF", "TFS"],
            VOLKSWAGEN: ["VCI"],
            VOLVO: ["VCFS"],
        },
    };
    const dealType = data?.finance?.method;
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
function accessoriesData(data) {
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
function protectionsData(data) {
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
function taxesAndFeesData(data) {
    const dealType = data?.finance?.method;
    const dt = dealType === DealType.LEASE ? "Lease" : "Retail";
    const pricing = data?.finance?.pricing?.[dt]?.Terms[0].Programs[0];
    const feesAndTaxes = pricing?.FullDetails;
    const taxes = [
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
    const filteredTaxes = taxes.filter((tax) => tax.value);
    if (!filteredTaxes.length) {
        return null;
    }
    return filteredTaxes;
}
