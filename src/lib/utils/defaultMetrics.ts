// Default metrics for each node type
// These are industry-standard estimates to help visualize funnel performance

export interface DefaultMetrics {
  visitors?: number;
  conversionRate?: number;
  cost?: number;
}

// Traffic sources - default visitor counts
export const trafficDefaults: Record<string, DefaultMetrics> = {
  facebook: { visitors: 1000, cost: 500 },
  instagram: { visitors: 800, cost: 400 },
  tiktok: { visitors: 1200, cost: 300 },
  youtube: { visitors: 600, cost: 450 },
  linkedin: { visitors: 400, cost: 600 },
  google: { visitors: 500, cost: 350 },
  organic: { visitors: 300, cost: 0 },
  affiliate: { visitors: 200, cost: 100 },
};

// Pages - default conversion rates (%)
export const pageDefaults: Record<string, DefaultMetrics> = {
  landing: { conversionRate: 35, cost: 0 },
  sales: { conversionRate: 15, cost: 0 },
  webinar: { conversionRate: 45, cost: 0 },
  checkout: { conversionRate: 65, cost: 0 },
  thankyou: { conversionRate: 100, cost: 0 },
  blog: { conversionRate: 25, cost: 0 },
  calendar: { conversionRate: 40, cost: 0 },
  survey: { conversionRate: 55, cost: 0 },
  upsell: { conversionRate: 25, cost: 0 },
  downsell: { conversionRate: 35, cost: 0 },
};

// Communication - default recipient counts
export const communicationDefaults: Record<string, DefaultMetrics> = {
  email: { visitors: 500, cost: 50 },
  sequence: { visitors: 400, cost: 100 },
  sms: { visitors: 300, cost: 150 },
  whatsapp: { visitors: 350, cost: 75 },
};

// Events - default conversion rates (%)
export const eventDefaults: Record<string, DefaultMetrics> = {
  lead: { conversionRate: 100, cost: 0 },
  customer: { conversionRate: 100, cost: 0 },
  upsell: { conversionRate: 30, cost: 0 },
  lost: { conversionRate: 100, cost: 0 },
  segment: { conversionRate: 80, cost: 0 },
};

export const getDefaultMetrics = (nodeType: string, category: string): DefaultMetrics => {
  switch (category) {
    case 'traffic':
      return trafficDefaults[nodeType] || { visitors: 500, cost: 200 };
    case 'page':
      return pageDefaults[nodeType] || { conversionRate: 30, cost: 0 };
    case 'communication':
      return communicationDefaults[nodeType] || { visitors: 300, cost: 50 };
    case 'event':
      return eventDefaults[nodeType] || { conversionRate: 50, cost: 0 };
    default:
      return { conversionRate: 50 };
  }
};
