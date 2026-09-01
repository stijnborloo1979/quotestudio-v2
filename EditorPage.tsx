import { useState, useRef, useCallback } from 'react'
import type { QuoteBlock, BlockType } from '../types/quote'
import { createBlock, calcTotals, fmt, uid } from '../types/quote'
import { BlockBody } from '../components/blocks/BlockEditors'

// ─── Block metadata ─────────────────────────────────────────────

const BLOCK_META: Record<BlockType, { icon: string; label: string; color: string }> = {
  cover:     { icon: '🎨', label: 'Cover',       color: 'bg-amber-100 text-amber-800' },
  text:      { icon: '📝', label: 'Tekst',       color: 'bg-blue-50 text-blue-700' },
  room:      { icon: '🏠', label: 'Zaal',        color: 'bg-emerald-50 text-emerald-700' },
  options:   { icon: '☑️', label: 'Opties',      color: 'bg-purple-50 text-purple-700' },
  gallery:   { icon: '🖼', label: 'Galerij',     color: 'bg-pink-50 text-pink-700' },
  video:     { icon: '🎬', label: 'Video',       color: 'bg-amber-50 text-amber-700' },
  signature: { icon: '✍️', label: 'Handtekening', color: 'bg-green-50 text-green-700' },
}

const BLOCK_TYPES: BlockType[] = ['cover', 'text', 'room', 'options', 'gallery', 'video', 'signature']

// ─── Component ──────────────────────────────────────────────────

export default function EditorPage() {
  const [blocks, setBlocks] = useState<QuoteBlock[]>([
    { ...createBlock('cover'), data: { title: 'Voorstel AV-installatie', clientName: 'TechCorp BV', projectName: 'AV vergaderzalen', date: '2026-08-31', validUntil: '2026-10-31', logoUrl: '', bannerUrl: '' } },
    { ...createBlock('text'), data: { heading: 'Onze aanpak', content: 'Op basis van onze analyse stellen wij een volledig geïntegreerde oplossing voor.', aiGenerated: false } },
    { ...createBlock('room'), data: { roomName: 'Vergaderzaal A', items: [
      { id: uid(), name: 'Samsung QM85R 85" display', ref: 'LH85QMREBGCXEN', qty: 1, price: 3450, vatRate: 21 },
      { id: uid(), name: 'Shure MXA920 plafondmicrofoon', ref: 'MXA920-S', qty: 2, price: 1890, vatRate: 21 },
      { id: uid(), name: 'Installatie en configuratie', ref: '', qty: 1, price: 1200, vatRate: 21 },
    ], photo: '' } },
    { ...createBlock('options'), data: { heading: 'Extra opties', items: [
      { id: uid(), name: 'Barco ClickShare CX-50', ref: 'R9861522EU', qty: 1, price: 1650, vatRate: 21, selected: true },
      { id: uid(), name: '3 jaar onderhoudscontract', ref: '', qty: 1, price: 480, vatRate: 21, selected: false },
    ] } },
    createBlock('signature'),
  ])

  const [showMenu, setShowMenu] = useState(false)
  const [status] = useState<'draft'>('draft')

  // ── Block CRUD ──────────────────────────────────────────────

  const addBlock = (type: BlockType) => {
    setBlocks(b => [...b, createBlock(type)])
    setShowMenu(false)
  }

  const updateBlockData = useCallback((id: string, data: any) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, data } : bl))
  }, [])

  const removeBlock = (id: string) => {
    setBlocks(b => b.filter(bl => bl.id !== id))
  }

  const toggleCollapse = (id: string) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, collapsed: !bl.collapsed } : bl))
  }

  const moveBlock = (from: number, to: number) => {
    setBlocks(b => {
      const next = [...b]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  // ── Drag & Drop ─────────────────────────────────────────────

  const dragIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const onDragStart = (idx: number) => { dragIdx.current = idx }
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx) }
  const onDrop = (idx: number) => {
    if (dragIdx.current !== null && dragIdx.current !== idx) moveBlock(dragIdx.current, idx)
    dragIdx.current = null
    setDragOverIdx(null)
  }

  // ── Totals ──────────────────────────────────────────────────

  const totals = calcTotals(blocks)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Topbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="h-[3px] bg-blue-600" />
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-blue-600 tracking-tight">QS</span>
            <span className="text-sm font-medium text-gray-400">QuoteStudio v2</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
              {status === 'draft' ? 'Concept' : status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">👁 Preview</button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">📄 PDF</button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">🔗 Deel</button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white border border-blue-700 rounded-lg hover:bg-blue-700">💾 Opslaan</button>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">SB</div>
          </div>
        </div>
      </header>

      {/* ── Palette ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-hide">
          {BLOCK_TYPES.map(type => {
            const m = BLOCK_META[type]
            return (
              <button key={type} onClick={() => addBlock(type)} className="flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-dashed border-gray-300 rounded-lg text-[11px] font-semibold text-gray-500 whitespace-nowrap hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:border-solid transition-all">
                <span>{m.icon}</span>{m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Blocks ───────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-32">
        <div className="flex flex-col gap-2">
          {blocks.map((block, idx) => {
            const meta = BLOCK_META[block.type]
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDrop={() => onDrop(idx)}
                onDragEnd={() => setDragOverIdx(null)}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  dragOverIdx === idx ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Block header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-100 cursor-grab active:cursor-grabbing select-none">
                  <span className="text-gray-300 hover:text-gray-500 text-sm">⠿</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="flex-1" />
                  <div className="flex gap-0.5">
                    {idx > 0 && (
                      <button onClick={() => moveBlock(idx, idx - 1)} className="px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">▲</button>
                    )}
                    {idx < blocks.length - 1 && (
                      <button onClick={() => moveBlock(idx, idx + 1)} className="px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">▼</button>
                    )}
                    <button onClick={() => toggleCollapse(block.id)} className="px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      {block.collapsed ? '▶' : '▼'}
                    </button>
                    <button onClick={() => removeBlock(block.id)} className="px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">✕</button>
                  </div>
                </div>

                {/* Block body */}
                {!block.collapsed && (
                  <div className="p-3.5">
                    <BlockBody block={block} onChange={(data) => updateBlockData(block.id, data)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add block */}
        <div className="flex justify-center py-6">
          <button onClick={() => setShowMenu(true)} className="px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
            + Blok toevoegen
          </button>
        </div>
      </div>

      {/* ── Sticky totals ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 space-y-0.5">
            <div className="flex justify-between gap-6"><span>Subtotaal</span><span>{fmt(totals.subtotal)}</span></div>
            {totals.optionsCount > 0 && <div className="flex justify-between gap-6"><span>Opties ({totals.optionsCount})</span><span>{fmt(totals.optionsTotal)}</span></div>}
            <div className="flex justify-between gap-6"><span>BTW 21%</span><span>{fmt(totals.vat)}</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Totaal incl. BTW</div>
            <div className="text-xl font-extrabold tracking-tight">{fmt(totals.total)}</div>
          </div>
        </div>
      </div>

      {/* ── Block menu modal ─────────────────────────────── */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-3">Blok toevoegen</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_TYPES.map(type => {
                const m = BLOCK_META[type]
                return (
                  <button key={type} onClick={() => addBlock(type)} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${m.color}`}>{m.icon}</div>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowMenu(false)} className="w-full mt-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Annuleren</button>
          </div>
        </div>
      )}
    </div>
  )
}
