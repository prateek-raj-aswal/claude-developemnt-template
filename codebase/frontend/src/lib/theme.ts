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
    canvas:        '#f5f7fa', columnHeader: 'transparent',
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
    canvas:        '#0d1017', columnHeader: 'transparent',
    sidebar:       '#11141c',
    sidebarBorder: '#1f2330',
    topbar:        '#11141c',
    topbarBorder:  '#1f2330',
    column:        '#161a24',
    card:          '#1c2030',
    cardBorder:    '#262b3c',
    cardShadow:    '0 1px 0 rgba(255,255,255,.02) inset, 0 1px 2px rgba(0,0,0,.4)',
    text:          '#e6e8ee',
    textMuted:     '#9aa1b2',
    textFaint:     '#5c6478',
    accent:        '#818cf8',
    accentSoft:    '#312e81',
    accentText:    '#0d1017',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#34d399',
    hover:         '#1d2230',
    chipBg:        '#1d2230',
    chipText:      '#b8bdcc',
    selectedBg:    '#312e81',
    selectedText:  '#c7d2fe',
  },
  graphite: {
    gradient: false, glass: false, dark: true,
    canvas:        '#0f0f10', columnHeader: 'transparent',
    sidebar:       '#141416',
    sidebarBorder: '#23232a',
    topbar:        '#141416',
    topbarBorder:  '#23232a',
    column:        '#18181c',
    card:          '#1f1f24',
    cardBorder:    '#2a2a32',
    cardShadow:    '0 1px 0 rgba(255,255,255,.02) inset, 0 1px 2px rgba(0,0,0,.5)',
    text:          '#ededee',
    textMuted:     '#9c9ca3',
    textFaint:     '#5b5b62',
    accent:        '#f59e0b',
    accentSoft:    '#3a2c0a',
    accentText:    '#0f0f10',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#34d399',
    hover:         '#22222a',
    chipBg:        '#22222a',
    chipText:      '#c2c2ca',
    selectedBg:    '#3a2c0a',
    selectedText:  '#fcd34d',
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
    gradient: false, glass: false, dark: false,
    canvas:        '#f3f6f1', columnHeader: 'transparent',
    sidebar:       '#fafbf8',
    sidebarBorder: '#dde3d7',
    topbar:        '#fafbf8',
    topbarBorder:  '#dde3d7',
    column:        '#e7ede0',
    card:          '#ffffff',
    cardBorder:    '#d8dfd0',
    cardShadow:    '0 1px 2px rgba(20,40,20,.05), 0 1px 1px rgba(20,40,20,.03)',
    text:          '#1a2418',
    textMuted:     '#4f5d49',
    textFaint:     '#94a08c',
    accent:        '#2e7d4f',
    accentSoft:    '#d1ead9',
    accentText:    '#ffffff',
    danger:        '#b91c1c',
    warn:          '#a16207',
    ok:            '#166534',
    hover:         '#eaf0e3',
    chipBg:        '#eaf0e3',
    chipText:      '#3f4a3a',
    selectedBg:    '#d1ead9',
    selectedText:  '#15803d',
  },

  // ── Premium glass themes ───────────────────────────────────────────────────

  'indigo-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#0a0d18', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #0e1426 0%, #0a0d18 65%)',
    gridColor: 'rgba(124,156,255,0.04)',
    ambientBlobs: [
      { color: 'rgba(124,156,255,0.28)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(155,140,255,0.22)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.16)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(10,13,24,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(10,13,24,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#9b8cff', accentSoft: 'rgba(155,140,255,0.18)', accentText: '#0a0d18',
    danger: '#fb7185', warn: '#f5b78a', ok: '#5eead4',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(155,140,255,0.2)', selectedText: '#9b8cff',
  },
  'indigo-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#eef0f6', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #f7f8fc 0%, #eef0f6 65%)',
    gridColor: 'rgba(90,100,200,0.04)',
    ambientBlobs: [
      { color: 'rgba(124,156,255,0.55)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(155,140,255,0.45)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.40)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#6c5ce7', accentSoft: 'rgba(108,92,231,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#b86b3a', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(108,92,231,0.14)', selectedText: '#6c5ce7',
  },

  'emerald-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#07120d', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #0b1a13 0%, #07120d 65%)',
    gridColor: 'rgba(52,211,153,0.04)',
    ambientBlobs: [
      { color: 'rgba(52,211,153,0.26)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(94,234,212,0.20)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(163,230,53,0.14)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(7,18,13,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(7,18,13,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#5eead4', accentSoft: 'rgba(94,234,212,0.18)', accentText: '#07120d',
    danger: '#fb7185', warn: '#fbbf77', ok: '#34d399',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(94,234,212,0.2)', selectedText: '#5eead4',
  },
  'emerald-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#eaf4ee', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #f4faf6 0%, #eaf4ee 65%)',
    gridColor: 'rgba(5,150,105,0.04)',
    ambientBlobs: [
      { color: 'rgba(52,211,153,0.50)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(94,234,212,0.42)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(163,230,53,0.36)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#0d9488', accentSoft: 'rgba(13,148,136,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#b86b3a', ok: '#059669',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(13,148,136,0.14)', selectedText: '#0d9488',
  },

  'ocean-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#06101a', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #0a1626 0%, #06101a 65%)',
    gridColor: 'rgba(56,189,248,0.04)',
    ambientBlobs: [
      { color: 'rgba(56,189,248,0.26)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(129,140,248,0.20)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(45,212,191,0.16)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(6,16,26,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(6,16,26,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#818cf8', accentSoft: 'rgba(129,140,248,0.18)', accentText: '#06101a',
    danger: '#fb7185', warn: '#f5b78a', ok: '#38bdf8',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(129,140,248,0.2)', selectedText: '#818cf8',
  },
  'ocean-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#e9f1fa', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #f3f9fd 0%, #e9f1fa 65%)',
    gridColor: 'rgba(2,132,199,0.04)',
    ambientBlobs: [
      { color: 'rgba(56,189,248,0.50)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(129,140,248,0.42)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(45,212,191,0.40)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#4f46e5', accentSoft: 'rgba(79,70,229,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#b86b3a', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(79,70,229,0.14)', selectedText: '#4f46e5',
  },

  'violet-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#100a1a', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #160e26 0%, #100a1a 65%)',
    gridColor: 'rgba(167,139,250,0.04)',
    ambientBlobs: [
      { color: 'rgba(167,139,250,0.26)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(232,121,249,0.20)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.14)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(16,10,26,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(16,10,26,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#c084fc', accentSoft: 'rgba(192,132,252,0.18)', accentText: '#100a1a',
    danger: '#fb7185', warn: '#f5b78a', ok: '#5eead4',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(192,132,252,0.2)', selectedText: '#c084fc',
  },
  'violet-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f1ecf8', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #f9f5fd 0%, #f1ecf8 65%)',
    gridColor: 'rgba(124,58,237,0.04)',
    ambientBlobs: [
      { color: 'rgba(167,139,250,0.50)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(232,121,249,0.42)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.38)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#7c3aed', accentSoft: 'rgba(124,58,237,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#b86b3a', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(124,58,237,0.14)', selectedText: '#7c3aed',
  },

  'sunset-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#160d09', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #1d130d 0%, #160d09 65%)',
    gridColor: 'rgba(251,146,60,0.04)',
    ambientBlobs: [
      { color: 'rgba(251,146,60,0.24)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(251,113,133,0.20)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(245,183,138,0.16)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(22,13,9,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(22,13,9,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#fb7185', accentSoft: 'rgba(251,113,133,0.18)', accentText: '#160d09',
    danger: '#fb7185', warn: '#f59e0b', ok: '#5eead4',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(251,113,133,0.2)', selectedText: '#fb7185',
  },
  'sunset-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f8efe8', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #fdf7f2 0%, #f8efe8 65%)',
    gridColor: 'rgba(234,88,12,0.04)',
    ambientBlobs: [
      { color: 'rgba(251,146,60,0.50)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(251,113,133,0.42)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(245,183,138,0.40)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#e11d48', accentSoft: 'rgba(225,29,72,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#d97706', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(225,29,72,0.14)', selectedText: '#e11d48',
  },

  'rose-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#160a10', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #1f0e18 0%, #160a10 65%)',
    gridColor: 'rgba(244,114,182,0.04)',
    ambientBlobs: [
      { color: 'rgba(244,114,182,0.24)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(240,171,252,0.20)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(129,140,248,0.14)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(22,10,16,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(22,10,16,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#f0abfc', accentSoft: 'rgba(240,171,252,0.18)', accentText: '#160a10',
    danger: '#fb7185', warn: '#fbbf24', ok: '#5eead4',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(240,171,252,0.2)', selectedText: '#f0abfc',
  },
  'rose-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#f8ecf2', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #fdf4f8 0%, #f8ecf2 65%)',
    gridColor: 'rgba(225,29,72,0.04)',
    ambientBlobs: [
      { color: 'rgba(244,114,182,0.46)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(240,171,252,0.40)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(129,140,248,0.34)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#c026d3', accentSoft: 'rgba(192,38,211,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#d97706', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(192,38,211,0.14)', selectedText: '#c026d3',
  },

  'steel-night': {
    gradient: true, glass: true, dark: true,
    canvas: '#0b0e14', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #11151f 0%, #0b0e14 65%)',
    gridColor: 'rgba(148,163,184,0.04)',
    ambientBlobs: [
      { color: 'rgba(148,163,184,0.18)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(100,116,139,0.16)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.12)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(11,14,20,0.88)', sidebarBorder: 'rgba(255,255,255,0.08)',
    topbar: 'rgba(11,14,20,0.88)', topbarBorder: 'rgba(255,255,255,0.08)',
    column: 'rgba(255,255,255,0.045)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.07)', cardBorder: 'rgba(255,255,255,0.12)',
    cardShadow: '0 8px 24px -8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    text: 'rgba(247,248,255,0.96)', textMuted: 'rgba(220,225,245,0.62)', textFaint: 'rgba(200,210,235,0.28)',
    accent: '#94a3b8', accentSoft: 'rgba(148,163,184,0.18)', accentText: '#0b0e14',
    danger: '#fb7185', warn: '#f5b78a', ok: '#5eead4',
    hover: 'rgba(255,255,255,0.06)', chipBg: 'rgba(255,255,255,0.08)', chipText: 'rgba(220,225,245,0.70)',
    selectedBg: 'rgba(148,163,184,0.2)', selectedText: '#94a3b8',
  },
  'steel-day': {
    gradient: true, glass: true, dark: false,
    canvas: '#eef0f4', canvasGradient: 'radial-gradient(ellipse at 50% 0%, #f7f8fa 0%, #eef0f4 65%)',
    gridColor: 'rgba(71,85,105,0.04)',
    ambientBlobs: [
      { color: 'rgba(148,163,184,0.42)', style: { top: '-12%', left: '8%', width: 520, height: 520 } },
      { color: 'rgba(100,116,139,0.36)', style: { top: '20%', right: '-6%', width: 460, height: 460 } },
      { color: 'rgba(94,234,212,0.34)', style: { bottom: '-10%', left: '30%', width: 420, height: 420 } },
    ],
    sidebar: 'rgba(255,255,255,0.74)', sidebarBorder: 'rgba(20,30,70,0.08)',
    topbar: 'rgba(255,255,255,0.74)', topbarBorder: 'rgba(20,30,70,0.08)',
    column: 'rgba(255,255,255,0.52)', columnHeader: 'transparent',
    card: 'rgba(255,255,255,0.74)', cardBorder: 'rgba(20,30,70,0.08)',
    cardShadow: '0 4px 20px -4px rgba(20,30,70,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
    text: 'rgba(20,24,42,0.92)', textMuted: 'rgba(40,50,80,0.62)', textFaint: 'rgba(40,50,80,0.35)',
    accent: '#475569', accentSoft: 'rgba(71,85,105,0.12)', accentText: '#ffffff',
    danger: '#e11d48', warn: '#b86b3a', ok: '#0d9488',
    hover: 'rgba(255,255,255,0.52)', chipBg: 'rgba(255,255,255,0.52)', chipText: 'rgba(40,50,80,0.70)',
    selectedBg: 'rgba(71,85,105,0.14)', selectedText: '#475569',
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
