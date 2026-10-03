// Custom minimal 2D icons + illustrations (pure SVG, palette-locked to
// Main #0F766E, Secondary #22C55E, Accent #A3E635, Text #172033).
const wrap = (children, size = 24, cls = '') => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={cls} aria-hidden="true">{children}</svg>
)
const M = '#0F766E', S = '#22C55E', A = '#A3E635', T = '#172033'

export const WheatIcon = ({ size, className }) => wrap(<>
  <path d="M16 29V11" stroke={M} strokeWidth="2" strokeLinecap="round" />
  {[7, 12, 17].map((y) => (<g key={y}>
    <ellipse cx="11.5" cy={y + 1} rx="3.6" ry="1.9" transform={`rotate(-35 11.5 ${y + 1})`} fill={S} />
    <ellipse cx="20.5" cy={y + 1} rx="3.6" ry="1.9" transform={`rotate(35 20.5 ${y + 1})`} fill={A} stroke={M} strokeWidth=".6" />
  </g>))}
  <ellipse cx="16" cy="5" rx="2" ry="3.2" fill={S} />
</>, size, className)

export const SproutIcon = ({ size, className }) => wrap(<>
  <path d="M16 29V16" stroke={M} strokeWidth="2.2" strokeLinecap="round" />
  <path d="M16 17C16 10 10 7 4 8c0 6 5 10 12 9Z" fill={A} stroke={M} strokeWidth="1" />
  <path d="M16 15c0-6 5-9 12-8 0 6-5 10-12 8Z" fill={S} stroke={M} strokeWidth="1" />
  <path d="M9 29h14" stroke={M} strokeWidth="2.2" strokeLinecap="round" />
</>, size, className)

export const DropIcon = ({ size, className }) => wrap(<>
  <path d="M16 3C11 10 7 14.5 7 19a9 9 0 0 0 18 0c0-4.5-4-9-9-16Z" fill={M} />
  <path d="M12 20a4.5 4.5 0 0 0 3.5 4.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
</>, size, className)

