import { useState } from 'react'
import type {
  QuoteBlock, CoverData, TextData, GalleryData, RoomData,
  OptionsData, VideoData, SignatureData, LineItem, OptionalItem
} from '../../types/quote'
import { createLineItem, createOptionalItem, uid, fmt } from '../../types/quote'

// ─── Shared ─────────────────────────────────────────────────────

const inp = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>{children}</label>
}

// ─── COVER ──────────────────────────────────────────────────────

export function CoverEditor({ data, onChange }: { data: CoverData; onChange: (d: CoverData) => void }) {
  const set = (k: keyof CoverData, v: string) => onChange({ ...data, [k]: v })
  return (
    <div>
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-lg p-6 text-white mb-3">
        <div className="w-16 h-5 bg-white/15 rounded mb-3" />
        <h2 className="text-lg font-bold">{data.title || data.projectName || 'Offerte'}</h2>
        <p className="text-xs text-white/50 mt-1">{data.clientName}{data.date && ` · ${data.date}`}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Klantnaam"><input className={inp} value={data.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Acme BV" /></Field>
        <Field label="Projectnaam"><input className={inp} value={data.projectName} onChange={e => set('projectName', e.target.value)} placeholder="AV vergaderzalen" /></Field>
        <Field label="Offerte-titel"><input className={inp} value={data.title} onChange={e => set('title', e.target.value)} placeholder="Voorstel …" /></Field>
        <Field label="Datum"><input type="date" className={inp} value={data.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Geldig tot"><input type="date" className={inp} value={data.validUntil} onChange={e => set('validUntil', e.target.value)} /></Field>
        <Field label="Coverfoto URL"><input className={inp} value={data.bannerUrl} onChange={e => set('bannerUrl', e.target.value)} placeholder="https://…" /></Field>
      </div>
    </div>
  )
}

// ─── TEXT / AI ───────────────────────────────────────────────────

export function TextEditor({ data, onChange }: { data: TextData; onChange: (d: TextData) => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <input className="w-full border-0 border-b-2 border-gray-100 text-[15px] font-semibold py-1 focus:border-blue-500 focus:outline-none bg-transparent" value={data.heading} onChange={e => onChange({ ...data, heading: e.target.value })} placeholder="Koptekst, bv. Onze aanpak" />
      <textarea className={`${inp} min-h-20 resize-y leading-relaxed`} rows={4} value={data.content} onChange={e => onChange({ ...data, content: e.target.value })} placeholder="Beschrijf het project…" />
      <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500) }} disabled={loading} className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50">
        {loading ? <span className="inline-block w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" /> : '✦'} AI-tekst genereren
      </button>
    </div>
  )
}

// ─── ROOM / LINE ITEMS ──────────────────────────────────────────

export function RoomEditor({ data, onChange }: { data: RoomData; onChange: (d: RoomData) => void }) {
  const setItem = (id: string, patch: Partial<LineItem>) =>
    onChange({ ...data, items: data.items.map(i => i.id === id ? { ...i, ...patch } : i) })
  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter(i => i.id !== id) })
  const addItem = () =>
    onChange({ ...data, items: [...data.items, createLineItem()] })

  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-base">🏢</div>
        <input className="flex-1 text-[15px] font-semibold border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none bg-transparent py-1" value={data.roomName} onChange={e => onChange({ ...data, roomName: e.target.value })} placeholder="Zaalnaam" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              <th className="text-left px-2 py-2">Artikel</th>
              <th className="text-right px-2 py-2 w-14">Aantal</th>
              <th className="text-right px-2 py-2 w-20">Eenheid</th>
              <th className="text-center px-2 py-2 w-14">BTW</th>
              <th className="text-right px-2 py-2 w-20">Totaal</th>
              <th className="w-7" />
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.id} className="border-t border-gray-50 hover:bg-blue-50/30">
                <td className="px-2 py-1.5">
                  <input className="w-full text-xs font-medium bg-transparent focus:outline-none" value={item.name} onChange={e => setItem(item.id, { name: e.target.value })} placeholder="Artikelnaam" />
                  <input className="w-full text-[10px] text-gray-400 bg-transparent focus:outline-none mt-0.5" value={item.ref} onChange={e => setItem(item.id, { ref: e.target.value })} placeholder="Ref" />
                </td>
                <td className="px-2 py-1.5"><input type="number" min={0} className="w-full text-xs text-right bg-transparent focus:outline-none" value={item.qty} onChange={e => setItem(item.id, { qty: +e.target.value || 0 })} /></td>
                <td className="px-2 py-1.5"><input type="number" min={0} step={0.01} className="w-full text-xs text-right bg-transparent focus:outline-none" value={item.price} onChange={e => setItem(item.id, { price: +e.target.value || 0 })} /></td>
                <td className="px-2 py-1.5 text-center"><select className="text-[10px] bg-gray-100 border-0 rounded px-1 py-0.5" value={item.vatRate} onChange={e => setItem(item.id, { vatRate: +e.target.value as 21 | 6 })}><option value={21}>21%</option><option value={6}>6%</option></select></td>
                <td className="px-2 py-1.5 text-right font-semibold text-xs">{fmt(item.qty * item.price)}</td>
                <td className="px-1"><button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-gray-100">
        <button onClick={addItem} className="text-blue-600 text-xs font-semibold hover:underline">+ Artikel toevoegen</button>
        <div className="text-sm font-bold"><span className="text-gray-400 text-xs font-medium mr-1">Subtotaal</span>{fmt(subtotal)}</div>
      </div>
    </div>
  )
}

