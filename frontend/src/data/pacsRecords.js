// Sample PACS directory. Structured as { state: { district: [records] } } so
// adding another state/district later is a data change, not a code change.
// All entries here are illustrative/demo data for Madurai, Tamil Nadu, and
// are labeled as such wherever shown — not a verified live directory.

export const PACS_RECORDS = {
  'Tamil Nadu': {
    Madurai: [
      {
        id: 'madurai-east',
        name: 'Madurai East PACS',
        address: 'Near Bus Stand, East Ward, Madurai, Tamil Nadu 625001',
        phone: '0452-2345001',
        services: ['Crop loans', 'PMFBY enrolment', 'Savings deposits', 'Fertilizer distribution'],
      },
      {
        id: 'madurai-west',
        name: 'Madurai West PACS',
        address: 'West Masi Street, Madurai, Tamil Nadu 625002',
        phone: '0452-2345002',
        services: ['Crop loans', 'Farm input supply', 'Gold loan against jewellery'],
      },
      {
        id: 'melur',
        name: 'Melur PACS',
        address: 'Main Road, Melur, Madurai District, Tamil Nadu 625106',
        phone: '04525-234501',
        services: ['Crop loans', 'PMFBY enrolment', 'Warehousing'],
      },
      {
        id: 'usilampatti',
        name: 'Usilampatti PACS',
        address: 'Market Road, Usilampatti, Madurai District, Tamil Nadu 625532',
        phone: '04543-234501',
        services: ['Crop loans', 'Savings deposits'],
      },
      {
        id: 'thirumangalam',
        name: 'Thirumangalam PACS',
        address: 'Bypass Road, Thirumangalam, Madurai District, Tamil Nadu 625706',
        phone: '04549-234501',
        services: ['Crop loans', 'PMFBY enrolment', 'Farm input supply'],
      },
    ],
  },
}

export function districtsFor(state) {
  return Object.keys(PACS_RECORDS[state] || {})
}

export function pacsFor(state, district) {
  return PACS_RECORDS[state]?.[district] || []
}

export function statesAvailable() {
  return Object.keys(PACS_RECORDS)
}
