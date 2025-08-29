export interface RowItem {
  title: string;
  price: string;
}

export interface PrintData {
  date: string;
  visitorName: string;
  accountName: string;
  dealerLogo: string;
  item: {
    details: string;
    ymm: string;
    image: string;
  };
  trade: {
    valuation: string;
    details: string;
    adjustments: string;
    fees: string;
  };
  pricing: {
    monthlyPayment: string;
    summary: string;
    termRate: string;
    termLength: string;
    offerType: string;
    dueAtSigning: string;
    dueBreakdown: string;
    breakdown: string;
  };
  incentives: string;
  accessories: RowItem[];
  protections: RowItem[];
  taxesAndFees: RowItem[];
  disclaimers: {
    trade: string;
    protection: string;
    incentive: string;
  };
  leadLink: string;
  address: string;
  phone: string;
  hide: {
    accessories: string;
    protections: string;
    taxesAndFees: string;
    incentives: string;
    trade: {
      none: string;
      costs: string;
      fees: string;
    };
  };
}
