import mongoose from 'mongoose';

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

// ---------- counters (human friendly numeric ids) ----------
const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
export const Counter = model('Counter', CounterSchema);

export async function nextSeq(name, start = 1000) {
  const c = await Counter.findOneAndUpdate(
    { _id: name },
    [{ $set: { seq: { $add: [{ $ifNull: ['$seq', start] }, 1] } } }],
    { new: true, upsert: true }
  );
  return c.seq;
}

// ---------- uploads (binary stored in Mongo so it survives serverless redeploys) ----------
const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
export const StoredUpload = model('StoredUpload', StoredUploadSchema);

// ---------- catalog ----------
const FaqItem = new Schema({ q: String, a: String }, { _id: false });

const CategorySchema = new Schema(
  {
    cid: { type: Number, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: ObjectId, ref: 'Category', default: null },
    image: String,
    imageName: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    description: String,
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    showOnMenu: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    sort: { type: Number, default: 0 },
    homeSort: { type: Number, default: 0 },
    faqs: [FaqItem],
  },
  { timestamps: true }
);
export const Category = model('Category', CategorySchema);

const VariationOption = new Schema({ value: String, label: String, price: Number }, { _id: false });

const ProductSchema = new Schema(
  {
    pid: { type: Number, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: ObjectId, ref: 'Category' },
    categories: [{ type: ObjectId, ref: 'Category' }],
    shortDescription: String,
    description: String,
    coverImage: String,
    gallery: [String],
    price: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    youtubeUrl: String,
    imagesNeed: { type: Number, default: 0 },
    metaKeywords: String,
    metaDescription: String,
    tags: [{ type: ObjectId, ref: 'Tag' }],
    form: { type: ObjectId, ref: 'Form', default: null },
    freeDelivery: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    featuredOnCategory: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    variations: {
      size: [VariationOption],
      color: [VariationOption],
      quantity: [VariationOption],
      suitColor: [VariationOption],
    },
    modifiers: [VariationOption],
    suggestionCategory: { type: ObjectId, ref: 'Category', default: null },
  },
  { timestamps: true }
);
ProductSchema.index({ name: 'text', shortDescription: 'text' });
export const Product = model('Product', ProductSchema);

const TagSchema = new Schema(
  { name: { type: String, required: true }, slug: { type: String, required: true, unique: true } },
  { timestamps: true }
);
export const Tag = model('Tag', TagSchema);

// ---------- content ----------
const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: String,
    excerpt: String,
    content: String,
    author: { type: String, default: 'Team TheGiftsForever' },
    faqs: [FaqItem],
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Blog = model('Blog', BlogSchema);

const ContentPageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: String,
    content: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    showInFooter: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const ContentPage = model('ContentPage', ContentPageSchema);

const SlideSchema = new Schema(
  {
    image: { type: String, required: true },
    eyebrow: String,
    title: String,
    content: String,
    buttonText: { type: String, default: 'Shop now' },
    link: String,
    imageName: String,
    active: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Slide = model('Slide', SlideSchema);

// ---------- dynamic product forms ----------
const FieldSchema = new Schema(
  {
    label: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['text', 'textarea', 'number', 'date', 'select', 'file'], default: 'text' },
    options: String, // comma separated for select
    required: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Field = model('Field', FieldSchema);

const FormSchema = new Schema(
  {
    name: { type: String, required: true },
    fields: [{ type: ObjectId, ref: 'Field' }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Form = model('Form', FormSchema);

// ---------- reviews ----------
const ReviewSchema = new Schema(
  {
    kind: { type: String, enum: ['category', 'google', 'whatsapp'], default: 'category', index: true },
    category: { type: ObjectId, ref: 'Category', default: null },
    name: { type: String, required: true },
    email: String,
    review: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    images: [String],
    whatsapp: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Review = model('Review', ReviewSchema);

// ---------- orders ----------
export const ORDER_STATUSES = [
  'new',
  'processing',
  'confirmed',
  'pending',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed',
  'returned',
  'refunded',
];

const OrderItemSchema = new Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    cost: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    options: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    oid: { type: Number, index: true },
    items: [OrderItemSchema],
    customer: { name: String, phone: String, email: String, country: String },
    receiver: { name: String, phone: String, address: String, province: String, city: String },
    deliveryDate: String,
    deliveryTime: String,
    message: String,
    instructions: String,
    deliveryOption: String,
    image: String,
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'bank' },
    paymentProof: String,
    status: { type: String, enum: ORDER_STATUSES, default: 'new', index: true },
    notes: String,
    website: String,
  },
  { timestamps: true }
);
export const Order = model('Order', OrderSchema);

// ---------- inventory ----------
const InventoryItemSchema = new Schema(
  {
    name: { type: String, required: true },
    image: String,
    stock: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    lowStockAt: { type: Number, default: 5 },
  },
  { timestamps: true }
);
export const InventoryItem = model('InventoryItem', InventoryItemSchema);

const InventoryLogSchema = new Schema(
  {
    item: { type: ObjectId, ref: 'InventoryItem' },
    itemName: String,
    change: Number,
    stockAfter: Number,
    unitPrice: Number,
    note: String,
  },
  { timestamps: true }
);
export const InventoryLog = model('InventoryLog', InventoryLogSchema);

// ---------- websites (multi-site switcher) ----------
const DeliveryOption = new Schema({ name: String, price: Number }, { _id: false });
const PaymentOption = new Schema({ name: String, details: String }, { _id: false });

const WebsiteSchema = new Schema(
  {
    name: { type: String, required: true },
    domain: String,
    phone: String,
    whatsapp: String,
    email: String,
    address: String,
    bankDetails: String,
    deliveryOptions: [DeliveryOption],
    freeDeliveryOver: { type: Number, default: 10000 },
    paymentMethods: [PaymentOption],
    facebook: String,
    instagram: String,
    tiktok: String,
    youtube: String,
    twitter: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Website = model('Website', WebsiteSchema);
