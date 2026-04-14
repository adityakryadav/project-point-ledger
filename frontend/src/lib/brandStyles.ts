// ─── Brand Styles — coupon companies ─────────────────────────────────────────
export const COUPON_BRAND_STYLES: Record<string, { bg: string; accent: string; text: string }> = {
  "Dominos":        { bg: '#003087', accent: '#E31837', text: '#ffffff' },
  "Burger King":    { bg: '#F5EBDC', accent: '#D62300', text: '#502314' },
  "McDonalds":      { bg: '#FFC72C', accent: '#DA020E', text: '#27251F' },
  "Swiggy":         { bg: '#FC8019', accent: '#ffffff', text: '#ffffff' },
  "Zomato":         { bg: '#E23744', accent: '#ffffff', text: '#ffffff' },
  "KFC":            { bg: '#F40027', accent: '#ffffff', text: '#ffffff' },
  "Pizza Hut":      { bg: '#EE3124', accent: '#ffffff', text: '#ffffff' },
  "Starbucks":      { bg: '#00704A', accent: '#CBA258', text: '#ffffff' },
  "Cafe Coffee Day":{ bg: '#6B2C3E', accent: '#F5A623', text: '#ffffff' },
  "Blinkit":        { bg: '#F8CB46', accent: '#1A1A1A', text: '#1A1A1A' },
  "Zepto":          { bg: '#8B2FC9', accent: '#ffffff', text: '#ffffff' },
  "JioMart":        { bg: '#0A3A8C', accent: '#00B5EF', text: '#ffffff' },
  "Zara":           { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
  "Zudio":          { bg: '#1A1A2E', accent: '#E94560', text: '#ffffff' },
  "H&M":            { bg: '#E50010', accent: '#ffffff', text: '#ffffff' },
  "Myntra":         { bg: '#FF3F6C', accent: '#ffffff', text: '#ffffff' },
  "Nike":           { bg: '#111111', accent: '#ffffff', text: '#ffffff' },
  "Adidas":         { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
  "Levi's":         { bg: '#C41230', accent: '#ffffff', text: '#ffffff' },
  "FabIndia":       { bg: '#7B3F00', accent: '#F5A623', text: '#ffffff' },
  "Ajio":           { bg: '#1A1A1A', accent: '#E91E63', text: '#ffffff' },
  "Meesho":         { bg: '#9B1FE8', accent: '#ffffff', text: '#ffffff' },
  "Reliance Trends":{ bg: '#003580', accent: '#FFD700', text: '#ffffff' },
  "PVR":            { bg: '#E71C23', accent: '#FFD700', text: '#ffffff' },
  "INOX":           { bg: '#00437A', accent: '#ffffff', text: '#ffffff' },
  "IMAX":           { bg: '#000000', accent: '#C9A84C', text: '#C9A84C' },
  "BookMyShow":     { bg: '#E51937', accent: '#ffffff', text: '#ffffff' },
  "Disney+ Hotstar":{ bg: '#0B0C18', accent: '#0E4DA4', text: '#ffffff' },
  "Netflix":        { bg: '#141414', accent: '#E50914', text: '#ffffff' },
  "Amazon Prime":   { bg: '#00A8E1', accent: '#232F3E', text: '#ffffff' },
  "MakeMyTrip":     { bg: '#E03628', accent: '#ffffff', text: '#ffffff' },
  "Cleartrip":      { bg: '#F77C00', accent: '#ffffff', text: '#ffffff' },
  "Ola":            { bg: '#1C9F3C', accent: '#ffffff', text: '#ffffff' },
  "Uber":           { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
  "Rapido":         { bg: '#FFD700', accent: '#1A1A1A', text: '#1A1A1A' },
  "RedBus":         { bg: '#D84315', accent: '#ffffff', text: '#ffffff' },
  "Amazon":         { bg: '#232F3E', accent: '#FF9900', text: '#FF9900' },
  "Flipkart":       { bg: '#2874F0', accent: '#FFD700', text: '#ffffff' },
  "Croma":          { bg: '#12783D', accent: '#ffffff', text: '#ffffff' },
  "Apple":          { bg: '#1D1D1F', accent: '#ffffff', text: '#ffffff' },
  "Samsung":        { bg: '#1428A0', accent: '#ffffff', text: '#ffffff' },
  "Boat":           { bg: '#1A1A2E', accent: '#E94560', text: '#ffffff' },
  "Airtel":         { bg: '#E40000', accent: '#ffffff', text: '#ffffff' },
  "Jio":            { bg: '#003087', accent: '#00B5EF', text: '#ffffff' },
  "Nykaa":          { bg: '#FC2779', accent: '#ffffff', text: '#ffffff' },
  "Mamaearth":      { bg: '#4CAF50', accent: '#ffffff', text: '#ffffff' },
  "Cult.fit":       { bg: '#000000', accent: '#FF6B00', text: '#ffffff' },
  "1mg":            { bg: '#EE4D2D', accent: '#ffffff', text: '#ffffff' },
  "Naukri":         { bg: '#3B5998', accent: '#ffffff', text: '#ffffff' },
  "Decathlon":      { bg: '#0082C8', accent: '#ffffff', text: '#ffffff' },
  "Puma":           { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
};

export function getCouponBrandStyle(name: string) {
  return COUPON_BRAND_STYLES[name] || { bg: '#1c1c1a', accent: '#c044f0', text: '#ffffff' };
}

// ─── Bank/Card Styles ─────────────────────────────────────────────────────────
export interface BankStyle {
  bg: string;           // card gradient start
  bg2: string;          // card gradient end
  text: string;         // primary text
  textMuted: string;    // secondary text
  logoUrl: string;      // bank logo
  chip: string;         // chip color
}

export const BANK_STYLES: Record<string, BankStyle> = {
  "HDFC Bank": {
    bg: '#004C8F', bg2: '#002B5C',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/hdfcbank.com',
    chip: '#D4AF37',
  },
  "SBI": {
    bg: '#2E4057', bg2: '#13293D',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/sbi.co.in',
    chip: '#D4AF37',
  },
  "ICICI Bank": {
    bg: '#B02A37', bg2: '#7A1E28',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/icicibank.com',
    chip: '#FFD700',
  },
  "Axis Bank": {
    bg: '#97144D', bg2: '#6B0F37',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/axisbank.com',
    chip: '#D4AF37',
  },
  "Kotak Mahindra": {
    bg: '#ED1C24', bg2: '#A5141A',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/kotak.com',
    chip: '#FFD700',
  },
  "Yes Bank": {
    bg: '#0066CC', bg2: '#004B99',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/yesbank.in',
    chip: '#D4AF37',
  },
  "IDFC First": {
    bg: '#9E2A2B', bg2: '#6B1A1B',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/idfcfirstbank.com',
    chip: '#C0C0C0',
  },
  "IndusInd Bank": {
    bg: '#6B21A8', bg2: '#4A1572',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/indusind.com',
    chip: '#FFD700',
  },
  "Punjab National Bank": {
    bg: '#1E40AF', bg2: '#1E3A8A',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/pnbindia.in',
    chip: '#D4AF37',
  },
  "Bank of Baroda": {
    bg: '#F59E0B', bg2: '#B45309',
    text: '#1A1A1A', textMuted: 'rgba(0,0,0,0.55)',
    logoUrl: 'https://logo.clearbit.com/bankofbaroda.in',
    chip: '#1A1A1A',
  },
  "Canara Bank": {
    bg: '#065F46', bg2: '#064E3B',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/canarabank.com',
    chip: '#D4AF37',
  },
  "Union Bank": {
    bg: '#1E3A5F', bg2: '#0F2540',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/unionbankofindia.co.in',
    chip: '#C0C0C0',
  },
  "Federal Bank": {
    bg: '#1E40AF', bg2: '#1D4ED8',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/federalbank.co.in',
    chip: '#FFD700',
  },
  "RBL Bank": {
    bg: '#7C3AED', bg2: '#5B21B6',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/rblbank.com',
    chip: '#D4AF37',
  },
  "Standard Chartered": {
    bg: '#0E5D3A', bg2: '#083D26',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/sc.com',
    chip: '#D4AF37',
  },
  "HSBC India": {
    bg: '#DB0011', bg2: '#9B000C',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/hsbc.co.in',
    chip: '#FFD700',
  },
  "Citibank India": {
    bg: '#003B8E', bg2: '#002060',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/citi.com',
    chip: '#D4AF37',
  },
  "American Express": {
    bg: '#007CC3', bg2: '#005A8E',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: 'https://logo.clearbit.com/americanexpress.com',
    chip: '#D4AF37',
  },
  "Other": {
    bg: '#374151', bg2: '#1F2937',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)',
    logoUrl: '',
    chip: '#C0C0C0',
  },
};

export function getBankStyle(bankName: string): BankStyle {
  return BANK_STYLES[bankName] || BANK_STYLES["Other"];
}

// ─── Reusable mini card component data ───────────────────────────────────────
export interface CardDisplayData {
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  network?: string;
  available_points?: number;
  expiring_points?: number;
  expiry_date?: string;
}