export const SunIcon = ({ size, className }) => wrap(<>
  <circle cx="16" cy="16" r="6.5" fill={A} stroke={M} strokeWidth="1.2" />
  {Array.from({ length: 8 }).map((_, i) => (
    <line key={i} x1="16" y1="3" x2="16" y2="6.5" stroke={M} strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 16 16)`} />
  ))}
</>, size, className)

export const BarnIcon = ({ size, className }) => wrap(<>
  <path d="M3 14 16 5l13 9v14H3Z" fill={M} />
  <rect x="11" y="16" width="10" height="12" rx="1" fill="#F0FAF8" />
  <path d="M11 16l10 12M21 16 11 28" stroke={S} strokeWidth="1.6" />
</>, size, className)

export const ShieldIcon = ({ size, className }) => wrap(<>
  <path d="M16 3 5 7v8c0 7 4.5 11 11 14 6.5-3 11-7 11-14V7Z" fill={M} />
  <path d="m11 16 3.5 3.5L21.500 12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>, size, className)

export const CoinIcon = ({ size, className }) => wrap(<>
  <circle cx="16" cy="16" r="12" fill={A} stroke={M} strokeWidth="1.4" />
  <circle cx="16" cy="16" r="8.5" fill="none" stroke={M} strokeWidth="1.2" />
  <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="700" fill={T}>₹</text>
</>, size, className)

export const ScaleIcon = ({ size, className }) => wrap(<>
  <path d="M16 5v21M9 26h14" stroke={M} strokeWidth="2" strokeLinecap="round" />
  <path d="M6 9h20" stroke={M} strokeWidth="2" strokeLinecap="round" />
  <path d="M6 9 2.5 17a3.5 3.5 0 0 0 7 0Zm20 0-3.5 8a3.5 3.5 0 0 0 7 0Z" fill={S} stroke={M} strokeWidth="1" />
</>, size, className)

export const TractorIcon = ({ size, className }) => wrap(<>
  <rect x="14" y="7" width="11" height="10" rx="2" fill={S} />
  <rect x="3" y="12" width="14" height="7" rx="2" fill={M} />
  <circle cx="22" cy="22" r="6" fill={T} /><circle cx="22" cy="22" r="2.5" fill={A} />
  <circle cx="8" cy="23" r="3.5" fill={T} /><circle cx="8" cy="23" r="1.4" fill={A} />
</>, size, className)

// Navigation / UI glyphs (2D duotone)
export const NavGlyph = ({ name, className = 'h-5 w-5' }) => {
  const c = 'currentColor'
  const P = {
    dashboard: <><rect x="3" y="3" width="8" height="10" rx="2.2" fill={c} /><rect x="13" y="3" width="8" height="6" rx="2.2" fill={c} opacity=".45" /><rect x="13" y="11" width="8" height="10" rx="2.2" fill={c} /><rect x="3" y="15" width="8" height="6" rx="2.2" fill={c} opacity=".45" /></>,
    chat: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5Z" fill={c} opacity=".45" /><circle cx="9" cy="9.5" r="1.3" fill={c} /><circle cx="12.5" cy="9.5" r="1.3" fill={c} /><circle cx="16" cy="9.5" r="1.3" fill={c} /></>,
    scheme: <><path d="M6 3h8l5 5v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4.5A1.500 1.500 0 0 1 6 3Z" fill={c} opacity=".45" /><path d="M14 3v5h5" fill={c} /><rect x="8" y="12" width="8" height="1.6" rx=".8" fill={c} /><rect x="8" y="15.500" width="6" height="1.600" rx=".8" fill={c} /></>,
    pacs: <><path d="M12 2.500 3 7.500h18Z" fill={c} /><rect x="5" y="9.500" width="2.600" height="8" rx="1" fill={c} opacity=".55" /><rect x="10.700" y="9.500" width="2.600" height="8" rx="1" fill={c} opacity=".55" /><rect x="16.400" y="9.500" width="2.600" height="8" rx="1" fill={c} opacity=".55" /><rect x="3" y="18.800" width="18" height="2.400" rx="1.200" fill={c} /></>,
    grievance: <><circle cx="12" cy="12" r="9.500" fill={c} opacity=".4" /><rect x="11" y="6.500" width="2" height="7" rx="1" fill={c} /><circle cx="12" cy="16.800" r="1.300" fill={c} /></>,
    users: <><circle cx="9" cy="8.500" r="3.500" fill={c} /><path d="M2.500 19a6.500 6.500 0 0 1 13 0Z" fill={c} opacity=".5" /><circle cx="17" cy="9.500" r="2.800" fill={c} opacity=".6" /><path d="M16.500 14.200A5.500 5.500 0 0 1 21.500 19H17.500Z" fill={c} opacity=".35" /></>,
    logout: <><path d="M4 4.500A1.500 1.500 0 0 1 5.500 3H12v3H7v12h5v3H5.500A1.500 1.500 0 0 1 4 19.500Z" fill={c} opacity=".45" /><path d="M11 10.500h6V7l5 5-5 5v-3.500h-6Z" fill={c} /></>,
  }
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{P[name]}</svg>
}

export const MitraLogo = ({ size = 40 }) => (
  <span
    className="inline-flex items-center justify-center rounded-xl border border-[#0B5F59] shadow-soft"
    style={{ width: size, height: size, background: 'linear-gradient(135deg,#14958A,#0F766E)' }}
  >
    <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} aria-hidden="true">
      <path d="M16 28V15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 17C16 10 10 7 4 8c0 6 5 10 12 9Z" fill={A} />
      <path d="M16 15c0-6 5-9 12-8 0 6-5 10-12 8Z" fill={S} />
    </svg>
  </span>
)

export const QUICK_ICONS = [SproutIcon, ShieldIcon, ScaleIcon, BarnIcon, DropIcon, WheatIcon, CoinIcon, TractorIcon]

export function FarmerScene({ className = '' }) {
  return (
    <svg viewBox="0 0 480 300" className={className} role="img" aria-label="Farmer in a field">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8F5F3" /><stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A3E635" stopOpacity=".55" /><stop offset="1" stopColor="#22C55E" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14958A" /><stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="480" height="300" rx="22" fill="url(#sky)" stroke="#C6D3DA" strokeWidth="1.5" />
      <circle cx="384" cy="70" r="30" fill="#A3E635" />
      <circle cx="384" cy="70" r="46" fill="#A3E635" opacity=".2" />
      <g fill="#fff" stroke="#D3DFE4"><ellipse cx="92" cy="62" rx="36" ry="11" /><ellipse cx="250" cy="96" rx="28" ry="9" /></g>
      <path d="M0 190C90 150 170 168 260 180s160-18 220-34v154H0Z" fill="url(#hill1)" />
      <path d="M0 240C110 205 210 232 300 224s130-18 180-8v84H0Z" fill="url(#hill2)" />
      <g stroke="#0B5F59" strokeWidth="3" strokeLinecap="round" opacity=".4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${40 + i * 70} 296 L${150 + i * 45} 240`} />)}
      </g>
      <g transform="translate(46 138)">
        <path d="M0 40 40 6l40 34v40H0Z" fill="#0F766E" />
        <rect x="28" y="46" width="24" height="34" rx="2" fill="#F0FAF8" />
        <path d="M28 46l24 34M52 46 28 80" stroke="#22C55E" strokeWidth="2.5" />
      </g>
      <g transform="translate(300 116)">
        <g className="origin-bottom animate-sway" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
          <rect x="18" y="72" width="16" height="58" rx="7" fill="#172033" />
          <rect x="40" y="72" width="16" height="58" rx="7" fill="#243049" />
          <rect x="10" y="30" width="54" height="56" rx="20" fill="#fff" stroke="#0F766E" strokeWidth="2" />
          <path d="M20 44h34v42H20Z" fill="#22C55E" opacity=".9" />
          <circle cx="37" cy="18" r="17" fill="#E8B08C" />
          <ellipse cx="37" cy="6" rx="34" ry="8" fill="#A3E635" stroke="#0F766E" strokeWidth="1.5" />
          <path d="M18 6a19 17 0 0 1 38 0Z" fill="#BCEB5F" />
          <circle cx="31" cy="20" r="1.8" fill="#172033" /><circle cx="43" cy="20" r="1.8" fill="#172033" />
          <path d="M31 27q6 5 12 0" stroke="#172033" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 50c14-6 20-24 18-46" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M78 4c-8 2-12 8-12 14 8-1 13-6 12-14Z" fill="#22C55E" />
        </g>
      </g>
    </svg>
  )
}

