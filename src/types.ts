export interface RowItem {
  title: string;
  value: string;
  category?: string;
  calculation?: string;
}

export interface PrintData {
  date: string;
  visitorName: string;
  accountName: string;
  dealerLogo: string;
  item: {
    details: RowItem[];
    ymm: string;
    image: string;
  };
  trade: {
    valuation: RowItem[];
    details: RowItem[];
    adjustments: RowItem[];
    fees: RowItem[];
  };
  pricing: {
    monthlyPayment: string;
    summary: RowItem[];
    termRate: string;
    termLength: string;
    offerType: string;
    dueAtSigning: RowItem;
    dueBreakdown: RowItem[];
    breakdown: RowItem[];
  };
  incentives: RowItem[];
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
  
  // remove
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
