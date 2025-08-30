export interface RowItem {
  title: string;
  value: string;
  category?: string;
  calculation?: string;
}

export interface ItemData {
  details: RowItem[];
  ymm: string;
  image: string;
}

export interface TradeData {
  valuation: RowItem[];
  details: RowItem[];
  adjustments?: RowItem[];
  fees?: RowItem[];
}

export interface PricingData {
  monthlyPayment: string;
  summary: RowItem[];
  termRate: string;
  termLength: string;
  offerType: string;
  dueAtSigning: RowItem[];
  dueBreakdown: RowItem[];
  breakdown: RowItem[];
}

interface DisclaimerData {
  trade: string;
  protection: string;
  incentive?: string;
}

export interface PrintData {
  item?: ItemData;
  trade?: TradeData;
  pricing?: PricingData;
  incentives?: RowItem[];
  accessories?: RowItem[];
  protections?: RowItem[];
  taxesAndFees?: RowItem[];
  disclaimers: DisclaimerData;
  
  // remove
  has?: {
    item: boolean;
    accessories: boolean;
    protections: boolean;
    taxesAndFees: boolean;
    incentives: boolean;
    trade: {
      accepted: boolean;
      adjustments: boolean;
      fees: boolean;
    };
    secondColumn: boolean;
  };
}

export interface EmailPrintData {
  date: string;
  visitorName: string;
  accountName: string;
  dealerLogo: string;
  leadLink: string;
  address: string;
  phone: string;
  data: PrintData;
}