// ---- Additional 2D art glyphs (voice / attachments / status) -------------
// Kept as named exports so any component importing them keeps working.
const art = (children) => ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">{children}</svg>
)

export const MicArt = art(<>
  <rect x="11" y="3" width="10" height="17" rx="5" fill={M} />
  <path d="M7 15a9 9 0 0 0 18 0" stroke={M} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  <path d="M16 24v4M11 28h10" stroke={M} strokeWidth="2.2" strokeLinecap="round" />
  <rect x="14" y="7" width="4" height="2.4" rx="1.2" fill={A} />
</>)

export const MicIcon = MicArt

export const SpeakerArt = art(<>
  <path d="M4 12h5l7-6v20l-7-6H4Z" fill={M} />
  <path d="M20 11a7 7 0 0 1 0 10M23.500 7.500a12 12 0 0 1 0 17" stroke={S} strokeWidth="2.2" fill="none" strokeLinecap="round" />
</>)

export const StopArt = art(<>
  <circle cx="16" cy="16" r="12" fill={M} />
  <rect x="11" y="11" width="10" height="10" rx="2" fill="#fff" />
</>)

export const SendArt = art(<>
  <path d="M4 15.500 28 5 20 27l-5-9Z" fill={M} />
  <path d="M15 18 28 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
</>)

export const AttachArt = art(<>
  <path d="M22 11 12 21a3.500 3.500 0 0 1-5-5L17 6a5.500 5.500 0 0 1 8 8L15 24" stroke={M} strokeWidth="2.400" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>)

export const CameraArt = art(<>
  <path d="M4 10h5l2-3h10l2 3h5v16H4Z" fill={M} />
  <circle cx="16" cy="17" r="5" fill="#fff" /><circle cx="16" cy="17" r="2.200" fill={S} />
</>)

export const PinArt = art(<>
  <path d="M16 29C10 21 7 17 7 12.500a9 9 0 0 1 18 0C25 17 22 21 16 29Z" fill={M} />
  <circle cx="16" cy="12.500" r="3.500" fill="#fff" />
</>)

