// Centralized Tamil Nadu district list — the ONE source of truth for every
// district selector in the app (registration, grievance form, PACS finder,
// admin filters). Previously these were separate free-text `<input>` fields
// in Register.jsx and GrievanceForm.jsx, so a farmer could type "madurai",
// "Madurai Dt", or "மதுரை" for the same district — no two screens agreed,
// and PACS lookups against pacsRecords.js silently failed on any spelling
// that didn't exactly match. This file fixes that: everywhere a district is
// selected, it's chosen from this list, keyed by a stable `id`.
//
// Data: all 38 Tamil Nadu districts, current as of the 2019–20
// reorganization (the last change; Mayiladuthurai in 2020 was the most
// recent new district; no districts have been added or split since).
// Source: Government of Tamil Nadu / Wikipedia "List of districts of Tamil
// Nadu" (cross-checked 2026-09-29). Tamil names are the standard
// transliterated forms used in Tamil Nadu government documents.

export const TN_DISTRICTS = [
  { id: 'ariyalur', en: 'Ariyalur', ta: 'அரியலூர்' },
  { id: 'chengalpattu', en: 'Chengalpattu', ta: 'செங்கல்பட்டு' },
  { id: 'chennai', en: 'Chennai', ta: 'சென்னை' },
  { id: 'coimbatore', en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
  { id: 'cuddalore', en: 'Cuddalore', ta: 'கடலூர்' },
  { id: 'dharmapuri', en: 'Dharmapuri', ta: 'தர்மபுரி' },
  { id: 'dindigul', en: 'Dindigul', ta: 'திண்டுக்கல்' },
  { id: 'erode', en: 'Erode', ta: 'ஈரோடு' },
  { id: 'kallakurichi', en: 'Kallakurichi', ta: 'கள்ளக்குறிச்சி' },
  { id: 'kanchipuram', en: 'Kanchipuram', ta: 'காஞ்சிபுரம்' },
  { id: 'kanyakumari', en: 'Kanyakumari', ta: 'கன்னியாகுமரி' },
  { id: 'karur', en: 'Karur', ta: 'கரூர்' },
  { id: 'krishnagiri', en: 'Krishnagiri', ta: 'கிருஷ்ணகிரி' },
  { id: 'madurai', en: 'Madurai', ta: 'மதுரை' },
  { id: 'mayiladuthurai', en: 'Mayiladuthurai', ta: 'மயிலாடுதுறை' },
  { id: 'nagapattinam', en: 'Nagapattinam', ta: 'நாகப்பட்டினம்' },
  { id: 'namakkal', en: 'Namakkal', ta: 'நாமக்கல்' },
  { id: 'nilgiris', en: 'The Nilgiris', ta: 'நீலகிரி' },
  { id: 'perambalur', en: 'Perambalur', ta: 'பெரம்பலூர்' },
  { id: 'pudukkottai', en: 'Pudukkottai', ta: 'புதுக்கோட்டை' },
  { id: 'ramanathapuram', en: 'Ramanathapuram', ta: 'இராமநாதபுரம்' },
  { id: 'ranipet', en: 'Ranipet', ta: 'இராணிப்பேட்டை' },
  { id: 'salem', en: 'Salem', ta: 'சேலம்' },
  { id: 'sivaganga', en: 'Sivaganga', ta: 'சிவகங்கை' },
  { id: 'tenkasi', en: 'Tenkasi', ta: 'தென்காசி' },
  { id: 'thanjavur', en: 'Thanjavur', ta: 'தஞ்சாவூர்' },
  { id: 'theni', en: 'Theni', ta: 'தேனி' },
  { id: 'thoothukudi', en: 'Thoothukudi', ta: 'தூத்துக்குடி' },
  { id: 'tiruchirappalli', en: 'Tiruchirappalli', ta: 'திருச்சிராப்பள்ளி' },
  { id: 'tirunelveli', en: 'Tirunelveli', ta: 'திருநெல்வேலி' },
  { id: 'tirupathur', en: 'Tirupathur', ta: 'திருப்பத்தூர்' },
  { id: 'tiruppur', en: 'Tiruppur', ta: 'திருப்பூர்' },
  { id: 'tiruvallur', en: 'Tiruvallur', ta: 'திருவள்ளூர்' },
  { id: 'tiruvannamalai', en: 'Tiruvannamalai', ta: 'திருவண்ணாமலை' },
  { id: 'tiruvarur', en: 'Tiruvarur', ta: 'திருவாரூர்' },
  { id: 'vellore', en: 'Vellore', ta: 'வேலூர்' },
  { id: 'viluppuram', en: 'Viluppuram', ta: 'விழுப்புரம்' },
  { id: 'virudhunagar', en: 'Virudhunagar', ta: 'விருதுநகர்' },
]

if (TN_DISTRICTS.length !== 38) {
  // Guards against a future silent edit dropping/duplicating an entry —
  // this list makes an explicit, checkable claim ("all 38 districts").
  console.error(`TN_DISTRICTS should have 38 entries, has ${TN_DISTRICTS.length}`)
}

/** Display label for a district id in the given language, falling back to English. */
export function districtLabel(id, language = 'en') {
  const d = TN_DISTRICTS.find((x) => x.id === id)
  if (!d) return id || ''
  return d[language] || d.en
}

/** id -> English name, for legacy records/PACS data keyed by English name. */
export function districtEnglishName(id) {
  return TN_DISTRICTS.find((x) => x.id === id)?.en || id || ''
}