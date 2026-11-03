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

export function salePrice(price, discount) {
  const p = Number(price || 0);
  const d = Number(discount || 0);
  return Math.round(p - (p * d) / 100);
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
export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other'];

export function deliveryFee(city, subtotal, freeDelivery = false) {
  if (freeDelivery || subtotal >= FREE_DELIVERY_OVER) return 0;
  return city === 'Karachi' ? 300 : 600;
}
