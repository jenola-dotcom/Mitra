// Sample scheme data for the prototype. Deadlines/eligibility figures are
// intentionally left general — see each scheme's officialLink for the
// current, authoritative notification. lastUpdated marks when this sample
// text was written, not when the scheme itself last changed.

export const SCHEMES = [
  {
    id: 'pmfby',
    name: { en: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', hi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)', ta: 'பிரதம மந்திரி பசல் பீமா யோஜனா (PMFBY)' },
    category: 'insurance',
    description: {
      en: 'National crop insurance scheme covering yield losses from drought, flood, pest attack and other notified perils, for notified crops in notified areas.',
      hi: 'सूखा, बाढ़, कीट प्रकोप और अन्य अधिसूचित खतरों से होने वाले उपज नुकसान को कवर करने वाली राष्ट्रीय फसल बीमा योजना, अधिसूचित क्षेत्रों में अधिसूचित फसलों के लिए।',
      ta: 'வறட்சி, வெள்ளம், பூச்சி தாக்குதல் மற்றும் பிற அறிவிக்கப்பட்ட ஆபத்துகளால் ஏற்படும் மகசூல் இழப்புகளை ஈடுசெய்யும் தேசிய பயிர் காப்பீட்டுத் திட்டம்.',
    },
    eligibility: {
      en: 'Farmers (loanee and non-loanee) growing notified crops in notified areas during the notified season.',
      hi: 'अधिसूचित सीजन के दौरान अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले किसान (ऋणी और गैर-ऋणी)।',
      ta: 'அறிவிக்கப்பட்ட பருவத்தில் அறிவிக்கப்பட்ட பகுதிகளில் அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் விவசாயிகள் (கடன் பெற்றோர் மற்றும் பெறாதோர்).',
    },
    documents: ['Land record / tenancy proof', 'Bank account details', 'Aadhaar', 'Sowing certificate (for non-loanee farmers)'],
    steps: [
      'Check if your crop and area are notified for the current season on pmfby.gov.in.',
      'Loanee farmers: your bank/PACS usually enrolls you automatically unless you opt out.',
      'Non-loanee farmers: apply via your bank, PACS, CSC, or the PMFBY portal before the season cut-off.',
      'Report crop loss within the notified window using the app/portal or by informing your bank/insurer.',
    ],
    officialLink: 'https://pmfby.gov.in/',
    season: 'Kharif and Rabi (varies by crop/state)',
    lastUpdated: '2026-01-15',
  },
  {
    id: 'kcc',
    name: { en: 'Kisan Credit Card (KCC)', hi: 'किसान क्रेडिट कार्ड (KCC)', ta: 'கிசான் கிரெடிட் கார்டு (KCC)' },
    category: 'loan',
    description: {
      en: 'Provides farmers with timely access to short-term credit for crop production, post-harvest expenses, and allied activities, usually through PACS or a partner bank.',
      hi: 'PACS या भागीदार बैंक के माध्यम से किसानों को फसल उत्पादन, फसल कटाई के बाद के खर्च और संबद्ध गतिविधियों के लिए अल्पकालिक ऋण तक समय पर पहुंच प्रदान करता है।',
      ta: 'PACS அல்லது கூட்டாளர் வங்கி மூலம் விவசாயிகளுக்கு பயிர் உற்பத்தி, அறுவடைக்குப் பிந்தைய செலவுகள் மற்றும் தொடர்புடைய நடவடிக்கைகளுக்கான குறுகிய கால கடனை சரியான நேரத்தில் வழங்குகிறது.',
    },
    eligibility: {
      en: 'Farmers (owner-cultivators, tenant farmers, sharecroppers) and members of Joint Liability Groups / Self-Help Groups.',
      hi: 'किसान (स्वामी-कृषक, किरायेदार किसान, बटाईदार) और संयुक्त देयता समूह / स्वयं सहायता समूह के सदस्य।',
      ta: 'விவசாயிகள் (உரிமையாளர்-பயிரிடுபவர்கள், குத்தகை விவசாயிகள், பங்கு விவசாயிகள்) மற்றும் கூட்டு பொறுப்பு குழுக்கள் / சுய உதவிக் குழுக்களின் உறுப்பினர்கள்.',
    },
    documents: ['Identity & address proof', 'Land records', 'Passport-size photo'],
    steps: [
      'Visit your PACS or nearest bank branch with the required documents.',
      'Fill the KCC application form; the branch assesses your credit limit based on land holding and crop pattern.',
      'On approval, you receive a KCC (card or passbook) with a set credit limit, renewed periodically.',
    ],
    officialLink: 'https://www.nabard.org/',
    season: 'Year-round',
    lastUpdated: '2026-01-15',
  },
  {
    id: 'pacs-computerization',
    name: { en: 'PACS Computerization Scheme', hi: 'PACS कम्प्यूटरीकरण योजना', ta: 'PACS கணினிமயமாக்கல் திட்டம்' },
    category: 'membership',
    description: {
      en: 'A Ministry of Cooperation initiative to digitize PACS operations — membership records, loan accounts, and services — under a common national software, improving transparency and access.',
      hi: 'PACS संचालन — सदस्यता रिकॉर्ड, ऋण खाते और सेवाओं — को एक सामान्य राष्ट्रीय सॉफ्टवेयर के तहत डिजिटाइज़ करने की सहकारिता मंत्रालय की पहल, जिससे पारदर्शिता और पहुंच में सुधार होता है।',
      ta: 'PACS செயல்பாடுகளை — உறுப்பினர் பதிவுகள், கடன் கணக்குகள் மற்றும் சேவைகள் — ஒரு பொதுவான தேசிய மென்பொருளின் கீழ் டிஜிட்டல் மயமாக்கும் கூட்டுறவு அமைச்சகத்தின் முயற்சி.',
    },
    eligibility: {
      en: 'Applies at the PACS level (not individual application) — ask your society whether it has been onboarded yet.',
      hi: 'PACS स्तर पर लागू होता है (व्यक्तिगत आवेदन नहीं) — अपनी समिति से पूछें कि क्या इसे अभी तक शामिल किया गया है।',
      ta: 'PACS மட்டத்தில் பொருந்தும் (தனிப்பட்ட விண்ணப்பம் அல்ல) — உங்கள் சங்கம் இதுவரை இணைக்கப்பட்டுள்ளதா எனக் கேளுங்கள்.',
    },
    documents: [],
    steps: [
      'Ask your PACS branch if it has migrated to the common computerization software.',
      'Once migrated, member passbooks and loan records are typically available digitally.',
    ],
    officialLink: 'https://cooperation.gov.in/',
    season: 'Ongoing rollout',
    lastUpdated: '2026-01-15',
  },
]

export const SCHEME_CATEGORIES = ['all', 'insurance', 'loan', 'membership']
