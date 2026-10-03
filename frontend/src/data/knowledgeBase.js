// Sample knowledge-base documents for CoopConnect's chatbot.
//
// IMPORTANT — these are general-education summaries for a prototype, not a
// live legal database. They intentionally avoid stating specific deadlines,
// amounts, or eligibility cut-offs that change over time (the brief is
// explicit: never invent or state unverified deadlines/eligibility). Every
// entry points to the correct official source for anything time-sensitive.
// `lastUpdated` marks when this sample text was written, not when the
// underlying scheme/law was last changed — shown to the user as such.

export const KNOWLEDGE_BASE = [
  {
    id: 'pacs-loan-basics',
    topic: 'pacsLoan',
    category: 'loan',
    keywords: ['loan', 'pacs', 'credit', 'crop loan', 'kcc', 'interest', 'கடன்', 'ऋण'],
    source: 'NABARD & Ministry of Cooperation — general PACS structure',
    officialLink: 'https://www.pacsonline.in/',
    lastUpdated: '2026-01-15',
    summary: {
      en: 'A Primary Agricultural Credit Society (PACS) is a village-level cooperative that provides short-term crop loans and input credit to its farmer-members. To apply, you generally need active PACS membership, land records or tenancy proof, and a season-wise crop plan. Interest rates and subvention schemes change periodically — always confirm the current rate and any subsidy at your PACS branch or the NABARD/Ministry of Cooperation portal before relying on a figure.',
      hi: 'प्राथमिक कृषि साख समिति (PACS) एक ग्राम-स्तरीय सहकारी संस्था है जो अपने किसान-सदस्यों को अल्पकालिक फसल ऋण और इनपुट क्रेडिट प्रदान करती है। आवेदन के लिए आमतौर पर सक्रिय PACS सदस्यता, भूमि अभिलेख या पट्टा प्रमाण, और सीजन-वार फसल योजना चाहिए। ब्याज दरें और सब्सिडी योजनाएं समय-समय पर बदलती हैं — किसी भी आंकड़े पर भरोसा करने से पहले अपनी PACS शाखा या NABARD/सहकारिता मंत्रालय पोर्टल से वर्तमान दर की पुष्टि करें।',
      ta: 'முதன்மை வேளாண் கடன் சங்கம் (PACS) என்பது கிராம அளவிலான கூட்டுறவு அமைப்பாகும், இது தனது விவசாயி-உறுப்பினர்களுக்கு குறுகிய கால பயிர் கடன்கள் மற்றும் உள்ளீட்டுக் கடனை வழங்குகிறது. விண்ணப்பிக்க பொதுவாக செயலில் உள்ள PACS உறுப்பினர் பதிவு, நில பதிவுகள் அல்லது குத்தகை ஆதாரம், மற்றும் பருவகால பயிர் திட்டம் தேவை. வட்டி விகிதங்களும் மானிய திட்டங்களும் அவ்வப்போது மாறும் — எந்த எண்ணிக்கையையும் நம்புவதற்கு முன் உங்கள் PACS கிளையிலோ NABARD/கூட்டுறவு அமைச்சக போர்ட்டலிலோ தற்போதைய விகிதத்தை உறுதிப்படுத்தவும்.',
    },
  },
  {
    id: 'pmfby-overview',
    topic: 'pmfby',
    category: 'insurance',
    keywords: ['pmfby', 'crop insurance', 'insurance', 'premium', 'फसल बीमा', 'பயிர் காப்பீடு'],
    source: 'Pradhan Mantri Fasal Bima Yojana — official portal',
    officialLink: 'https://pmfby.gov.in/',
    lastUpdated: '2026-01-15',
    summary: {
      en: 'PMFBY (Pradhan Mantri Fasal Bima Yojana) is the national crop insurance scheme covering yield losses from natural causes — drought, flood, pest attack, and more — for notified crops in notified areas. Farmer premium shares are capped by crop type (typically low, single-digit percentages), with the rest subsidized. Enrolment windows, notified crops/areas, and cut-off dates vary by state and season and change each cycle — always check the current season\'s notification on pmfby.gov.in or with your bank/PACS before the sowing-season deadline, rather than relying on a remembered date.',
      hi: 'PMFBY (प्रधानमंत्री फसल बीमा योजना) राष्ट्रीय फसल बीमा योजना है जो अधिसूचित क्षेत्रों में अधिसूचित फसलों के लिए प्राकृतिक कारणों — सूखा, बाढ़, कीट प्रकोप आदि — से होने वाले उपज नुकसान को कवर करती है। किसान प्रीमियम हिस्सा फसल प्रकार के अनुसार सीमित होता है (आमतौर पर कम, एकल अंक प्रतिशत), शेष सब्सिडी दी जाती है। नामांकन विंडो, अधिसूचित फसलें/क्षेत्र, और कट-ऑफ तिथियां राज्य और सीजन के अनुसार बदलती हैं — किसी याद की गई तारीख पर भरोसा करने के बजाय हमेशा pmfby.gov.in या अपने बैंक/PACS से वर्तमान सीजन की अधिसूचना जांचें।',
      ta: 'PMFBY (பிரதம மந்திரி பசல் பீமா யோஜனா) என்பது தேசிய பயிர் காப்பீட்டுத் திட்டமாகும், இது அறிவிக்கப்பட்ட பகுதிகளில் அறிவிக்கப்பட்ட பயிர்களுக்கு இயற்கை காரணங்களால் — வறட்சி, வெள்ளம், பூச்சி தாக்குதல் போன்றவை — ஏற்படும் மகசூல் இழப்புகளை ஈடுசெய்கிறது. விவசாயி பிரீமியம் பங்கு பயிர் வகையால் வரம்பிடப்பட்டுள்ளது (பொதுவாக குறைவான, ஒற்றை இலக்க சதவீதம்), மீதமுள்ளவை மானியமாக வழங்கப்படும். பதிவு காலம், அறிவிக்கப்பட்ட பயிர்கள்/பகுதிகள், கடைசி தேதிகள் மாநிலம் மற்றும் பருவத்திற்கேற்ப மாறுபடும் — எப்போதும் pmfby.gov.in அல்லது உங்கள் வங்கி/PACS-இல் தற்போதைய பருவ அறிவிப்பை சரிபார்க்கவும்.',
    },
  },
  {
    id: 'member-rights',
    topic: 'memberRights',
    category: 'bylaws',
    keywords: ['rights', 'member', 'bylaws', 'vote', 'membership', 'अधिकार', 'உரிமைகள்'],
    source: 'Multi-State Cooperative Societies Act, 2002 — general provisions',
    officialLink: 'https://www.ncui.coop/',
    lastUpdated: '2026-01-15',
    summary: {
      en: 'Cooperative members generally have the right to: participate and vote in general body meetings, stand for elected office in the society, access the society\'s audited accounts and bylaws on request, receive dividends/patronage as per the society\'s bylaws, and raise grievances through the society\'s redressal process or the Registrar of Cooperative Societies. Exact provisions vary by each society\'s registered bylaws and applicable state cooperative act — ask your PACS for a copy of its bylaws for specifics.',
      hi: 'सहकारी सदस्यों को आमतौर पर ये अधिकार होते हैं: सामान्य निकाय बैठकों में भाग लेना और मतदान करना, समिति में निर्वाचित पद के लिए खड़ा होना, अनुरोध पर समिति के लेखा-परीक्षित खातों और उपनियमों तक पहुंच, समिति के उपनियमों के अनुसार लाभांश/संरक्षण प्राप्त करना, और समिति की शिकायत निवारण प्रक्रिया या सहकारी समिति रजिस्ट्रार के माध्यम से शिकायत उठाना। सटीक प्रावधान प्रत्येक समिति के पंजीकृत उपनियमों और लागू राज्य सहकारी अधिनियम के अनुसार भिन्न होते हैं — विवरण के लिए अपनी PACS से उपनियमों की प्रति मांगें।',
      ta: 'கூட்டுறவு உறுப்பினர்களுக்கு பொதுவாக பின்வரும் உரிமைகள் உள்ளன: பொதுக்குழு கூட்டங்களில் பங்கேற்று வாக்களிப்பது, சங்கத்தில் தேர்ந்தெடுக்கப்பட்ட பதவிக்கு நிற்பது, கோரிக்கையின் பேரில் சங்கத்தின் தணிக்கை செய்யப்பட்ட கணக்குகள் மற்றும் விதிமுறைகளை அணுகுவது, சங்கத்தின் விதிமுறைகளின்படி ஈவுத்தொகை பெறுவது, மற்றும் சங்கத்தின் குறை தீர்ப்பு செயல்முறை அல்லது கூட்டுறவு சங்கங்களின் பதிவாளர் மூலம் குறைகளை எழுப்புவது. சரியான விதிகள் ஒவ்வொரு சங்கத்தின் பதிவு செய்யப்பட்ட விதிமுறைகள் மற்றும் பொருந்தும் மாநில கூட்டுறவு சட்டத்தைப் பொறுத்து மாறுபடும் — விவரங்களுக்கு உங்கள் PACS-இல் விதிமுறைகளின் நகலைக் கேளுங்கள்.',
    },
  },
  {
    id: 'grievance-process',
    topic: 'grievanceProcess',
    category: 'other',
    keywords: ['grievance', 'complaint', 'redressal', 'escalate', 'शिकायत', 'புகார்'],
    source: 'Mitra grievance workflow (this app)',
    officialLink: null,
    lastUpdated: '2026-01-15',
    summary: {
      en: 'To raise a grievance in Mitra: go to "My Grievances" and file a new one with a category, your cooperative society, and a clear description — you\'ll get a reference ID immediately. An admin assigns it to a cooperative official, who reviews it and updates the status (Pending → Under Review → In Progress → Resolved/Rejected, or Escalated if it needs higher attention). You can track every update, with notes and timestamps, from the same screen — no need to visit an office to check status.',
      hi: 'Mitra में शिकायत दर्ज करने के लिए: "मेरी शिकायतें" पर जाएं और श्रेणी, अपनी सहकारी समिति, और स्पष्ट विवरण के साथ नई शिकायत दर्ज करें — आपको तुरंत एक संदर्भ आईडी मिल जाएगी। एक व्यवस्थापक इसे किसी सहकारी अधिकारी को सौंपता है, जो इसकी समीक्षा करता है और स्थिति अपडेट करता है (लंबित → समीक्षा में → प्रगति में → सुलझाया गया/अस्वीकृत, या यदि अधिक ध्यान की आवश्यकता हो तो बढ़ाया गया)। आप उसी स्क्रीन से हर अपडेट को नोट्स और टाइमस्टैम्प के साथ ट्रैक कर सकते हैं — स्थिति जांचने के लिए कार्यालय जाने की आवश्यकता नहीं।',
      ta: 'Mitra-இல் புகார் அளிக்க: "என் புகார்கள்" க்குச் சென்று வகை, உங்கள் கூட்டுறவு சங்கம், மற்றும் தெளிவான விவரத்துடன் புதிய புகாரை பதிவு செய்யவும் — உடனடியாக ஒரு குறிப்பு எண் கிடைக்கும். ஒரு நிர்வாகி அதை ஒரு கூட்டுறவு அதிகாரிக்கு ஒதுக்குகிறார், அவர் அதை மதிப்பாய்வு செய்து நிலையை புதுப்பிக்கிறார் (நிலுவையில் → மதிப்பாய்வில் → நடைபெறுகிறது → தீர்க்கப்பட்டது/நிராகரிக்கப்பட்டது, அல்லது அதிக கவனம் தேவைப்பட்டால் மேலிடம் தெரிவிக்கப்பட்டது). அதே திரையில் இருந்து குறிப்புகள் மற்றும் நேர முத்திரைகளுடன் ஒவ்வொரு புதுப்பிப்பையும் நீங்கள் கண்காணிக்கலாம் — நிலையை சரிபார்க்க அலுவலகம் செல்ல தேவையில்லை.',
    },
  },
  {
    id: 'financial-literacy-basics',
    topic: 'financialLiteracy',
    category: 'finance',
    keywords: ['savings', 'interest', 'budget', 'financial literacy', 'बचत', 'சேமிப்பு'],
    source: 'General financial literacy guidance (NABARD Financial Literacy Centres)',
    officialLink: 'https://www.nabard.org/',
    lastUpdated: '2026-01-15',
    summary: {
      en: 'A few general financial-literacy basics for cooperative members: (1) Keep farm income and household expenses in separate mental (or literal) accounts so loan repayment capacity is clear. (2) Compare the effective interest rate, not just the headline rate, when taking any loan — ask about processing fees. (3) Cooperative dividends are usually paid after the annual audit; ask your PACS when their audit typically closes. (4) Your nearest NABARD-supported Financial Literacy Centre (FLC) can give free, personalized guidance — this is general information, not financial advice for your specific situation.',
      hi: 'सहकारी सदस्यों के लिए कुछ सामान्य वित्तीय साक्षरता की बुनियादी बातें: (1) कृषि आय और घरेलू खर्च को अलग खातों में रखें ताकि ऋण चुकौती क्षमता स्पष्ट हो। (2) कोई भी ऋण लेते समय केवल हेडलाइन दर नहीं बल्कि प्रभावी ब्याज दर की तुलना करें — प्रोसेसिंग शुल्क के बारे में पूछें। (3) सहकारी लाभांश आमतौर पर वार्षिक ऑडिट के बाद भुगतान किया जाता है; अपनी PACS से पूछें कि उनका ऑडिट आमतौर पर कब बंद होता है। (4) आपका निकटतम NABARD-समर्थित वित्तीय साक्षरता केंद्र (FLC) मुफ्त, व्यक्तिगत मार्गदर्शन दे सकता है — यह सामान्य जानकारी है, आपकी विशिष्ट स्थिति के लिए वित्तीय सलाह नहीं।',
      ta: 'கூட்டுறவு உறுப்பினர்களுக்கான சில பொதுவான நிதி கல்வியறிவு அடிப்படைகள்: (1) விவசாய வருமானம் மற்றும் வீட்டு செலவுகளை தனித்தனியாக வைத்திருங்கள், இதனால் கடன் திருப்பிச் செலுத்தும் திறன் தெளிவாக இருக்கும். (2) எந்த கடன் வாங்கும்போதும் அறிவிக்கப்பட்ட விகிதம் மட்டுமல்ல, உண்மையான வட்டி விகிதத்தையும் ஒப்பிடுங்கள் — செயலாக்க கட்டணங்களைப் பற்றி கேளுங்கள். (3) கூட்டுறவு ஈவுத்தொகை பொதுவாக வருடாந்திர தணிக்கைக்குப் பிறகு வழங்கப்படும்; உங்கள் PACS-இல் அவர்களின் தணிக்கை பொதுவாக எப்போது முடிகிறது எனக் கேளுங்கள். (4) உங்கள் அருகிலுள்ள NABARD-ஆதரவு நிதி கல்வியறிவு மையம் (FLC) இலவச, தனிப்பட்ட வழிகாட்டுதலை வழங்கும் — இது பொதுவான தகவல், உங்கள் குறிப்பிட்ட சூழ்நிலைக்கான நிதி ஆலோசனை அல்ல.',
    },
  },
  {
    id: 'national-cooperative-policy-2025',
    topic: 'coopPolicy2025',
    category: 'bylaws',
    keywords: ['national cooperative policy', 'policy 2025', 'ministry of cooperation', 'सहकारी नीति', 'கூட்டுறவு கொள்கை'],
    source: 'Ministry of Cooperation — National Cooperative Policy, 2025 (summary)',
    officialLink: 'https://cooperation.gov.in/',
    lastUpdated: '2026-01-15',
    summary: {
      en: 'The National Cooperative Policy, 2025 sets a broad direction for strengthening India\'s cooperative sector — including PACS computerization and diversification into new services, better governance and transparency standards, and easier access to credit and markets for members. This is a general policy-direction summary for context, not a substitute for the official policy document — Mitra is an independent prototype and is not an official Ministry of Cooperation product.',
      hi: 'राष्ट्रीय सहकारी नीति, 2025 भारत के सहकारी क्षेत्र को मजबूत करने की व्यापक दिशा तय करती है — जिसमें PACS का कम्प्यूटरीकरण और नई सेवाओं में विविधीकरण, बेहतर शासन और पारदर्शिता मानक, और सदस्यों के लिए ऋण व बाजारों तक आसान पहुंच शामिल है। यह संदर्भ के लिए एक सामान्य नीति-दिशा सारांश है, आधिकारिक नीति दस्तावेज़ का विकल्प नहीं — Mitra एक स्वतंत्र प्रोटोटाइप है और सहकारिता मंत्रालय का आधिकारिक उत्पाद नहीं है।',
      ta: 'தேசிய கூட்டுறவு கொள்கை, 2025 இந்தியாவின் கூட்டுறவுத் துறையை வலுப்படுத்துவதற்கான பரந்த திசையை அமைக்கிறது — PACS கணினிமயமாக்கல் மற்றும் புதிய சேவைகளில் பன்முகப்படுத்துதல், சிறந்த நிர்வாகம் மற்றும் வெளிப்படைத்தன்மை தரநிலைகள், மற்றும் உறுப்பினர்களுக்கு கடன் மற்றும் சந்தைகளுக்கான எளிதான அணுகல் ஆகியவை அடங்கும். இது சூழலுக்கான ஒரு பொதுவான கொள்கை-திசை சுருக்கம், அதிகாரப்பூர்வ கொள்கை ஆவணத்திற்கு மாற்றாக அல்ல — Mitra ஒரு சுயாதீன முன்மாதிரி ஆகும், இது கூட்டுறவு அமைச்சகத்தின் அதிகாரப்பூர்வ தயாரிப்பு அல்ல.',
    },
  },
]

