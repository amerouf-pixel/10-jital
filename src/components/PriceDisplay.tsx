import React from 'react';

export default function PriceDisplay({ amount, currency, priceInMAD }: { amount?: number; currency?: string; priceInMAD?: any }) {
  return <span>{amount || 0} {currency || 'EUR'}</span>;
}
