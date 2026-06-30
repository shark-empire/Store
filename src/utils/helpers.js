import { networkPrefixes } from './constants';

export function makeRef() {
  return `DP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ghs(amount) {
  return `GH₵${Number(amount).toFixed(2)}`;
}

export function phoneMatchesNetwork(phone, network) {
  const prefixes = networkPrefixes[network] ?? [];
  return prefixes.some((p) => phone.startsWith(p));
}

export function fmtSize(sizeGb) {
  return sizeGb < 1 ? `${Math.round(sizeGb * 1024)}MB` : `${sizeGb}GB`;
}

export const formatPhoneNumber = (input) => {
  let cleaned = input.replace(/\D/g, ''); 
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return `+233${cleaned}`;
};