export function suggestedQuestions(language) {
  const byLang = {
    en: [
      'How do I apply for a PACS crop loan?',
      "What does PMFBY cover, and what's my premium share?",
      'What are my rights as a cooperative member?',
      'How do I check my grievance status?',
      'If adverse weather during the crop season causes the expected yield to fall below 50%, what support is available?',
      'After harvesting, how long can certain crop losses remain covered if the crop has to be dried in the field?',
      'How can computerisation make a local agricultural credit society faster and more transparent?',
    ],
    hi: [
      'मैं PACS फसल ऋण के लिए कैसे आवेदन करूं?',
      'PMFBY क्या कवर करता है, और मेरा प्रीमियम हिस्सा क्या है?',
      'एक सहकारी सदस्य के रूप में मेरे अधिकार क्या हैं?',
      'मैं अपनी शिकायत की स्थिति कैसे जांचूं?',
    ],
    ta: [
      'PACS பயிர் கடனுக்கு நான் எப்படி விண்ணப்பிப்பது?',
      'PMFBY எதை உள்ளடக்கியது, என் பிரீமியம் பங்கு என்ன?',
      'கூட்டுறவு உறுப்பினராக எனக்கு என்ன உரிமைகள் உள்ளன?',
      'என் புகார் நிலையை நான் எப்படி சரிபார்ப்பது?',
    ],
  }
  return byLang[language] || byLang.en
}