// ─── OPTIONS ────────────────────────────────────────────────────

export function OptionsEditor({ data, onChange }: { data: OptionsData; onChange: (d: OptionsData) => void }) {
  const toggle = (id: string) =>
    onChange({ ...data, items: data.items.map(i => i.id === id ? { ...i, selected: !i.selected } : i) })
  const setItem = (id: string, patch: Partial<OptionalItem>) =>
    onChange({ ...data, items: data.items.map(i => i.id === id ? { ...i, ...patch } : i) })
  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter(i => i.id !== id) })
  const addItem = () =>
    onChange({ ...data, items: [...data.items, createOptionalItem()] })

  return (
    <div className="flex flex-col gap-1.5">
      {data.items.map(item => (
        <div key={item.id} onClick={() => toggle(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${item.selected ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 transition-all ${item.selected ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
            {item.selected && '✓'}
          </div>
          <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            <input className="w-full text-sm font-medium bg-transparent focus:outline-none" value={item.name} onChange={e => setItem(item.id, { name: e.target.value })} placeholder="Optienaam" />
            <input className="w-full text-[10px] text-gray-400 bg-transparent focus:outline-none" value={item.ref} onChange={e => setItem(item.id, { ref: e.target.value })} placeholder="Ref" />
          </div>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <input type="number" min={0} step={0.01} className="w-20 text-xs text-right bg-transparent focus:outline-none" value={item.price} onChange={e => setItem(item.id, { price: +e.target.value || 0 })} />
            <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-blue-600 text-xs font-semibold hover:underline self-start mt-1">+ Optie toevoegen</button>
    </div>
  )
}

// ─── GALLERY ────────────────────────────────────────────────────

export function GalleryEditor({ data, onChange }: { data: GalleryData; onChange: (d: GalleryData) => void }) {
  const addImage = () => {
    const url = prompt('Plak de afbeeldings-URL:')
    if (url) onChange({ ...data, images: [...data.images, { id: uid(), url, caption: '' }] })
  }
  const removeImage = (id: string) =>
    onChange({ ...data, images: data.images.filter(i => i.id !== id) })

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Field label="Kolommen">
          <select className={inp + ' w-16'} value={data.columns} onChange={e => onChange({ ...data, columns: +e.target.value as 2 | 3 | 4 })}>
            <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}>
        {data.images.map(img => (
          <div key={img.id} className="relative aspect-[4/3] rounded-lg border border-gray-200 overflow-hidden group bg-gray-100">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center">✕</button>
          </div>
        ))}
        <button onClick={addImage} className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer">
          <span className="text-lg">📤</span><span className="text-[10px]">Upload</span>
        </button>
      </div>
    </div>
  )
}

// ─── VIDEO ──────────────────────────────────────────────────────

export function VideoEditor({ data, onChange }: { data: VideoData; onChange: (d: VideoData) => void }) {
  return (
    <div>
      <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center text-white text-3xl mb-2">▶</div>
      <input className={inp} value={data.url} onChange={e => onChange({ ...data, url: e.target.value })} placeholder="YouTube of Vimeo URL…" />
    </div>
  )
}

// ─── SIGNATURE ──────────────────────────────────────────────────

export function SignatureEditor({ data, onChange }: { data: SignatureData; onChange: (d: SignatureData) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Field label="Naam ondertekenaar"><input className={inp} value={data.signerName} onChange={e => onChange({ ...data, signerName: e.target.value })} placeholder="Naam klant" /></Field>
        <Field label="Functie"><input className={inp} value={data.signerRole} onChange={e => onChange({ ...data, signerRole: e.target.value })} placeholder="CEO, CTO, …" /></Field>
      </div>
      <div className="border border-gray-200 rounded-lg h-24 bg-gray-50 flex items-center justify-center text-gray-300 text-xs cursor-crosshair">
        Teken hier uw handtekening
      </div>
      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50">Wissen</button>
        <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50">🔗 Genereer link voor klant</button>
      </div>
    </div>
  )
}

// ─── Block editor router ────────────────────────────────────────

export function BlockBody({ block, onChange }: { block: QuoteBlock; onChange: (d: any) => void }) {
  switch (block.type) {
    case 'cover': return <CoverEditor data={block.data as CoverData} onChange={onChange} />
    case 'text': return <TextEditor data={block.data as TextData} onChange={onChange} />
    case 'room': return <RoomEditor data={block.data as RoomData} onChange={onChange} />
    case 'options': return <OptionsEditor data={block.data as OptionsData} onChange={onChange} />
    case 'gallery': return <GalleryEditor data={block.data as GalleryData} onChange={onChange} />
    case 'video': return <VideoEditor data={block.data as VideoData} onChange={onChange} />
    case 'signature': return <SignatureEditor data={block.data as SignatureData} onChange={onChange} />
    default: return null
  }
}
