export const GRIEVANCE_CATEGORIES = [
  { value: 'loan', labelKey: 'grievance.categoryLoan' },
  { value: 'membership', labelKey: 'grievance.categoryMembership' },
  { value: 'insurance', labelKey: 'grievance.categoryInsurance' },
  { value: 'bylaws', labelKey: 'grievance.categoryBylaws' },
  { value: 'finance', labelKey: 'grievance.categoryFinance' },
  { value: 'other', labelKey: 'grievance.categoryOther' },
]

// Ordered so the timeline / status pipeline reads naturally. "escalated" and
// "rejected" are terminal-ish side branches, not steps 5 and 6 of a line.
export const GRIEVANCE_STATUSES = [
  { value: 'pending', labelKey: 'grievance.statusPending', accent: 'clay' },
  { value: 'under_review', labelKey: 'grievance.statusUnderReview', accent: 'sky' },
  { value: 'in_progress', labelKey: 'grievance.statusInProgress', accent: 'sun' },
  { value: 'resolved', labelKey: 'grievance.statusResolved', accent: 'leaf' },
  { value: 'rejected', labelKey: 'grievance.statusRejected', accent: 'alert' },
  { value: 'escalated', labelKey: 'grievance.statusEscalated', accent: 'clay' },
]

export function statusMeta(value) {
  return GRIEVANCE_STATUSES.find((s) => s.value === value) || GRIEVANCE_STATUSES[0]
}

// Sample/seed data only — clearly labeled wherever shown. Kept configurable:
// any state/district can be added here without code changes elsewhere.
export const SAMPLE_PACS_SOCIETIES = {
  'Tamil Nadu': {
    Madurai: [
      'Madurai East PACS',
      'Madurai West PACS',
      'Melur PACS',
      'Usilampatti PACS',
      'Thirumangalam PACS',
    ],
  },
}

export function pacsSocietiesFor(state, district) {
  return SAMPLE_PACS_SOCIETIES?.[state]?.[district] || []
}

export const MAX_ATTACHMENT_BYTES = 500 * 1024 // 500 KB
