// ─── Block types ────────────────────────────────────────────────

export type BlockType =
  | 'cover'
  | 'text'
  | 'gallery'
  | 'room'
  | 'options'
  | 'video'
  | 'signature'

export interface CoverData {
  title: string
  clientName: string
  projectName: string
  date: string
  validUntil: string
  logoUrl: string
  bannerUrl: string
}

export interface TextData {
  heading: string
  content: string
  aiGenerated: boolean
}

export interface GalleryImage {
  id: string
  url: string
  caption: string
}
export interface GalleryData {
  columns: 2 | 3 | 4
  images: GalleryImage[]
}

export interface LineItem {
  id: string
  name: string
  ref: string
  qty: number
  price: number
  vatRate: 21 | 6
}
export interface RoomData {
  roomName: string
  items: LineItem[]
  photo: string
}

export interface OptionalItem {
  id: string
  name: string
  ref: string
  qty: number
  price: number
  vatRate: 21 | 6
  selected: boolean
}
export interface OptionsData {
  heading: string
  items: OptionalItem[]
}

export interface VideoData {
  url: string
  caption: string
}

export interface SignatureData {
  signerName: string
  signerRole: string
  signatureDataUrl: string
  signedAt: string
  accepted: boolean
}

// ─── Discriminated block union ──────────────────────────────────

export type BlockDataMap = {
  cover: CoverData
  text: TextData
  gallery: GalleryData
  room: RoomData
  options: OptionsData
  video: VideoData
  signature: SignatureData
}

export interface QuoteBlock<T extends BlockType = BlockType> {
  id: string
  type: T
  collapsed: boolean
  data: BlockDataMap[T]
}

// ─── Full quote ─────────────────────────────────────────────────

export interface Quote {
  id: string
  tenantId: string
  status: 'draft' | 'sent' | 'signed' | 'won' | 'lost'
  blocks: QuoteBlock[]
  createdAt: string
  updatedAt: string
}

// ─── Helpers ────────────────────────────────────────────────────

export const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)

export const fmt = (n: number) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)

// ─── Default data per block type ────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

export function createBlock<T extends BlockType>(type: T): QuoteBlock<T> {
  const defaults: Record<BlockType, unknown> = {
    cover: { title: '', clientName: '', projectName: '', date: today(), validUntil: '', logoUrl: '', bannerUrl: '' },
    text: { heading: '', content: '', aiGenerated: false },
    gallery: { columns: 3, images: [] },
    room: { roomName: '', items: [], photo: '' },
    options: { heading: 'Extra opties', items: [] },
    video: { url: '', caption: '' },
    signature: { signerName: '', signerRole: '', signatureDataUrl: '', signedAt: '', accepted: false },
  }
  return { id: uid(), type, collapsed: false, data: defaults[type] as BlockDataMap[T] }
}

export function createLineItem(): LineItem {
  return { id: uid(), name: '', ref: '', qty: 1, price: 0, vatRate: 21 }
}

export function createOptionalItem(): OptionalItem {
  return { id: uid(), name: '', ref: '', qty: 1, price: 0, vatRate: 21, selected: false }
}

// ─── Totals ─────────────────────────────────────────────────────

export function calcTotals(blocks: QuoteBlock[]) {
  let subtotal = 0
  let optionsTotal = 0
  let optionsCount = 0

  for (const b of blocks) {
    if (b.type === 'room') {
      const d = b.data as RoomData
      for (const i of d.items) subtotal += i.qty * i.price
    }
    if (b.type === 'options') {
      const d = b.data as OptionsData
      for (const i of d.items) {
        if (i.selected) {
          optionsTotal += i.qty * i.price
          optionsCount++
        }
      }
    }
  }

  const base = subtotal + optionsTotal
  // Simplified: assume 21% for totals bar (individual items track their own rate)
  const vat = base * 0.21
  return { subtotal, optionsTotal, optionsCount, vat, total: base + vat }
}
