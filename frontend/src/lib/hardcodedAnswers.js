// Verified, source-linked answers for specific questions. Checked before the
// normal chat pipeline; every other question goes through the usual backend.

const BASE = import.meta.env.BASE_URL || '/'

const PMFBY_PDF_NAME = 'Revamped Operational Guidelines_17th August 2020.pdf'
const PMFBY_PDF_URL = `${BASE}${encodeURIComponent(PMFBY_PDF_NAME)}`

// Official Ministry of Cooperation page on PACS computerisation.
const MOC_PACS_URL = 'https://www.cooperation.gov.in/en/computerization-pacs-1'

const norm = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s%]/g, ' ').replace(/\s+/g, ' ').trim()

const ENTRIES = [
  {
    questions: [
      'If adverse weather during the crop season causes the expected yield to fall below 50%, what support is available?',
      'If adverse weather during the crop season reduces the expected yield below 50%, what support does PMFBY provide?',
    ],
    text:
      'According to PMFBY, the Mid-Season Adversity add-on coverage provides immediate relief to insured farmers when adverse seasonal conditions are likely to reduce expected yield below 50% of normal yield.',
    source: `${PMFBY_PDF_NAME} — Page 15, Section 5.2.2`,
    officialLink: `${PMFBY_PDF_URL}#page=15`,
    linkLabel: 'View Source → Page 15',
  },
  {
    questions: [
      'After harvesting, how long can certain crop losses remain covered if the crop has to be dried in the field?',
    ],
    text:
      'According to PMFBY, post-harvest loss coverage is available for a maximum period of two weeks from harvesting, subject to the specified crop and covered perils.',
    source: `${PMFBY_PDF_NAME} — Page 15, Section 5.2.3`,
    officialLink: `${PMFBY_PDF_URL}#page=15`,
    linkLabel: 'View Source → Page 15',
  },
  {
    questions: [
      'How can computerisation make a local agricultural credit society faster and more transparent?',
      'How can computerization make a local agricultural credit society faster and more transparent?',
    ],
    text:
      'According to the Ministry of Cooperation, the PACS computerisation project uses common ERP software to improve efficiency, enable faster loan disbursal, reduce transaction costs, improve accounting and strengthen transparency.',
    source: 'Uniform Software for PACS — Ministry of Cooperation — Page 1',
    officialLink: MOC_PACS_URL,
    linkLabel: 'View Source → Page 1',
  },
]

const LOOKUP = new Map()
ENTRIES.forEach((e) => e.questions.forEach((q) => LOOKUP.set(norm(q), e)))

export function findHardcodedAnswer(message) {
  const e = LOOKUP.get(norm(message || ''))
  if (!e) return null
  return {
    text: e.text,
    source: e.source,
    officialLink: e.officialLink,
    linkLabel: e.linkLabel,
    lastUpdated: null,
    mode: 'official',
    inRequestedLanguage: true,
  }
}