export const DocArt = art(<>
  <path d="M8 3h11l6 6v20H8Z" fill="#F0FAF8" stroke={M} strokeWidth="1.8" strokeLinejoin="round" />
  <path d="M19 3v6h6" fill={A} stroke={M} strokeWidth="1.400" />
  <path d="M12 16h9M12 20h9M12 24h6" stroke={M} strokeWidth="1.800" strokeLinecap="round" />
</>)

export const CheckArt = art(<>
  <circle cx="16" cy="16" r="12" fill={S} />
  <path d="m10.500 16.500 4 4L22 12" stroke="#fff" strokeWidth="2.800" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>)

export const WarnArt = art(<>
  <path d="M16 4 29 27H3Z" fill={A} stroke={M} strokeWidth="1.600" strokeLinejoin="round" />
  <path d="M16 12v7" stroke={T} strokeWidth="2.400" strokeLinecap="round" /><circle cx="16" cy="23" r="1.400" fill={T} />
</>)

export const GlobeArt = art(<>
  <circle cx="16" cy="16" r="12" fill="#F0FAF8" stroke={M} strokeWidth="1.800" />
  <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke={M} strokeWidth="1.600" />
  <path d="M4 16h24M6 10h20M6 22h20" stroke={S} strokeWidth="1.400" />
</>)

// ---- Banners / avatars (accept className + size; extra props ignored) ------
export function HarvestBanner({ className = '' }) {
  return (
    <svg viewBox="0 0 480 120" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Harvest fields">
      <defs>
        <linearGradient id="hb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0FAF8" /><stop offset="1" stopColor="#F7FCE8" />
        </linearGradient>
      </defs>
      <rect width="480" height="120" fill="url(#hb-bg)" />
      <circle cx="420" cy="34" r="20" fill={A} /><circle cx="420" cy="34" r="32" fill={A} opacity=".2" />
      <path d="M0 82C80 62 160 72 240 78s160-14 240-20v62H0Z" fill={S} opacity=".45" />
      <path d="M0 100C100 84 200 98 300 94s130-10 180-4v30H0Z" fill={M} />
      <g stroke="#0B5F59" strokeWidth="2" strokeLinecap="round" opacity=".35">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${20 + i * 60} 118 L${60 + i * 50} 98`} />)}
      </g>
      <g transform="translate(40 40)">
        <path d="M16 40V14" stroke={M} strokeWidth="2.400" strokeLinecap="round" />
        {[14, 22, 30].map((y) => (
          <g key={y}>
            <ellipse cx="9" cy={y} rx="6" ry="3" transform={`rotate(-35 9 ${y})`} fill={S} />
            <ellipse cx="23" cy={y} rx="6" ry="3" transform={`rotate(35 23 ${y})`} fill={A} stroke={M} strokeWidth=".8" />
          </g>
        ))}
        <ellipse cx="16" cy="8" rx="3" ry="6" fill={S} />
      </g>
    </svg>
  )
}

export const BotArt = art(<>
  <rect x="5" y="9" width="22" height="17" rx="6" fill={M} />
  <path d="M16 9V4" stroke={M} strokeWidth="2.200" strokeLinecap="round" /><circle cx="16" cy="4" r="2" fill={A} />
  <circle cx="12" cy="17" r="2.400" fill="#fff" /><circle cx="20" cy="17" r="2.400" fill="#fff" />
  <path d="M12 22h8" stroke={A} strokeWidth="2" strokeLinecap="round" />
</>)

export const SparkleArt = art(<>
  <path d="M16 3c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" fill={S} stroke={M} strokeWidth="1.200" />
  <path d="M25 21c.5 3 1.500 4 4 4.500-2.500.5-3.500 1.500-4 4-.5-2.500-1.500-3.500-4-4 2.500-.5 3.500-1.500 4-4.500Z" fill={A} />
</>)

export const UserArt = art(<>
  <circle cx="16" cy="11" r="6" fill={M} />
  <path d="M4 29a12 12 0 0 1 24 0Z" fill={S} stroke={M} strokeWidth="1.200" />
</>)
