export function slugify(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function money(n) {
  return 'Rs. ' + Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** The entered price is what the customer pays: discounts are not applied. */
export function salePrice(price) {
  return Math.round(Number(price || 0));
}

export function pkr(n) {
  return 'PKR ' + Math.round(Number(n || 0)).toLocaleString('en-PK');
}

/** Image src safe for the storefront: legacy disk uploads (/uploads/...) don't exist on serverless. */
export function img(url) {
  if (!url || url.startsWith('/uploads/')) return '/placeholder.svg';
  return url;
}

export const FREE_DELIVERY_OVER = 10000;
export const KARACHI_FAR = 'Karachi - Bahria Town / Gulshan-e-Maymar';
export const CITIES = ['Karachi', KARACHI_FAR, 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other'];

export function deliveryFee(city, subtotal, freeDelivery = false) {
  if (freeDelivery || subtotal >= FREE_DELIVERY_OVER) return 0;
  if (city === KARACHI_FAR) return 2000;
  return city === 'Karachi' ? 1000 : 600;
}
