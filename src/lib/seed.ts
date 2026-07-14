import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { SERVICES } from "@/lib/constants";

const U = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const HOUSE_IMG = [
  "1564013799919-ab600027ffc6",
  "1568605114967-8130f3a36994",
  "1512917774080-9991f1c4c750",
  "1600596542815-ffad4c1539a9",
  "1613490493576-7fde63acd811",
  "1505691938895-1758d7feb511",
  "1564540583246-934409427776",
  "1600210492486-724fe5c67fb0",
  "1600585154340-be6161a56a0c",
  "1600607687939-ce8a6c25118c",
  "1600566753086-00f18fb6b3ea",
  "1600585154526-990dced4db0d",
  "1583608205776-bfd35f0d9f83",
  "1600047509807-ba8f99d2cdde",
  "1600573472550-8090b5e0745e",
  "1502672260266-1c1ef2d93688",
  "1493809842364-78817add7ffb",
  "1484154218962-a197022b58a8",
];

export async function runSeed() {
  // Wipe (order matters for FKs)
  await Promise.all([
    db.auditLog.deleteMany(),
    db.contactSubmission.deleteMany(),
    db.testimonial.deleteMany(),
    db.inspection.deleteMany(),
    db.lead.deleteMany(),
    db.customer.deleteMany(),
    db.property.deleteMany(),
    db.blogPost.deleteMany(),
    db.service.deleteMany(),
  ]);
  await db.user.deleteMany();
  await db.agent.deleteMany();
  await db.suburb.deleteMany();
  await db.siteSettings.deleteMany();

  // Admin user
  const adminPass = await hashPassword("admin123");

  // === Login Accounts ===
  // 3 accounts: Tarush (Developer — coding features + all access),
  // Ravi (Admin — full access), Govinder (Staff/Agent — limited access).

  // 1. Tarush Moudgill — Developer account (full access + coding features)
  const tarushUser = await db.user.create({
    data: {
      email: "tarush@a1vision.com.au",
      passwordHash: adminPass,
      name: "Tarush Moudgill",
      role: "DEVELOPER",
      avatar: "",
    },
  });

  // 2. Ravi Kumar — Admin account (full access)
  const admin = await db.user.create({
    data: {
      email: "admin@a1vision.com.au",
      passwordHash: adminPass,
      name: "Ravi Kumar",
      role: "ADMIN",
      avatar: "",
    },
  });

  // 3. Govinder Kumar — Staff account (limited access)
  const govinderUser = await db.user.create({
    data: {
      email: "govinder@a1vision.com.au",
      passwordHash: adminPass,
      name: "Govinder Kumar",
      role: "AGENT",
      avatar: "",
    },
  });

  // Suburbs
  const suburbsData = [
    { name: "Toorak", state: "VIC", postcode: "3142", medianPrice: 4650000, medianRent: 1500, growthRate: 8.2, population: 12900, image: U("1564013799919-ab600027ffc6"), lifestyle: "Melbourne's most prestigious address — grand mansions, tree-lined boulevards and elite schools.", amenities: ["Toorak Village","Fawkner Park","Yarra River trails","Toorak Primary School","Como Centre"], demographics: { medianAge: 41, ownerOccupier: 68, renter: 32, families: 54, professionals: 64 } },
    { name: "South Yarra", state: "VIC", postcode: "3141", medianPrice: 1850000, medianRent: 880, growthRate: 6.8, population: 25150, image: U("1512917774080-9991f1c4c750"), lifestyle: "Glamorous shopping, dining and nightlife along Chapel Street and Commercial Road.", amenities: ["Chapel Street","The Como Centre","Fawkner Park","South Yarra Station","Royal Botanic Gardens"], demographics: { medianAge: 32, ownerOccupier: 45, renter: 55, families: 35, professionals: 70 } },
    { name: "Brighton", state: "VIC", postcode: "3186", medianPrice: 2950000, medianRent: 1100, growthRate: 7.5, population: 23400, image: U("1568605114967-8130f3a36994"), lifestyle: "Bayside prestige with the iconic Brighton Bathing Boxes and golden sandy beaches.", amenities: ["Brighton Beach","Dendy Street Beach","Church Street village","Brighton Golf Course","Brighton Beach Railway"], demographics: { medianAge: 39, ownerOccupier: 67, renter: 33, families: 53, professionals: 60 } },
    { name: "Fitzroy", state: "VIC", postcode: "3065", medianPrice: 1320000, medianRent: 720, growthRate: 6.2, population: 10850, image: U("1512917774080-9991f1c4c750"), lifestyle: "Melbourne's creative heart — street art, Brunswick Street cafés and a thriving arts scene.", amenities: ["Brunswick Street","Smith Street","Edinburgh Gardens","Fitzroy Town Hall","Gertrude Street"], demographics: { medianAge: 31, ownerOccupier: 40, renter: 60, families: 28, professionals: 72 } },
    { name: "Kew", state: "VIC", postcode: "3101", medianPrice: 2450000, medianRent: 920, growthRate: 6.9, population: 24600, image: U("1600596542815-ffad4c1539a9"), lifestyle: "Leafy family enclave with prestigious schools, river parklands and period homes.", amenities: ["Yarra Bend Park","Kew Junction","Xavier College","Studley Park Boathouse","Tram 48 to CBD"], demographics: { medianAge: 38, ownerOccupier: 70, renter: 30, families: 55, professionals: 62 } },
    { name: "Port Melbourne", state: "VIC", postcode: "3207", medianPrice: 1680000, medianRent: 850, growthRate: 7.1, population: 17600, image: U("1505691938895-1758d7feb511"), lifestyle: "Bayside apartment living with beachfront promenades and a vibrant café culture.", amenities: ["Port Melbourne Beach","Bay Street precinct","Beacon Cove","Station Pier","Tram 109 to CBD"], demographics: { medianAge: 35, ownerOccupier: 52, renter: 48, families: 42, professionals: 66 } },
    { name: "Southbank", state: "VIC", postcode: "3006", medianPrice: 980000, medianRent: 620, growthRate: 8.9, population: 18900, image: U("1600210492486-724fe5c67fb0"), lifestyle: "High-rise riverfront living next to the arts precinct, Crown and the MCG.", amenities: ["Yarra River","Crown Casino","Arts Centre Melbourne","National Gallery","Tram direct to CBD"], demographics: { medianAge: 31, ownerOccupier: 38, renter: 62, families: 30, professionals: 68 } },
    { name: "Carlton", state: "VIC", postcode: "3053", medianPrice: 1280000, medianRent: 700, growthRate: 5.8, population: 16700, image: U("1600585154340-be6161a56a0c"), lifestyle: "Historic Italian quarter with Lygon Street dining, Carlton Gardens and Melbourne Uni nearby.", amenities: ["Lygon Street","Carlton Gardens","Royal Exhibition Building","Melbourne Museum","University of Melbourne"], demographics: { medianAge: 29, ownerOccupier: 42, renter: 58, families: 31, professionals: 71 } },
  ];
  const suburbs = await Promise.all(
    suburbsData.map((s) => db.suburb.create({ data: { ...s, description: s.lifestyle + " A sought-after address with strong long-term demand.", demographics: JSON.stringify(s.demographics), amenities: JSON.stringify(s.amenities), featured: ["Toorak","Brighton","South Yarra"].includes(s.name) } }))
  );
  const suburbByName = Object.fromEntries(suburbs.map((s) => [s.name, s]));

  // Agents — one of each role: Govinder (Principal agent), Ravi (Regional Manager + admin user), Tarush (Programmer & Designer).
  const agentsData = [
    { key: "govinder-principal", name: "Govinder Kumar", title: "Principal", bio: "Govinder founded A1 Vision Real Estate with a vision for a modern, transparent agency. As Principal, he oversees strategy, client relationships and the overall direction of the firm, bringing a steady hand and sharp negotiation skills to every major transaction.", photo: "", email: "govinder@a1vision.com.au", phone: "+61 411 001 001", specialisations: "Strategy,Prestige Sales,Leadership", suburbs: "Toorak,Kew,Brighton", yearsExperience: 1, soldCount: 0, totalSalesValue: 0, rating: 0, languages: "English,Hindi,Punjabi" },
    { key: "ravi-regional", name: "Ravi Kumar", title: "Regional Manager", bio: "As Regional Manager, Ravi coordinates operations across Melbourne western suburbs and inner-east. He supports the sales team, manages vendor relationships and ensures every campaign runs smoothly from appraisal to settlement.", photo: "/agents/ravi-kumar.png", email: "ravi@a1vision.com.au", phone: "+61 411 001 002", specialisations: "Operations,Sales Management,Auctions", suburbs: "South Yarra,Port Melbourne,Southbank", yearsExperience: 1, soldCount: 0, totalSalesValue: 0, rating: 0, languages: "English,Hindi,Punjabi" },
    { key: "tarush-designer", name: "Tarush Moudgill", title: "Programmer & Designer", bio: "Tarush is the creative and technical engine behind A1 Vision Real Estate. He designs and builds the digital experience — from the website and branding to marketing campaigns and property presentations — ensuring every listing looks polished and performs flawlessly.", photo: "", email: "tarush@a1vision.com.au", phone: "+61 411 001 003", specialisations: "Web Development,UI/UX Design,Marketing Campaigns", suburbs: "Fitzroy,Carlton,South Yarra", yearsExperience: 1, soldCount: 0, totalSalesValue: 0, rating: 0, languages: "English,Hindi,Punjabi" },
  ];
  const agents = await Promise.all(
    agentsData.map(({ key, ...rest }) => db.agent.create({ data: rest }))
  );
  const agentByKey = Object.fromEntries(
    agentsData.map((a, i) => [a.key, agents[i]])
  );

  // Link existing user accounts to agents (update agentId on the users created above)
  await db.user.update({ where: { id: govinderUser.id }, data: { agentId: agentByKey["govinder-principal"].id, avatar: "" } });
  await db.user.update({ where: { id: admin.id }, data: { agentId: agentByKey["ravi-regional"].id, avatar: "" } });
  await db.user.update({ where: { id: tarushUser.id }, data: { agentId: agentByKey["tarush-designer"].id, avatar: "" } });
  const agentUsers = [tarushUser, admin, govinderUser];
  // Tarush Moudgill (Programmer & Designer) — used as author of market-analysis blog posts.
  const tarushUserId = tarushUser.id;

  // Properties
  const props = [
    { title: "Architectural Garden Residence", address: "12 Hopetoun Road", suburbName: "Toorak", price: 5250000, priceDisplay: "$5,250,000", listingType: "SALE", propertyType: "House", beds: 5, baths: 4, cars: 3, land: 812, building: 420, agentKey: "govinder-principal", featured: true, desc: "Commanding sweeping garden district views, this architect-designed residence spans three levels of refined living. Floor-to-ceiling glass, curated landscaping and a lap pool define this prestige offering.", features: ["Garden views","Lap pool","Home theatre","Wine cellar","Smart home","Double garage","Ducted AC"], images: [HOUSE_IMG[4], HOUSE_IMG[0], HOUSE_IMG[12], HOUSE_IMG[8]] },
    { title: "Bayview Penthouse with Panorama", address: "8/ Esplanade", suburbName: "Brighton", price: 3850000, priceDisplay: "$3,850,000", listingType: "SALE", propertyType: "Penthouse", beds: 3, baths: 3, cars: 2, land: 0, building: 240, agentKey: "ravi-regional", featured: true, desc: "A rare penthouse directly opposite Brighton Beach. Wraparound terrace, designer interiors and a private rooftop plunge pool deliver the ultimate bayside lifestyle.", features: ["Bay views","Private plunge pool","Wraparound terrace","Concierge","Secure parking","Ducted AC"], images: [HOUSE_IMG[15], HOUSE_IMG[8], HOUSE_IMG[13], HOUSE_IMG[10]] },
    { title: "Victorian Charm Meets Modern Luxury", address: "45 Commercial Road", suburbName: "South Yarra", price: 1850000, priceDisplay: "$1,850,000", listingType: "SALE", propertyType: "Terrace", beds: 4, baths: 2, cars: 1, land: 210, building: 195, agentKey: "ravi-regional", featured: true, desc: "Beautifully restored Victorian terrace with a striking rear extension. Soaring skylights, oak floors and a north-facing courtyard make this a turnkey inner-city home.", features: ["Heritage facade","Skylights","North courtyard","Open-plan kitchen","Fireplace","Off-street parking"], images: [HOUSE_IMG[16], HOUSE_IMG[13], HOUSE_IMG[2], HOUSE_IMG[14]] },
    { title: "Contemporary Family Haven", address: "28 Riverdale Road", suburbName: "Kew", price: 2450000, priceDisplay: "$2,450,000", listingType: "SALE", propertyType: "House", beds: 5, baths: 3, cars: 2, land: 720, building: 310, agentKey: "govinder-principal", featured: false, desc: "Designed for family living, this light-filled home offers zoned living, a chef's kitchen and a resort-style garden with pool — all moments from village shops and elite schools.", features: ["Swimming pool","Garden","Chef's kitchen","Zoned living","Study","Solar panels","Double garage"], images: [HOUSE_IMG[1], HOUSE_IMG[9], HOUSE_IMG[11], HOUSE_IMG[7]] },
    { title: "Sun-Drenched Bayview Apartment", address: "23/ Beach Road", suburbName: "Port Melbourne", price: 1620000, priceDisplay: "$1,620,000", listingType: "SALE", propertyType: "Apartment", beds: 2, baths: 2, cars: 1, land: 0, building: 110, agentKey: "govinder-principal", featured: false, desc: "Wake to the sound of the bay in this beautifully renovated beachside apartment. Cross-ventilation, plantation shutters and a generous balcony capture the best of bayside living.", features: ["Bay views","Renovated","Balcony","Secure parking","Storage cage","Walk to tram"], images: [HOUSE_IMG[5], HOUSE_IMG[10], HOUSE_IMG[8]] },
    { title: "Investment-Grade Unit with Strong Yield", address: "6/ Brunswick Street", suburbName: "Fitzroy", price: 820000, priceDisplay: "$820,000", listingType: "SALE", propertyType: "Apartment", beds: 2, baths: 1, cars: 1, land: 0, building: 88, agentKey: "tarush-designer", featured: false, desc: "A solid investment in one of Melbourne's most sought-after postcodes. Currently tenanted at $720pw, this unit offers strong yield and future growth potential.", features: ["Tenanted","Walk to transport","Renovated kitchen","Internal laundry","Body corp $650pq"], images: [HOUSE_IMG[13], HOUSE_IMG[2], HOUSE_IMG[17]] },
    { title: "Garden Apartment Steps to Fawkner Park", address: "4/ Domain Road", suburbName: "South Yarra", price: 1280000, priceDisplay: "$1,280,000", listingType: "SALE", propertyType: "Apartment", beds: 3, baths: 2, cars: 1, land: 0, building: 130, agentKey: "ravi-regional", featured: false, desc: "A rare ground-floor apartment with private garden access. Generous proportions, period detailing and a short stroll to Fawkner Park make this an exceptional opportunity.", features: ["Private garden","Period details","Renovated bathroom","Walk to park","Off-street parking"], images: [HOUSE_IMG[14], HOUSE_IMG[8], HOUSE_IMG[11]] },
    { title: "Luxury Villa with Resort Gardens", address: "17 New Street", suburbName: "Brighton", price: 4100000, priceDisplay: "$4,100,000", listingType: "AUCTION", propertyType: "Villa", beds: 4, baths: 3, cars: 2, land: 560, building: 280, agentKey: "govinder-principal", featured: true, desc: "Auction Saturday 11am. Tropical resort gardens frame this architecturally designed villa. Bi-fold doors open to a heated pool, creating seamless indoor-outdoor flow.", features: ["Heated pool","Tropical gardens","Bi-fold doors","Wine room","Smart home","Auction 11am Sat"], images: [HOUSE_IMG[0], HOUSE_IMG[12], HOUSE_IMG[9], HOUSE_IMG[6]] },
    { title: "Brand New Off-the-Plan Residence", address: "2/ Southbank Boulevard", suburbName: "Southbank", price: 985000, priceDisplay: "$985,000", listingType: "NEW", propertyType: "Apartment", beds: 3, baths: 2, cars: 2, land: 0, building: 125, agentKey: "tarush-designer", featured: false, desc: "Be the first to live in this brand-new residence in the heart of Southbank. Premium finishes, residents' gym and rooftop terrace with city views.", features: ["Brand new","Residents' gym","Rooftop terrace","City views","Concierge","Double parking"], images: [HOUSE_IMG[8], HOUSE_IMG[13], HOUSE_IMG[7]] },
    { title: "Terrace with Skyline City Views", address: "61 Gertrude Street", suburbName: "Fitzroy", price: 1680000, priceDisplay: "$1,680,000", listingType: "SALE", propertyType: "Townhouse", beds: 4, baths: 3, cars: 1, land: 180, building: 210, agentKey: "ravi-regional", featured: false, desc: "A striking conversion with rooftop terrace capturing city skyline views. Industrial-chic finishes, three living zones and a walk-to-everywhere location.", features: ["City views","Rooftop terrace","Industrial chic","3 living zones","Walk to transport"], images: [HOUSE_IMG[2], HOUSE_IMG[17], HOUSE_IMG[14]] },
    { title: "Prestige Riverside Estate", address: "5 Yarra Boulevard", suburbName: "Kew", price: 8900000, priceDisplay: "$8,900,000", listingType: "OFFMARKET", propertyType: "House", beds: 6, baths: 5, cars: 4, land: 1240, building: 680, agentKey: "govinder-principal", featured: true, desc: "An exclusive off-market opportunity. Direct Yarra River frontage with private boathouse, infinity pool and interiors by a renowned designer. Genuine expressions of interest invited.", features: ["River frontage","Private boathouse","Infinity pool","Designer interiors","Cellar","6 bedrooms","Off-market"], images: [HOUSE_IMG[4], HOUSE_IMG[0], HOUSE_IMG[12], HOUSE_IMG[9]] },
    { title: "Rental: Fully Furnished Cityview Pad", address: "11 Power Street", suburbName: "Southbank", price: 1350, priceDisplay: "$1,350 / week", listingType: "RENT", propertyType: "Apartment", beds: 2, baths: 2, cars: 1, land: 0, building: 95, agentKey: "tarush-designer", featured: false, desc: "Fully furnished and available now. Generous two-bedroom apartment with city glimpses, resort pool in complex and moments to the river and tram.", features: ["Furnished","Pool in complex","City glimpses","Available now","Secure parking","Pet friendly"], images: [HOUSE_IMG[8], HOUSE_IMG[11], HOUSE_IMG[13]] },
    { title: "Rental: Family Home with Garden", address: "33 Studley Avenue", suburbName: "Kew", price: 1450, priceDisplay: "$1,450 / week", listingType: "RENT", propertyType: "House", beds: 4, baths: 2, cars: 2, land: 510, building: 240, agentKey: "tarush-designer", featured: false, desc: "Spacious family home available for a long lease. Polished floors, north-facing garden, and walking distance to elite schools and parklands.", features: ["Garden","Long lease available","Polished floors","Ducted AC","Pet negotiable","Double garage"], images: [HOUSE_IMG[1], HOUSE_IMG[9], HOUSE_IMG[7]] },
    { title: "Rental: Stylish Fitzroy Pad", address: "9 Smith Street", suburbName: "Fitzroy", price: 780, priceDisplay: "$780 / week", listingType: "RENT", propertyType: "Apartment", beds: 2, baths: 1, cars: 0, land: 0, building: 78, agentKey: "tarush-designer", featured: false, desc: "Stylish one-bathroom apartment in the heart of Fitzroy. Exposed brick, modern kitchen and steps from Brunswick Street's vibrant scene.", features: ["Exposed brick","Modern kitchen","Walk to Brunswick St","Furnished optional","Internal laundry"], images: [HOUSE_IMG[14], HOUSE_IMG[2], HOUSE_IMG[17]] },
    { title: "Sold: Record-Setting Terrace Sale", address: "72 Lygon Street", suburbName: "Carlton", price: 2150000, priceDisplay: "$2,150,000", listingType: "SOLD", propertyType: "Terrace", beds: 4, baths: 2, cars: 1, land: 200, building: 205, agentKey: "ravi-regional", featured: false, desc: "Sold prior to auction for a Carlton street record. A testament to our campaign strategy and vendor preparation.", features: ["Sold prior to auction","Street record","Fully renovated"], images: [HOUSE_IMG[16], HOUSE_IMG[13], HOUSE_IMG[14]] },
    { title: "Sold: Bayview Penthouse", address: "5/ Esplanade", suburbName: "Brighton", price: 4450000, priceDisplay: "$4,450,000", listingType: "SOLD", propertyType: "Penthouse", beds: 3, baths: 3, cars: 2, land: 0, building: 250, agentKey: "govinder-principal", featured: false, desc: "Sold under the hammer for $4.45M — $450k above reserve. A standout auction result.", features: ["Sold at auction","Above reserve","Bay panorama"], images: [HOUSE_IMG[5], HOUSE_IMG[8], HOUSE_IMG[10]] },
    { title: "Sold: Prestige Toorak Estate", address: "21 Albany Road", suburbName: "Toorak", price: 7800000, priceDisplay: "$7,800,000", listingType: "SOLD", propertyType: "House", beds: 5, baths: 4, cars: 3, land: 980, building: 540, agentKey: "govinder-principal", featured: false, desc: "Sold off-market within 14 days. Discreet, premium and record-setting.", features: ["Off-market sale","14 days","Prestige estate"], images: [HOUSE_IMG[4], HOUSE_IMG[0], HOUSE_IMG[12]] },
    { title: "New Release: Boutique Collection of 12", address: "100 Clarendon Street", suburbName: "Southbank", price: 720000, priceDisplay: "From $720,000", listingType: "PROJECT", propertyType: "Apartment", beds: 2, baths: 2, cars: 1, land: 0, building: 95, agentKey: "tarush-designer", featured: true, desc: "Stage 1 now selling. A boutique collection of 12 apartments with shared rooftop, ground-floor retail and walk-to-tram convenience. Architecturally designed with premium inclusions.", features: ["Stage 1 selling","Rooftop terrace","Walk to tram","Premium finishes","Stamp duty savings","10-year warranty"], images: [HOUSE_IMG[8], HOUSE_IMG[13], HOUSE_IMG[7], HOUSE_IMG[6]] },
  ];

  for (const p of props) {
    const suburb = suburbByName[p.suburbName];
    const agent = agentByKey[p.agentKey];
    const slug = p.address.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + suburb.postcode;
    await db.property.create({
      data: {
        title: p.title,
        slug,
        description: p.desc,
        address: p.address,
        suburbId: suburb.id,
        price: p.price,
        priceDisplay: p.priceDisplay,
        listingType: p.listingType,
        status: p.listingType === "SOLD" ? "SOLD" : p.listingType === "LEASED" ? "LEASED" : "ACTIVE",
        propertyType: p.propertyType,
        bedrooms: p.beds,
        bathrooms: p.baths,
        carSpaces: p.cars,
        landSize: p.land,
        buildingSize: p.building,
        features: p.features.join(","),
        images: JSON.stringify(p.images.map((id) => ({ url: U(id), caption: p.title }))),
        floorPlan: null,
        virtualTourUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        agentId: agent.id,
        featured: p.featured,
        views: Math.floor(Math.random() * 800) + 50,
      },
    });
  }

  // Services
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await db.service.create({
      data: {
        slug: s.slug,
        title: s.title,
        category: s.category,
        tagline: s.tagline,
        description: s.description,
        process: JSON.stringify(s.process),
        included: JSON.stringify(s.included),
        feeInfo: s.feeInfo,
        icon: s.icon,
        order: i,
      },
    });
  }

  // Blog posts
  const posts = [
    { title: "Melbourne Property Market Outlook: What to Expect in 2025", excerpt: "Our analysts break down the trends shaping Melbourne's property market this year — from rate cuts to supply shortages.", category: "Market Insights", tags: "market,trends,investing", content: "# Melbourne Property Market Outlook\n\nAfter a stabilising 2024, Melbourne's property market is poised for measured growth. With the RBA signalling potential rate cuts and ongoing supply constraints, we expect median prices to rise 4–7% across most corridors.\n\n## Key Drivers\n\n- **Interest rate relief** is improving borrowing capacity.\n- **Population growth** continues to outstrip new supply.\n- **Premium suburbs** are seeing renewed prestige demand.\n\n## Where the Opportunity Is\n\nThe inner-north and Southbank corridor offer strong yield-to-growth balance. Meanwhile, inner-east prestige continues to set records.\n\n> 'The fundamentals underpinning Melbourne property remain robust,' says Principal Govinder Kumar.\n\nSpeak to our team about how these trends affect your buying or selling strategy.", image: HOUSE_IMG[2] },
    { title: "How to Prepare Your Home for a Premium Sale", excerpt: "From styling to minor repairs, these simple steps can add tens of thousands to your final sale price.", category: "Selling Tips", tags: "selling,styling,tips", content: "# Preparing Your Home for a Premium Sale\n\nFirst impressions matter. Buyers form an opinion within seconds of walking in. Here's how to make those seconds count.\n\n## 1. Declutter and Depersonalise\n\nRemove excess furniture and personal items so buyers can picture themselves living there.\n\n## 2. Invest in Professional Styling\n\nStyled homes sell faster and for more. Our campaigns include styling consultation.\n\n## 3. Minor Repairs Pay Off\n\nFix leaky taps, scuffed walls and squeaky doors. Small flaws signal bigger problems.\n\n## 4. Curb Appeal\n\nMow the lawn, tidy the garden and paint the front door. The exterior sets expectations.\n\nReady to sell? Book a free appraisal with our team.", image: HOUSE_IMG[13] },
    { title: "First Home Buyer's Guide to Grants and Exemptions", excerpt: "Navigating the First Home Owner Grant and stamp duty concessions can save you thousands. Here's what you need to know.", category: "First Home Buyers", tags: "first-home,grants,guide", content: "# First Home Buyer Grants Explained\n\nBuying your first home is exciting — and the Victorian government offers real financial help.\n\n## First Home Owner Grant (FHOG)\n\nEligible first buyers of new homes up to $750,000 can receive a $10,000 grant.\n\n## Stamp Duty Exemptions\n\n- **Under $600,000**: full exemption\n- **$600k–$750k**: concessional rate\n\n## How We Help\n\nOur first-home buyer specialists guide you through eligibility, pre-approval and the purchase itself — at no cost to eligible buyers.\n\nSpeak to our team to check your eligibility today.", image: HOUSE_IMG[5] },
    { title: "The Investor's Playbook: Yield vs Growth", excerpt: "Should you chase high rental yield or capital growth? The answer depends on your strategy and timeline.", category: "Investing", tags: "investing,yield,growth", content: "# Yield vs Growth: An Investor's Dilemma\n\nEvery investor faces the same trade-off: cash flow now or wealth later?\n\n## High-Yield Strategy\n\nBest for investors who need income to service debt. Look to Southbank and the inner-north where gross yields exceed 4.5%.\n\n## Capital Growth Strategy\n\nBest for long-term wealth building. Melbourne's prestige and bayside markets have historically delivered 7–10% annual growth.\n\n## The Balanced Approach\n\nMost successful portfolios blend both. Our advisory team models scenarios tailored to your goals.", image: HOUSE_IMG[8] },
    { title: "Auction Day: A Step-by-Step Guide for Vendors", excerpt: "What actually happens on auction day, and how to set yourself up for a result above reserve.", category: "Auctions", tags: "auction,selling", content: "# Your Auction Day Playbook\n\nAuction day is the climax of your sales campaign. Here's exactly what to expect.\n\n## Before the Auction\n\n- Finalise your reserve with your agent based on feedback.\n- Register all bidders.\n- Have your conveyancer on standby.\n\n## On the Day\n\nThe auctioneer opens, calls for bids, and builds momentum. If bidding stalls, the property may be passed in — but that's when negotiation begins.\n\n## After the Hammer\n\nIf sold, contracts are exchanged on the spot with a 10% deposit. If passed in, your agent negotiates with the top bidder immediately.\n\nOur auctioneers are among Melbourne's most experienced.", image: HOUSE_IMG[0] },
    { title: "Why Property Management Matters for Investors", excerpt: "A great property manager protects your asset, keeps tenants happy, and maximises your returns.", category: "Property Management", tags: "rental,investing,management", content: "# The Value of Professional Property Management\n\nSelf-managing might save a fee, but it costs investors far more in lost rent, void periods and compliance risk.\n\n## What a Great Manager Does\n\n- Screens tenants thoroughly to reduce arrears and damage.\n- Conducts routine inspections and documents condition.\n- Coordinates maintenance with vetted, cost-effective trades.\n- Provides monthly statements and end-of-year tax summaries.\n\n## The A1 Vision Real Estate Difference\n\nOur managers treat your property like their own. With 320+ properties under management, our arrears rate is below 1%.", image: HOUSE_IMG[11] },
    { title: "Why Property Markets Go Up and Down: The Forces That Move Prices", excerpt: "Interest rates, government policy, immigration and supply all push house prices up — or pull them down. Here's how the levers actually work.", category: "Market Insights", tags: "market,policy,rates,investing", content: "# Why Property Markets Go Up and Down\n\nProperty prices feel unpredictable, but they're driven by a small number of powerful forces. Understanding these levers helps you time your move — whether you're buying, selling or investing.\n\n## 1. Interest Rates (The Biggest Lever)\n\nThe Reserve Bank of Australia (RBA) sets the official cash rate, which flows directly into mortgage rates.\n\n- **When rates fall**, borrowing becomes cheaper, buyers can afford more, and prices tend to rise.\n- **When rates rise**, monthly repayments jump, borrowing capacity shrinks, and price growth slows or reverses.\n\nA single 0.25% rate move can shift a buyer's maximum loan by tens of thousands of dollars. That's why rate decisions move markets within weeks.\n\n## 2. Supply and Demand\n\nAt its core, property is about how many people want homes versus how many homes exist.\n\n- **High demand + low supply** = prices rise (think established inner-suburb streets with no new land).\n- **High supply + soft demand** = prices stagnate or fall (think new estates releasing hundreds of lots at once).\n\nTrack **listing volumes** and **days on market** — when listings pile up, buyers gain negotiating power.\n\n## 3. Government Policy and Grants\n\nPolicy can supercharge or cool the market almost overnight.\n\n- **First Home Owner Grant (FHOG)** — a $10,000 grant for eligible first buyers of new homes. Boosts demand at the entry level.\n- **Stamp duty concessions** — Victoria offers full exemptions for homes under $600,000 and concessional rates up to $750,000. Putting thousands back in buyers' pockets lifts affordability.\n- **First Home Super Saver Scheme** — lets first buyers save a deposit inside super, taxed at a lower rate.\n- **HomeBuilder & similar stimulus** — time-limited grants that pull forward demand (and can soften the market once they end).\n\n## 4. Tax Policy: Negative Gearing & CGT Discount\n\nAustralia's tax system rewards property investment:\n\n- **Negative gearing** lets investors deduct property losses (including interest) against other income.\n- **The 50% CGT discount** halves the capital gains tax on investment properties held over 12 months.\n\nTogether these make investment property attractive, supporting demand — especially for established homes in growth corridors.\n\n## 5. Lending Rules (APRA)\n\nThe banking regulator, APRA, sets the rules banks follow when lending.\n\n- Tightening serviceability buffers (e.g. assessing borrowers at 3% above their rate) reduces how much people can borrow.\n- Loosening them does the opposite.\n\nAPRA moves quietly but has a huge impact on the amount of money flowing into housing.\n\n## 6. Immigration and Population Growth\n\nStrong overseas migration directly lifts housing demand. When net migration runs at record highs, rents and prices rise as new arrivals compete for limited stock — particularly in Melbourne and Sydney. Policy changes to visa settings or migration caps can shift demand meaningfully.\n\n## 7. Foreign Investment Rules\n\nThe Foreign Investment Review Board (FIRB) governs overseas buyers. Restrictions (such as limiting foreign purchases to new dwellings) channel foreign capital into new construction, boosting supply. Easing or tightening these rules changes where investment lands.\n\n## 8. Zoning, Planning and Building Approvals\n\nLocal council zoning decides what can be built where.\n\n- **Upzoning** (allowing townhouses or apartments on previously house-only land) increases supply and can moderate price growth.\n- **Slow planning approvals** constrain supply and push prices up.\n- Government infrastructure (new rail lines, schools, hospitals) lifts values in the corridors it opens up.\n\n## 9. Economic Confidence and Unemployment\n\nWhen people feel secure in their jobs, they borrow and buy. Rising unemployment or economic uncertainty puts buyers on the sidelines, softening demand. Consumer sentiment surveys are a useful leading indicator.\n\n## Putting It All Together\n\nNo single factor moves the market alone — it's the combination. **Low rates + strong migration + tight supply** is the classic recipe for boom conditions. **Rising rates + slack demand + high supply** points to a softer patch.\n\n> 'Policy sets the rules, but supply and demand set the price,' says Principal Govinder Kumar. 'The smartest buyers and sellers watch the levers, not the headlines.'\n\nWant help reading the market for your next move? Speak to the A1 Vision Real Estate team today.", image: HOUSE_IMG[2], authorId: tarushUserId },
  ];
  for (const p of posts) {
    await db.blogPost.create({
      data: {
        title: p.title,
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: p.tags,
        authorId: p.authorId || admin.id,
        featuredImage: U(p.image, 1400, 800),
        published: true,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 86400000),
      },
    });
  }

  // Testimonials — random client names, no ratings (new agency).
  const testimonials = [
    { name: "Priya Sharma", location: "Toorak", rating: 0, serviceType: "Sale", message: "Govinder and the team made selling our home straightforward. Their communication was excellent and we felt supported the whole way through." },
    { name: "Daniel Thompson", location: "Carlton", rating: 0, serviceType: "Purchase", message: "As a first-home buyer I was nervous, but Ravi guided me through every step. Found me a home I love within budget. Highly recommend A1 Vision Real Estate." },
    { name: "Mei Chen", location: "Brighton", rating: 0, serviceType: "Sale", message: "Govinder's market knowledge is excellent. He positioned my apartment well and we had interest within the first week. A smooth experience." },
    { name: "Aaron Patel", location: "Southbank", rating: 0, serviceType: "Investment", message: "Ravi helped me find my first investment property. His data-driven approach gave me confidence in every decision. Will be back for the next one." },
    { name: "Sophie Nguyen", location: "Port Melbourne", rating: 0, serviceType: "Property Management", message: "Tarush designed our marketing campaign beautifully. Always proactive and great communication throughout the whole process." },
    { name: "James Wilson", location: "Kew", rating: 0, serviceType: "Auction", message: "Govinder ran a great auction. The energy in the room was fantastic and we achieved a result we were really happy with." },
    { name: "Anika Reddy", location: "South Yarra", rating: 0, serviceType: "Appraisal", message: "The free appraisal was detailed and honest — no pressure at all. It gave us the confidence to plan our next move." },
    { name: "Michael O'Brien", location: "Fitzroy", rating: 0, serviceType: "Purchase", message: "Ravi found us an off-market property that was exactly what we were looking for. His negotiation was brilliant. Couldn't recommend more." },
  ];
  for (const t of testimonials) {
    await db.testimonial.create({
      data: { ...t, status: "APPROVED" },
    });
  }
  // one pending for moderation demo
  await db.testimonial.create({
    data: { name: "Lisa Tran", location: "Melbourne", rating: 0, serviceType: "Sale", message: "Just submitted this review to test the moderation flow — please approve.", status: "PENDING" },
  });

  // Sample leads, inspections, contacts
  const sampleProps = await db.property.findMany({ take: 4, orderBy: { createdAt: "desc" } });
  await db.lead.create({ data: { type: "ENQUIRY", name: "Tarush Moudgill", email: "tarush.m@example.com", phone: "0412 345 678", message: "Interested in this property, is it still available for a private inspection?", propertyId: sampleProps[0]?.id, status: "NEW", source: "Website" } });
  await db.lead.create({ data: { type: "APPRAISAL", name: "Tarush Moudgill", email: "tarush.m2@example.com", phone: "0433 998 112", message: "I'd like a free appraisal for my 3-bed house in Kew. Built 1998, renovated kitchen.", status: "NEW", source: "Website" } });
  await db.lead.create({ data: { type: "LIST_PROPERTY", name: "Tarush Moudgill", email: "tarush.m3@example.com", phone: "0455 222 333", message: "Looking to sell our family home in the next 2-3 months. Would love to discuss options.", status: "CONTACTED", source: "Website" } });
  await db.lead.create({ data: { type: "ENQUIRY", name: "Tarush Moudgill", email: "tarush.m4@example.com", phone: "0466 111 222", message: "What's the strata fee for this apartment?", propertyId: sampleProps[1]?.id, status: "QUALIFIED", source: "Website" } });

  await db.inspection.create({ data: { propertyId: sampleProps[0]?.id, agentId: sampleProps[0]?.agentId, name: "Tarush Moudgill", email: "tarush.m@example.com", phone: "0412 345 678", preferredDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), preferredTime: "10:00", message: "Prefer weekday morning.", status: "PENDING" } });
  await db.inspection.create({ data: { propertyId: sampleProps[2]?.id, agentId: sampleProps[2]?.agentId, name: "Tarush Moudgill", email: "tarush.m5@example.com", phone: "0488 777 999", preferredDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), preferredTime: "14:00", message: "", status: "CONFIRMED" } });

  await db.contactSubmission.create({ data: { name: "Tarush Moudgill", email: "tarush.m6@example.com", phone: "0422 001 002", subject: "General enquiry", message: "Do you offer property management in Kew?", status: "NEW" } });
  await db.contactSubmission.create({ data: { name: "Tarush Moudgill", email: "tarush.m7@example.com", phone: "0477 333 555", subject: "Career opportunity", message: "I'd love to join your sales team. Are you hiring?", status: "READ" } });

  // Customers
  await db.customer.create({ data: { name: "Tarush Moudgill", email: "tarush.m8@example.com", phone: "0411 222 333", role: "SELLER", notes: "Sold Toorak home 2024. Potential downsizer buyer." } });
  await db.customer.create({ data: { name: "Tarush Moudgill", email: "tarush.m9@example.com", phone: "0411 444 555", role: "BUYER", preferences: JSON.stringify({ beds: 2, maxPrice: 900000, suburbs: ["Carlton","Fitzroy"] }), notes: "First-home buyer, pre-approved to $900k." } });

  // Settings
  await db.siteSettings.create({
    data: {
      id: "singleton",
      businessName: "A1 Vision Real Estate",
      tagline: "Premium Real Estate",
      phone: "+61 3 9000 0000",
      email: "hello@a1vision.com.au",
      address: "Top Floor, 2/18 Elm Park Drive, Hoppers Crossing VIC 3029",
      hours: "Mon–Fri 8:30am–6pm · Sat 9am–4pm",
      heroTitle: "Find a place you'll love to call home",
      heroSubtitle: "A dedicated Melbourne team for buying, selling, renting and investing — combining sharp local knowledge with tailored, personal service.",
      heroImage: U("1564013799919-ab600027ffc6", 1920, 1080),
      heroCtaText: "Browse Properties",
      facebook: SOCIAL_LINK.facebook,
      instagram: SOCIAL_LINK.instagram,
      linkedin: SOCIAL_LINK.linkedin,
      youtube: SOCIAL_LINK.youtube,
    },
  });

  return { ok: true };
}

const SOCIAL_LINK = {
  facebook: "https://facebook.com/a1visionrealestate",
  instagram: "https://instagram.com/a1visionrealestate",
  linkedin: "https://linkedin.com/company/a1visionrealestate",
  youtube: "https://youtube.com/@a1visionrealestate",
};
