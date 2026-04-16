import { BANK_STYLES } from '@/lib/brandStyles';

export const NETWORK_COLORS: Record<string, string> = {
  'Visa':       '#1A1F71',
  'Mastercard': '#EB001B',
  'Amex':       '#007BC1',
  'RuPay':      '#1B8C3E',
  'Diners':     '#004B87',
};

export function getBankStyle(bankName: string) {
  const s = BANK_STYLES[bankName] || BANK_STYLES['Other'];
  return {
    gradient: `linear-gradient(135deg, ${s.bg} 0%, ${s.bg2} 100%)`,
    bg: s.bg,
    bg2: s.bg2,
    text: s.text,
    textMuted: s.textMuted,
    logo: s.logoUrl,
    accent: s.chip,
    chip: s.chip,
  };
}
