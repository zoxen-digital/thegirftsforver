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

export const PROVINCES = {
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Other'],
  Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Sargodha', 'Other'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Other'],
  Balochistan: ['Quetta', 'Gwadar', 'Other'],
  'Azad Kashmir': ['Muzaffarabad', 'Mirpur', 'Other'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Other'],
};

/** Free when every item ships free, or the subtotal reaches the admin threshold (0 turns that off). */
export function deliveryFee(option, subtotal, freeOver, allFree = false) {
  if (allFree || (freeOver > 0 && subtotal >= freeOver)) return 0;
  return Number(option?.price || 0);
}
