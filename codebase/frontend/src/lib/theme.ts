export const T = {
  canvas:        'var(--canvas)',
  sidebar:       'var(--sidebar)',
  sidebarBorder: 'var(--sidebar-border)',
  topbar:        'var(--topbar)',
  topbarBorder:  'var(--topbar-border)',
  column:        'var(--column)',
  card:          'var(--card)',
  cardBorder:    'var(--card-border)',
  cardShadow:    'var(--card-shadow)',
  text:          'var(--text)',
  textMuted:     'var(--text-muted)',
  textFaint:     'var(--text-faint)',
  accent:        'var(--accent)',
  accentSoft:    'var(--accent-soft)',
  accentText:    'var(--accent-text)',
  danger:        'var(--danger)',
  warn:          'var(--warn)',
  ok:            'var(--ok)',
  hover:         'var(--hover)',
  chipBg:        'var(--chip-bg)',
  chipText:      'var(--chip-text)',
  selectedBg:    'var(--selected-bg)',
  selectedText:  'var(--selected-text)',
} as const

export type CanvasBackground =
  | string
  | { gradient: string }
  | { texture: string; fallback?: string }

export type AmbientBlob = {
  color: string
  style: { top?: string; bottom?: string; left?: string; right?: string; width: number; height: number }
}

type ThemeTokens = {
  gradient: boolean
  glass: boolean
  dark: boolean
  canvas: string; canvasGradient?: string
  ambientBlobs?: AmbientBlob[]; gridColor?: string
  sidebar: string; sidebarBorder: string
  topbar: string; topbarBorder: string
  column: string; columnHeader: string; card: string; cardBorder: string; cardShadow: string
  text: string; textMuted: string; textFaint: string
  accent: string; accentSoft: string; accentText: string
  danger: string; warn: string; ok: string
  hover: string; chipBg: string; chipText: string
  selectedBg: string; selectedText: string
  canvasBackground?: CanvasBackground
}

export type ThemeName =
  | 'light' | 'midnight' | 'graphite' | 'ocean' | 'sunset' | 'forest'
  | 'indigo-night' | 'indigo-day'
  | 'emerald-night' | 'emerald-day'
  | 'ocean-night' | 'ocean-day'
  | 'violet-night' | 'violet-day'
  | 'sunset-night' | 'sunset-day'
  | 'rose-night' | 'rose-day'
  | 'steel-night' | 'steel-day'

