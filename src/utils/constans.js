export const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export const networkColors = {
  MTN: { 
    bg: 'rgba(245,158,11,0.1)', 
    border: 'rgba(245,158,11,0.3)', 
    text: '#F59E0B', 
    lightBg: 'rgba(245,158,11,0.07)',
    logo: 'https://naneqdnezdtpksfwgyap.supabase.co/storage/v1/object/public/bundle_images/409D6B61-5FAA-47A7-A59B-D4DA9038B6C7.png' // Add this
  },
  Telecel: { 
    bg: 'rgba(239,68,68,0.1)', 
    border: 'rgba(239,68,68,0.3)', 
    text: '#EF4444', 
    lightBg: 'rgba(239,68,68,0.07)',
    logo: 'https://naneqdnezdtpksfwgyap.supabase.co/storage/v1/object/public/bundle_images/IMG_1563.jpeg' // Add this
  },
  AT: { 
    bg: 'rgba(56,189,248,0.1)', 
    border: 'rgba(56,189,248,0.3)', 
    text: '#38BDF8', 
    lightBg: 'rgba(56,189,248,0.07)',
    logo: 'https://naneqdnezdtpksfwgyap.supabase.co/storage/v1/object/public/bundle_images/IMG_1561.jpeg' // Add this
  },
};


export const ACCENT_COLORS = [
  { name: 'Blue',   value: '#38BDF8' },
  { name: 'Green',  value: '#22D3A1' },
  { name: 'Amber',  value: '#F59E0B' },
  { name: 'Red',    value: '#EF4444' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Pink',   value: '#F472B6' },
];

export const networkPrefixes = {
  MTN:     ['024', '054', '055', '059', '028'],
  Telecel: ['020', '050'],
  AT:      ['026', '027', '056', '057'],
};

export const TESTIMONIALS = [
  { id: 't1', quote: 'Sci-fi Data transformed how I buy data. Instant delivery every time.', author: 'Kwame Asante',       role: 'Regular Customer', network: 'MTN'     },
  { id: 't2', quote: "I started my store and I'm already making GH₵2,000 a month. The dashboard is so easy.", author: 'Abena Osei', role: 'Store Owner',   network: 'AT'      },
  { id: 't3', quote: 'Best prices, I buy in bulk for all my employees. Reliable every time.', author: 'Dr. Emmanuel Mensah', role: 'Business Customer', network: 'Telecel' },
];