export const THEMES: Record<ThemeName, ThemeTokens> = {
  light: {
    gradient: false, glass: false, dark: false,
    canvas:        '#f5f7fa', columnHeader: '#eef1f5',
    sidebar:       '#ffffff',
    sidebarBorder: '#e7eaef',
    topbar:        '#ffffff',
    topbarBorder:  '#e7eaef',
    column:        '#eef1f5',
    card:          '#ffffff',
    cardBorder:    '#e2e6ec',
    cardShadow:    '0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.03)',
    text:          '#0f172a',
    textMuted:     '#475569',
    textFaint:     '#94a3b8',
    accent:        '#2563eb',
    accentSoft:    '#dbeafe',
    accentText:    '#ffffff',
    danger:        '#dc2626',
    warn:          '#d97706',
    ok:            '#16a34a',
    hover:         '#f1f5f9',
    chipBg:        '#f1f5f9',
    chipText:      '#334155',
    selectedBg:    '#dbeafe',
    selectedText:  '#1d4ed8',
  },
  midnight: {
    gradient: false, glass: false, dark: true,
    canvas:        '#0f1117', columnHeader: '#1a2236',
    sidebar:       '#161b27',
    sidebarBorder: '#1e2533',
    topbar:        '#161b27',
    topbarBorder:  '#1e2533',
    column:        '#1a2236',
    card:          '#1e2a42',
    cardBorder:    '#253045',
    cardShadow:    '0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.2)',
    text:          '#e2e8f0',
    textMuted:     '#94a3b8',
    textFaint:     '#475569',
    accent:        '#3b82f6',
    accentSoft:    '#1e3a5f',
    accentText:    '#ffffff',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#4ade80',
    hover:         '#1e2a3d',
    chipBg:        '#253045',
    chipText:      '#94a3b8',
    selectedBg:    '#1e3a5f',
    selectedText:  '#60a5fa',
  },
  graphite: {
    gradient: false, glass: false, dark: true,
    canvas:        '#1a1a1a', columnHeader: '#2a2a2a',
    sidebar:       '#222222',
    sidebarBorder: '#2d2d2d',
    topbar:        '#222222',
    topbarBorder:  '#2d2d2d',
    column:        '#2a2a2a',
    card:          '#2f2f2f',
    cardBorder:    '#3a3a3a',
    cardShadow:    '0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.2)',
    text:          '#e4e4e7',
    textMuted:     '#a1a1aa',
    textFaint:     '#52525b',
    accent:        '#818cf8',
    accentSoft:    '#312e81',
    accentText:    '#ffffff',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#4ade80',
    hover:         '#333333',
    chipBg:        '#3a3a3a',
    chipText:      '#a1a1aa',
    selectedBg:    '#312e81',
    selectedText:  '#a5b4fc',
  },
  ocean: {
    gradient: false, glass: false, dark: true,
    canvas:        '#0a1628', columnHeader: '#112240',
    sidebar:       '#0d1f3c',
    sidebarBorder: '#162847',
    topbar:        '#0d1f3c',
    topbarBorder:  '#162847',
    column:        '#112240',
    card:          '#1a3358',
    cardBorder:    '#1e3d66',
    cardShadow:    '0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3)',
    text:          '#ccd6f6',
    textMuted:     '#8892b0',
    textFaint:     '#495670',
    accent:        '#64ffda',
    accentSoft:    '#0d3a2e',
    accentText:    '#0a1628',
    danger:        '#ff6b6b',
    warn:          '#ffd166',
    ok:            '#06d6a0',
    hover:         '#162847',
    chipBg:        '#1e3d66',
    chipText:      '#8892b0',
    selectedBg:    '#0d3a2e',
    selectedText:  '#64ffda',
    canvasBackground: {
      gradient: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0a2a4a 70%, #051020 100%)',
    },
  },
  sunset: {
    gradient: false, glass: false, dark: true,
    canvas:        '#1a0a0a', columnHeader: '#321414',
    sidebar:       '#2a1010',
    sidebarBorder: '#3d1a1a',
    topbar:        '#2a1010',
    topbarBorder:  '#3d1a1a',
    column:        '#321414',
    card:          '#3d1c1c',
    cardBorder:    '#4a2020',
    cardShadow:    '0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3)',
    text:          '#fde8d8',
    textMuted:     '#c4956a',
    textFaint:     '#7a5040',
    accent:        '#ff7043',
    accentSoft:    '#4a1a0a',
    accentText:    '#ffffff',
    danger:        '#ff5252',
    warn:          '#ffca28',
    ok:            '#69f0ae',
    hover:         '#3d1c1c',
    chipBg:        '#4a2020',
    chipText:      '#c4956a',
    selectedBg:    '#4a1a0a',
    selectedText:  '#ff8a65',
    canvasBackground: {
      gradient: 'linear-gradient(160deg, #1a0a0a 0%, #2a1005 30%, #3d1500 60%, #2a0a00 100%)',
    },
  },
  forest: {
    gradient: false, glass: false, dark: true,
    canvas:        '#0d1a0f', columnHeader: '#162819',
    sidebar:       '#122016',
    sidebarBorder: '#1a2e1e',
    topbar:        '#122016',
    topbarBorder:  '#1a2e1e',
    column:        '#162819',
    card:          '#1e3422',
    cardBorder:    '#253d28',
    cardShadow:    '0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3)',
    text:          '#d4e8d0',
    textMuted:     '#7aad80',
    textFaint:     '#3d6642',
    accent:        '#4caf50',
    accentSoft:    '#1a3d1e',
    accentText:    '#ffffff',
    danger:        '#ef5350',
    warn:          '#ffb74d',
    ok:            '#66bb6a',
    hover:         '#1e3422',
    chipBg:        '#253d28',
    chipText:      '#7aad80',
    selectedBg:    '#1a3d1e',
    selectedText:  '#81c784',
    canvasBackground: {
      gradient: 'linear-gradient(160deg, #0d1a0f 0%, #122016 35%, #0a1f0d 65%, #081508 100%)',
    },
  },

  // ── Premium glass themes ───────────────────────────────────────────────────

  'indigo-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#0a0d18', canvasGradient: 'linear-gradient(135deg,#0a0d18 0%,#0d1030 40%,#100d28 70%,#07091a 100%)',
    gridColor: 'rgba(99,102,241,.04)',
    ambientBlobs: [
      { color: 'rgba(99,102,241,.18)', style: { top: '-8%', left: '-5%', width: 480, height: 480 } },
      { color: 'rgba(139,92,246,.12)', style: { bottom: '10%', right: '-8%', width: 400, height: 400 } },
      { color: 'rgba(59,130,246,.08)', style: { top: '40%', left: '30%', width: 320, height: 320 } },
    ],
    sidebar: 'rgba(15,18,40,.72)', sidebarBorder: 'rgba(99,102,241,.15)',
    topbar: 'rgba(15,18,40,.72)', topbarBorder: 'rgba(99,102,241,.12)',
    column: 'rgba(20,24,54,.55)', columnHeader: 'rgba(99,102,241,.10)',
    card: 'rgba(26,30,64,.60)', cardBorder: 'rgba(99,102,241,.18)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(99,102,241,.12)',
    text: '#e0e7ff', textMuted: '#a5b4fc', textFaint: '#4f46e5',
    accent: '#6366f1', accentSoft: 'rgba(99,102,241,.18)', accentText: '#ffffff',
    danger: '#f87171', warn: '#fbbf24', ok: '#4ade80',
    hover: 'rgba(99,102,241,.10)', chipBg: 'rgba(99,102,241,.14)', chipText: '#a5b4fc',
    selectedBg: 'rgba(99,102,241,.22)', selectedText: '#c7d2fe',
  },
  'indigo-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f0f0ff', canvasGradient: 'linear-gradient(135deg,#f0f0ff 0%,#e8eaff 40%,#eceeff 70%,#f5f5ff 100%)',
    gridColor: 'rgba(99,102,241,.04)',
    ambientBlobs: [
      { color: 'rgba(99,102,241,.10)', style: { top: '-5%', right: '-5%', width: 400, height: 400 } },
      { color: 'rgba(139,92,246,.07)', style: { bottom: '5%', left: '-5%', width: 360, height: 360 } },
      { color: 'rgba(59,130,246,.05)', style: { top: '35%', right: '20%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(99,102,241,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(99,102,241,.10)',
    column: 'rgba(240,240,255,.70)', columnHeader: 'rgba(99,102,241,.08)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(99,102,241,.14)',
    cardShadow: '0 2px 8px rgba(99,102,241,.08), 0 1px 2px rgba(99,102,241,.05)',
    text: '#1e1b4b', textMuted: '#4338ca', textFaint: '#a5b4fc',
    accent: '#4f46e5', accentSoft: 'rgba(99,102,241,.12)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(99,102,241,.06)', chipBg: 'rgba(99,102,241,.08)', chipText: '#4338ca',
    selectedBg: 'rgba(99,102,241,.14)', selectedText: '#3730a3',
  },

  'emerald-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#080f10', canvasGradient: 'linear-gradient(135deg,#080f10 0%,#091510 40%,#071210 70%,#050c08 100%)',
    gridColor: 'rgba(16,185,129,.04)',
    ambientBlobs: [
      { color: 'rgba(16,185,129,.16)', style: { top: '-8%', right: '-5%', width: 460, height: 460 } },
      { color: 'rgba(5,150,105,.10)', style: { bottom: '8%', left: '-6%', width: 380, height: 380 } },
      { color: 'rgba(52,211,153,.07)', style: { top: '42%', right: '25%', width: 300, height: 300 } },
    ],
    sidebar: 'rgba(10,20,16,.72)', sidebarBorder: 'rgba(16,185,129,.14)',
    topbar: 'rgba(10,20,16,.72)', topbarBorder: 'rgba(16,185,129,.12)',
    column: 'rgba(12,26,20,.55)', columnHeader: 'rgba(16,185,129,.09)',
    card: 'rgba(16,36,28,.60)', cardBorder: 'rgba(16,185,129,.16)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(16,185,129,.10)',
    text: '#d1fae5', textMuted: '#6ee7b7', textFaint: '#059669',
    accent: '#10b981', accentSoft: 'rgba(16,185,129,.16)', accentText: '#ffffff',
    danger: '#f87171', warn: '#fbbf24', ok: '#34d399',
    hover: 'rgba(16,185,129,.09)', chipBg: 'rgba(16,185,129,.12)', chipText: '#6ee7b7',
    selectedBg: 'rgba(16,185,129,.20)', selectedText: '#a7f3d0',
  },
  'emerald-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#ecfdf5', canvasGradient: 'linear-gradient(135deg,#ecfdf5 0%,#e8fdf2 40%,#edfff6 70%,#f0fdf4 100%)',
    gridColor: 'rgba(16,185,129,.04)',
    ambientBlobs: [
      { color: 'rgba(16,185,129,.10)', style: { top: '-5%', left: '-5%', width: 400, height: 400 } },
      { color: 'rgba(5,150,105,.07)', style: { bottom: '5%', right: '-5%', width: 360, height: 360 } },
      { color: 'rgba(52,211,153,.05)', style: { top: '38%', left: '25%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(16,185,129,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(16,185,129,.10)',
    column: 'rgba(236,253,245,.70)', columnHeader: 'rgba(16,185,129,.07)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(16,185,129,.14)',
    cardShadow: '0 2px 8px rgba(16,185,129,.07), 0 1px 2px rgba(16,185,129,.04)',
    text: '#064e3b', textMuted: '#047857', textFaint: '#6ee7b7',
    accent: '#059669', accentSoft: 'rgba(16,185,129,.11)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(16,185,129,.06)', chipBg: 'rgba(16,185,129,.08)', chipText: '#047857',
    selectedBg: 'rgba(16,185,129,.13)', selectedText: '#065f46',
  },

  'ocean-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#060c14', canvasGradient: 'linear-gradient(135deg,#060c14 0%,#081420 40%,#060f1a 70%,#040810 100%)',
    gridColor: 'rgba(6,182,212,.04)',
    ambientBlobs: [
      { color: 'rgba(6,182,212,.16)', style: { top: '-6%', left: '-4%', width: 450, height: 450 } },
      { color: 'rgba(14,165,233,.10)', style: { bottom: '10%', right: '-6%', width: 380, height: 380 } },
      { color: 'rgba(34,211,238,.07)', style: { top: '38%', right: '22%', width: 310, height: 310 } },
    ],
    sidebar: 'rgba(8,18,32,.72)', sidebarBorder: 'rgba(6,182,212,.14)',
    topbar: 'rgba(8,18,32,.72)', topbarBorder: 'rgba(6,182,212,.12)',
    column: 'rgba(10,24,44,.55)', columnHeader: 'rgba(6,182,212,.09)',
    card: 'rgba(14,32,58,.60)', cardBorder: 'rgba(6,182,212,.16)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(6,182,212,.10)',
    text: '#cffafe', textMuted: '#67e8f9', textFaint: '#0e7490',
    accent: '#06b6d4', accentSoft: 'rgba(6,182,212,.16)', accentText: '#ffffff',
    danger: '#f87171', warn: '#fbbf24', ok: '#4ade80',
    hover: 'rgba(6,182,212,.09)', chipBg: 'rgba(6,182,212,.12)', chipText: '#67e8f9',
    selectedBg: 'rgba(6,182,212,.20)', selectedText: '#a5f3fc',
  },
  'ocean-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#ecfeff', canvasGradient: 'linear-gradient(135deg,#ecfeff 0%,#e8feff 40%,#edfeff 70%,#f0feff 100%)',
    gridColor: 'rgba(6,182,212,.04)',
    ambientBlobs: [
      { color: 'rgba(6,182,212,.10)', style: { top: '-5%', right: '-5%', width: 400, height: 400 } },
      { color: 'rgba(14,165,233,.07)', style: { bottom: '5%', left: '-5%', width: 360, height: 360 } },
      { color: 'rgba(34,211,238,.05)', style: { top: '38%', left: '22%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(6,182,212,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(6,182,212,.10)',
    column: 'rgba(236,254,255,.70)', columnHeader: 'rgba(6,182,212,.07)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(6,182,212,.14)',
    cardShadow: '0 2px 8px rgba(6,182,212,.07), 0 1px 2px rgba(6,182,212,.04)',
    text: '#164e63', textMuted: '#0e7490', textFaint: '#67e8f9',
    accent: '#0891b2', accentSoft: 'rgba(6,182,212,.11)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(6,182,212,.06)', chipBg: 'rgba(6,182,212,.08)', chipText: '#0e7490',
    selectedBg: 'rgba(6,182,212,.13)', selectedText: '#155e75',
  },

  'violet-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#0c0814', canvasGradient: 'linear-gradient(135deg,#0c0814 0%,#110d22 40%,#0e0a1c 70%,#08050f 100%)',
    gridColor: 'rgba(139,92,246,.04)',
    ambientBlobs: [
      { color: 'rgba(139,92,246,.18)', style: { top: '-8%', right: '-5%', width: 480, height: 480 } },
      { color: 'rgba(167,139,250,.10)', style: { bottom: '8%', left: '-6%', width: 400, height: 400 } },
      { color: 'rgba(109,40,217,.08)', style: { top: '40%', left: '28%', width: 320, height: 320 } },
    ],
    sidebar: 'rgba(18,12,36,.72)', sidebarBorder: 'rgba(139,92,246,.14)',
    topbar: 'rgba(18,12,36,.72)', topbarBorder: 'rgba(139,92,246,.12)',
    column: 'rgba(22,16,44,.55)', columnHeader: 'rgba(139,92,246,.10)',
    card: 'rgba(30,20,58,.60)', cardBorder: 'rgba(139,92,246,.18)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(139,92,246,.12)',
    text: '#ede9fe', textMuted: '#c4b5fd', textFaint: '#7c3aed',
    accent: '#8b5cf6', accentSoft: 'rgba(139,92,246,.18)', accentText: '#ffffff',
    danger: '#f87171', warn: '#fbbf24', ok: '#4ade80',
    hover: 'rgba(139,92,246,.10)', chipBg: 'rgba(139,92,246,.14)', chipText: '#c4b5fd',
    selectedBg: 'rgba(139,92,246,.22)', selectedText: '#ddd6fe',
  },
  'violet-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f5f3ff', canvasGradient: 'linear-gradient(135deg,#f5f3ff 0%,#f0ebff 40%,#f3f0ff 70%,#f8f6ff 100%)',
    gridColor: 'rgba(139,92,246,.04)',
    ambientBlobs: [
      { color: 'rgba(139,92,246,.10)', style: { top: '-5%', left: '-5%', width: 400, height: 400 } },
      { color: 'rgba(167,139,250,.07)', style: { bottom: '5%', right: '-5%', width: 360, height: 360 } },
      { color: 'rgba(109,40,217,.05)', style: { top: '38%', right: '20%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(139,92,246,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(139,92,246,.10)',
    column: 'rgba(245,243,255,.70)', columnHeader: 'rgba(139,92,246,.08)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(139,92,246,.14)',
    cardShadow: '0 2px 8px rgba(139,92,246,.08), 0 1px 2px rgba(139,92,246,.05)',
    text: '#2e1065', textMuted: '#6d28d9', textFaint: '#c4b5fd',
    accent: '#7c3aed', accentSoft: 'rgba(139,92,246,.12)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(139,92,246,.06)', chipBg: 'rgba(139,92,246,.08)', chipText: '#6d28d9',
    selectedBg: 'rgba(139,92,246,.14)', selectedText: '#4c1d95',
  },

  'sunset-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#120810', canvasGradient: 'linear-gradient(135deg,#120810 0%,#1e0c0a 40%,#180a0c 70%,#0e0608 100%)',
    gridColor: 'rgba(251,113,133,.04)',
    ambientBlobs: [
      { color: 'rgba(251,113,133,.16)', style: { top: '-6%', left: '-4%', width: 460, height: 460 } },
      { color: 'rgba(249,168,96,.10)', style: { bottom: '10%', right: '-6%', width: 380, height: 380 } },
      { color: 'rgba(244,63,94,.07)', style: { top: '40%', right: '22%', width: 310, height: 310 } },
    ],
    sidebar: 'rgba(24,10,14,.72)', sidebarBorder: 'rgba(251,113,133,.14)',
    topbar: 'rgba(24,10,14,.72)', topbarBorder: 'rgba(251,113,133,.12)',
    column: 'rgba(30,12,18,.55)', columnHeader: 'rgba(251,113,133,.09)',
    card: 'rgba(40,16,22,.60)', cardBorder: 'rgba(251,113,133,.16)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(251,113,133,.10)',
    text: '#ffe4e6', textMuted: '#fda4af', textFaint: '#be123c',
    accent: '#f43f5e', accentSoft: 'rgba(244,63,94,.16)', accentText: '#ffffff',
    danger: '#fca5a5', warn: '#fcd34d', ok: '#4ade80',
    hover: 'rgba(244,63,94,.09)', chipBg: 'rgba(244,63,94,.12)', chipText: '#fda4af',
    selectedBg: 'rgba(244,63,94,.20)', selectedText: '#fecdd3',
  },
  'sunset-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#fff1f2', canvasGradient: 'linear-gradient(135deg,#fff1f2 0%,#ffeced 40%,#ffeef0 70%,#fff4f5 100%)',
    gridColor: 'rgba(244,63,94,.04)',
    ambientBlobs: [
      { color: 'rgba(244,63,94,.09)', style: { top: '-5%', right: '-5%', width: 400, height: 400 } },
      { color: 'rgba(249,168,96,.07)', style: { bottom: '5%', left: '-5%', width: 360, height: 360 } },
      { color: 'rgba(251,113,133,.05)', style: { top: '38%', left: '22%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(244,63,94,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(244,63,94,.10)',
    column: 'rgba(255,241,242,.70)', columnHeader: 'rgba(244,63,94,.07)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(244,63,94,.14)',
    cardShadow: '0 2px 8px rgba(244,63,94,.07), 0 1px 2px rgba(244,63,94,.04)',
    text: '#4c0519', textMuted: '#be123c', textFaint: '#fda4af',
    accent: '#e11d48', accentSoft: 'rgba(244,63,94,.11)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(244,63,94,.06)', chipBg: 'rgba(244,63,94,.08)', chipText: '#be123c',
    selectedBg: 'rgba(244,63,94,.13)', selectedText: '#9f1239',
  },

  'rose-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#120a0e', canvasGradient: 'linear-gradient(135deg,#120a0e 0%,#1c0c14 40%,#160a10 70%,#0e0608 100%)',
    gridColor: 'rgba(236,72,153,.04)',
    ambientBlobs: [
      { color: 'rgba(236,72,153,.16)', style: { top: '-8%', right: '-5%', width: 480, height: 480 } },
      { color: 'rgba(168,85,247,.10)', style: { bottom: '10%', left: '-6%', width: 400, height: 400 } },
      { color: 'rgba(244,114,182,.08)', style: { top: '42%', right: '24%', width: 320, height: 320 } },
    ],
    sidebar: 'rgba(22,10,16,.72)', sidebarBorder: 'rgba(236,72,153,.14)',
    topbar: 'rgba(22,10,16,.72)', topbarBorder: 'rgba(236,72,153,.12)',
    column: 'rgba(28,12,20,.55)', columnHeader: 'rgba(236,72,153,.09)',
    card: 'rgba(36,16,26,.60)', cardBorder: 'rgba(236,72,153,.16)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(236,72,153,.10)',
    text: '#fce7f3', textMuted: '#f9a8d4', textFaint: '#9d174d',
    accent: '#ec4899', accentSoft: 'rgba(236,72,153,.16)', accentText: '#ffffff',
    danger: '#fca5a5', warn: '#fcd34d', ok: '#4ade80',
    hover: 'rgba(236,72,153,.09)', chipBg: 'rgba(236,72,153,.12)', chipText: '#f9a8d4',
    selectedBg: 'rgba(236,72,153,.20)', selectedText: '#fbcfe8',
  },
  'rose-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#fdf2f8', canvasGradient: 'linear-gradient(135deg,#fdf2f8 0%,#fdedf6 40%,#fdf0f7 70%,#fef5fb 100%)',
    gridColor: 'rgba(236,72,153,.04)',
    ambientBlobs: [
      { color: 'rgba(236,72,153,.09)', style: { top: '-5%', left: '-5%', width: 400, height: 400 } },
      { color: 'rgba(168,85,247,.06)', style: { bottom: '5%', right: '-5%', width: 360, height: 360 } },
      { color: 'rgba(244,114,182,.05)', style: { top: '38%', right: '20%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(236,72,153,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(236,72,153,.10)',
    column: 'rgba(253,242,248,.70)', columnHeader: 'rgba(236,72,153,.07)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(236,72,153,.14)',
    cardShadow: '0 2px 8px rgba(236,72,153,.07), 0 1px 2px rgba(236,72,153,.04)',
    text: '#500724', textMuted: '#9d174d', textFaint: '#f9a8d4',
    accent: '#db2777', accentSoft: 'rgba(236,72,153,.11)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(236,72,153,.06)', chipBg: 'rgba(236,72,153,.08)', chipText: '#9d174d',
    selectedBg: 'rgba(236,72,153,.13)', selectedText: '#831843',
  },

  'steel-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#090c10', canvasGradient: 'linear-gradient(135deg,#090c10 0%,#0d1218 40%,#0a0e14 70%,#06090d 100%)',
    gridColor: 'rgba(100,116,139,.04)',
    ambientBlobs: [
      { color: 'rgba(100,116,139,.14)', style: { top: '-8%', left: '-4%', width: 460, height: 460 } },
      { color: 'rgba(71,85,105,.09)', style: { bottom: '10%', right: '-6%', width: 380, height: 380 } },
      { color: 'rgba(148,163,184,.06)', style: { top: '40%', right: '24%', width: 310, height: 310 } },
    ],
    sidebar: 'rgba(12,16,22,.72)', sidebarBorder: 'rgba(100,116,139,.14)',
    topbar: 'rgba(12,16,22,.72)', topbarBorder: 'rgba(100,116,139,.12)',
    column: 'rgba(15,20,28,.55)', columnHeader: 'rgba(100,116,139,.09)',
    card: 'rgba(20,26,36,.60)', cardBorder: 'rgba(100,116,139,.16)',
    cardShadow: '0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(100,116,139,.10)',
    text: '#e2e8f0', textMuted: '#94a3b8', textFaint: '#334155',
    accent: '#64748b', accentSoft: 'rgba(100,116,139,.16)', accentText: '#ffffff',
    danger: '#f87171', warn: '#fbbf24', ok: '#4ade80',
    hover: 'rgba(100,116,139,.09)', chipBg: 'rgba(100,116,139,.12)', chipText: '#94a3b8',
    selectedBg: 'rgba(100,116,139,.20)', selectedText: '#cbd5e1',
  },
  'steel-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f1f5f9', canvasGradient: 'linear-gradient(135deg,#f1f5f9 0%,#edf1f7 40%,#eff3f8 70%,#f4f7fb 100%)',
    gridColor: 'rgba(100,116,139,.04)',
    ambientBlobs: [
      { color: 'rgba(100,116,139,.09)', style: { top: '-5%', right: '-5%', width: 400, height: 400 } },
      { color: 'rgba(71,85,105,.06)', style: { bottom: '5%', left: '-5%', width: 360, height: 360 } },
      { color: 'rgba(148,163,184,.04)', style: { top: '38%', left: '22%', width: 280, height: 280 } },
    ],
    sidebar: 'rgba(255,255,255,.80)', sidebarBorder: 'rgba(100,116,139,.12)',
    topbar: 'rgba(255,255,255,.80)', topbarBorder: 'rgba(100,116,139,.10)',
    column: 'rgba(241,245,249,.70)', columnHeader: 'rgba(100,116,139,.07)',
    card: 'rgba(255,255,255,.75)', cardBorder: 'rgba(100,116,139,.14)',
    cardShadow: '0 2px 8px rgba(100,116,139,.07), 0 1px 2px rgba(100,116,139,.04)',
    text: '#0f172a', textMuted: '#475569', textFaint: '#94a3b8',
    accent: '#475569', accentSoft: 'rgba(100,116,139,.11)', accentText: '#ffffff',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
    hover: 'rgba(100,116,139,.06)', chipBg: 'rgba(100,116,139,.08)', chipText: '#475569',
    selectedBg: 'rgba(100,116,139,.13)', selectedText: '#1e293b',
  },
}

function resolveCanvas(t: ThemeTokens): string {
  if (t.canvasGradient) return t.canvasGradient
  if (t.canvasBackground === undefined) return t.canvas
  if (typeof t.canvasBackground === 'string') return t.canvasBackground
  if ('gradient' in t.canvasBackground) return t.canvasBackground.gradient
  return t.canvasBackground.texture
}

export function applyTheme(name: ThemeName) {
  const t = THEMES[name]
  const r = document.documentElement
  r.style.setProperty('--canvas',         resolveCanvas(t))
  r.style.setProperty('--sidebar',        t.sidebar)
  r.style.setProperty('--sidebar-border', t.sidebarBorder)
  r.style.setProperty('--topbar',         t.topbar)
  r.style.setProperty('--topbar-border',  t.topbarBorder)
  r.style.setProperty('--column',         t.column)
  r.style.setProperty('--column-header',  t.columnHeader)
  r.style.setProperty('--card',           t.card)
  r.style.setProperty('--card-border',    t.cardBorder)
  r.style.setProperty('--card-shadow',    t.cardShadow)
  r.style.setProperty('--text',           t.text)
  r.style.setProperty('--text-muted',     t.textMuted)
  r.style.setProperty('--text-faint',     t.textFaint)
  r.style.setProperty('--accent',         t.accent)
  r.style.setProperty('--accent-soft',    t.accentSoft)
  r.style.setProperty('--accent-text',    t.accentText)
  r.style.setProperty('--danger',         t.danger)
  r.style.setProperty('--warn',           t.warn)
  r.style.setProperty('--ok',             t.ok)
  r.style.setProperty('--hover',          t.hover)
  r.style.setProperty('--chip-bg',        t.chipBg)
  r.style.setProperty('--chip-text',      t.chipText)
  r.style.setProperty('--selected-bg',    t.selectedBg)
  r.style.setProperty('--selected-text',  t.selectedText)
  r.style.setProperty('--grid-color',     t.gridColor ?? 'transparent')
  r.setAttribute('data-theme-glass',      t.glass ? '1' : '0')
  r.setAttribute('data-theme-dark',       t.dark  ? '1' : '0')
}

export const ICONS = {
  search:   'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM14 14l-3-3',
  plus:     'M8 3v10M3 8h10',
  filter:   'M2 4h12M4 8h8M6 12h4',
  sort:     'M3 5h10M5 9h8M7 13h6',
  grid:     'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z',
  list:     'M3 4h10M3 8h10M3 12h10',
  cal:      'M3 4h10v9H3zM3 6h10M6 2v3M10 2v3',
  timeline: 'M2 4h6M5 8h9M2 12h6',
  star:     'M8 2l1.7 3.6 3.8.4-2.9 2.7.9 3.9L8 10.6 4.5 12.6l.9-3.9L2.5 6l3.8-.4Z',
  chevron:  'M6 4l4 4-4 4',
  chevLeft: 'M10 4l-4 4 4 4',
  chevDown: 'M4 6l4 4 4-4',
  more:     'M3.5 8h.01M8 8h.01M12.5 8h.01',
  msg:      'M2.5 4.5h11v6h-3l-2.5 2-1-2H2.5z',
  attach:   'M11 5L6 10a2 2 0 0 0 2.8 2.8L13 8.5a3.5 3.5 0 0 0-5-5L4 7.5',
  check:    'M3 8l3.5 3.5L13 5',
  clock:    'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8 4.5V8l2.5 1.5',
  link:     'M7 9a2 2 0 0 0 2.8 0L12 6.8a2 2 0 0 0-2.8-2.8L8 5.2M9 7a2 2 0 0 0-2.8 0L4 9.2a2 2 0 0 0 2.8 2.8L8 10.8',
  user:     'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 14c.6-2.6 2.6-4 5-4s4.4 1.4 5 4',
  inbox:    'M2 8h4l1 2h2l1-2h4M2 8l1.5-4h9L14 8v5H2z',
  cog:      'M8 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8 1v2M8 13v2M3 8H1M15 8h-2M4.5 4.5L3 3M13 13l-1.5-1.5M4.5 11.5L3 13M13 3l-1.5 1.5',
  flag:     'M4 13V3M4 3h7l-1.5 2.5L11 8H4',
  trash:    'M3 5h10M5 5V3h6v2M6 8v4M10 8v4M4 5l1 8h6l1-8',
  sun:      'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1',
  moon:     'M12 12.5a6 6 0 0 1-6-10 6.5 6.5 0 1 0 6 10Z',
  palette:  'M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8ZM5 8h.01M8 5h.01M11 8h.01M8 11h.01',
  grip:     'M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01',
  logout:   'M10 3H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4M13 8H6M11 5l3 3-3 3',
  x:        'M4 4l8 8M12 4l-8 8',
  alert:    'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2ZM8 5.5v3.5M8 11h.01',
} as const

export type IconKey = keyof typeof ICONS

export type DensityName = 'compact' | 'comfortable' | 'spacious'

export interface DensityTokens {
  cardPad: number
  cardRadius: number
  cardGap: number
  cardFs: number
  cardLine: number
  metaFs: number
  columnPad: number
  columnGap: number
  avatarSize: number
  rowPad: number
}

export const DENSITY: Record<DensityName, DensityTokens> = {
  compact:     { cardPad: 8,  cardRadius: 6,  cardGap: 6,  cardFs: 12, cardLine: 1.35, metaFs: 11,   columnPad: 8,  columnGap: 12, avatarSize: 18, rowPad: 6  },
  comfortable: { cardPad: 12, cardRadius: 8,  cardGap: 8,  cardFs: 13, cardLine: 1.40, metaFs: 11.5, columnPad: 10, columnGap: 14, avatarSize: 20, rowPad: 8  },
  spacious:    { cardPad: 16, cardRadius: 10, cardGap: 10, cardFs: 14, cardLine: 1.45, metaFs: 12,   columnPad: 14, columnGap: 18, avatarSize: 22, rowPad: 10 },
}

// 24-swatch palette for column header colour picker (null = no colour / clear)
export const KB_COLORS: (string | null)[] = [
  null,
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e',
  '#64748b', '#374151', '#1e293b',
  '#78716c', '#a3a3a3', '#d4d4d4', '#fafafa', '#000000',
]

export function darkenHex(hex: string, t: number): string {
  const c = parseInt(hex.slice(1), 16)
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255
  const m = (x: number) => Math.round(x * (1 - t)).toString(16).padStart(2, '0')
  return '#' + m(r) + m(g) + m(b)
}
