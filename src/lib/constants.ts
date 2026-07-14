// Central constants & static content for A1 Vision Real Estate

export const BUSINESS = {
  name: "A1 Vision Real Estate",
  tagline: "Premium Real Estate",
  phone: "+61 3 9000 0000",
  email: "hello@a1vision.com.au",
  address: "Top Floor, 2/18 Elm Park Drive, Hoppers Crossing VIC 3029",
  hours: "Mon–Fri 8:30am–6pm · Sat 9am–4pm",
  abn: "12 345 678 901",
  offices: [
    {
      name: "Hoppers Crossing (Head Office)",
      address: "Top Floor, 2/18 Elm Park Drive, Hoppers Crossing VIC 3029",
      phone: "+61 3 9000 0000",
    },
    {
      name: "Truganina",
      address: "Top Floor, 54 Efficient Drive, Truganina VIC 3029",
      phone: "+61 3 9000 0001",
    },
  ],
};

export const SOCIAL = {
  facebook: "https://facebook.com/a1visionrealestate",
  instagram: "https://instagram.com/a1visionrealestate",
  linkedin: "https://linkedin.com/company/a1visionrealestate",
  youtube: "https://youtube.com/@a1visionrealestate",
};

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Townhouse",
  "Villa",
  "Land",
  "Acreage",
  "Penthouse",
];

export const LISTING_TYPE_LABEL: Record<string, string> = {
  SALE: "For Sale",
  RENT: "For Rent",
  LEASED: "Leased",
  SOLD: "Sold",
  AUCTION: "Auction",
  NEW: "New",
  OFFMARKET: "Off Market",
  PROJECT: "New Project",
};

export const SERVICE_SLUGS = [
  "residential-sales",
  "buyer-advocacy",
  "property-management",
  "property-appraisal",
  "investment-advisory",
  "auction-services",
  "first-home-buyer",
] as const;

export const SERVICES = [
  {
    slug: "residential-sales",
    title: "Residential Sales",
    category: "Selling",
    icon: "Home",
    tagline:
      "Maximise your sale price with a data-driven campaign crafted for your property.",
    description:
      "Our end-to-end residential sales service combines premium marketing, deep market intelligence and skilful negotiation to deliver outstanding results. From the first appraisal to settlement day, your dedicated agent manages every detail.",
    process: [
      { step: "1", title: "Complimentary Appraisal", text: "We assess your home's market value with a comparative market analysis." },
      { step: "2", title: "Marketing Strategy", text: "Professional photography, videography, copywriting and a tailored campaign." },
      { step: "3", title: "Campaign Launch", text: "Listings across all major portals, our network and social channels." },
      { step: "4", title: "Inspections & Negotiation", text: "Private and open inspections, then expert offer management." },
      { step: "5", title: "Settlement Support", text: "Conveyancing coordination right through to handover." },
    ],
    included: [
      "Free property appraisal & CMA report",
      "Professional photography & drone videography",
      "Premium portal listings (Domain, Realestate.com.au)",
      "Copywriting & floor plan design",
      "Open & private inspection management",
      "Offer negotiation & contract exchange",
      "Settlement coordination",
    ],
    feeInfo:
      "Commission is performance-based and only payable on sale. Standard range is 1.8%–2.5% + GST, plus a marketing investment from $2,500. Final fees are confirmed in a written agency agreement following consultation.",
  },
  {
    slug: "buyer-advocacy",
    title: "Buyer Advocacy",
    category: "Buying",
    icon: "Search",
    tagline:
      "Let our advocates find, evaluate and secure the right property at the right price.",
    description:
      "Buying property is one of life's biggest decisions. Our buyer advocates act exclusively for you — sourcing off-market opportunities, attending inspections, conducting due diligence and negotiating hard to protect your interests.",
    process: [
      { step: "1", title: "Needs Briefing", text: "We define your budget, must-haves and target suburbs." },
      { step: "2", title: "Property Sourcing", text: "We search on and off-market to build your shortlist." },
      { step: "3", title: "Inspections & Due Diligence", text: "We inspect on your behalf and run building/pest checks." },
      { step: "4", title: "Negotiation", text: "We negotiate price and terms to secure the property." },
      { step: "5", title: "Exchange & Settlement", text: "We coordinate conveyancers through to keys in hand." },
    ],
    included: [
      "Dedicated buyer advocate",
      "Off-market property sourcing",
      "Shortlisting with full due-diligence",
      "Inspection attendance & reporting",
      "Auction bidding representation",
      "Price & terms negotiation",
      "Settlement coordination",
    ],
    feeInfo:
      "Buyer advocacy is a flat engagement fee from $4,950 or a percentage of purchase price (typically 1.0%–1.5%) for acquisitions above $1M. Quoted in writing after your initial consultation.",
  },
  {
    slug: "property-management",
    title: "Property Management",
    category: "Renting",
    icon: "Building2",
    tagline:
      "Hands-off investing with a property manager who treats your asset like their own.",
    description:
      "Our property management team takes the stress out of being a landlord. From tenant sourcing and rent collection to maintenance and routine inspections, we protect your investment and keep occupancy high.",
    process: [
      { step: "1", title: "Onboarding", text: "We appraise your rental and prepare the lease." },
      { step: "2", title: "Tenant Sourcing", text: "Marketing, screening, and lease signing." },
      { step: "3", title: "Rent Collection", text: "Automated collection and disbursement to you." },
      { step: "4", title: "Maintenance", text: "Vetted tradespeople and prompt coordination." },
      { step: "5", title: "Inspections & Reporting", text: "Routine inspections and detailed reporting." },
    ],
    included: [
      "Tenant sourcing & thorough screening",
      "Lease preparation & renewals",
      "Rent collection & arrears management",
      "Maintenance coordination (24/7)",
      "Routine & exit inspections",
      "Monthly financial reporting",
      "Tribute/rent disbursement",
    ],
    feeInfo:
      "Management fee is 7%–9% + GST of collected rent. Letting fee is one week's rent + GST. No leasing fee on renewals. Full schedule provided in the management agreement.",
  },
  {
    slug: "property-appraisal",
    title: "Property Appraisal",
    category: "Valuation",
    icon: "ClipboardCheck",
    tagline:
      "Know exactly what your home is worth with a complimentary, no-obligation appraisal.",
    description:
      "Our accredited agents provide a detailed comparative market analysis (CMA) so you can make informed decisions about selling, refinancing or investing. It's free, comprehensive and backed by live market data.",
    process: [
      { step: "1", title: "Property Details", text: "Share your address, type, bed/bath and condition." },
      { step: "2", title: "Market Analysis", text: "We compare recent sales and current competition." },
      { step: "3", title: "Appraisal Report", text: "Receive a written CMA with a recommended price range." },
      { step: "4", title: "Strategy Session", text: "Optional consultation on timing and campaign options." },
    ],
    included: [
      "Comparative market analysis report",
      "Recommended sale-price range",
      "Days-on-market estimate",
      "Suggested improvements to maximise value",
      "Campaign timing recommendations",
      "No obligation, completely free",
    ],
    feeInfo: "Complimentary. No cost and no obligation.",
  },
  {
    slug: "investment-advisory",
    title: "Investment Advisory",
    category: "Investing",
    icon: "TrendingUp",
    tagline:
      "Build a high-performing portfolio with data-driven strategy and yield analysis.",
    description:
      "Whether you're buying your first investment or restructuring a portfolio, our advisors combine rental yield analysis, capital-growth projections and tax-aware strategy to help you build long-term wealth.",
    process: [
      { step: "1", title: "Goal Setting", text: "We define yield, growth and risk objectives." },
      { step: "2", title: "Market Analysis", text: "Suburb-level yield and growth projections." },
      { step: "3", title: "Strategy", text: "A tailored acquisition and portfolio plan." },
      { step: "4", title: "Acquisition", text: "Source, assess and secure the right assets." },
    ],
    included: [
      "Rental yield analysis",
      "Capital growth projections",
      "Portfolio strategy & structuring",
      "Suburb & asset recommendations",
      "Cash-flow modelling",
      "Ongoing portfolio reviews",
    ],
    feeInfo:
      "Initial strategy session is complimentary. Ongoing advisory is a flat fee from $1,950 or packaged with buyer advocacy. Confirmed after consultation.",
  },
  {
    slug: "auction-services",
    title: "Auction Services",
    category: "Selling",
    icon: "Gavel",
    tagline:
      "A high-energy auction campaign engineered to maximise competition and price.",
    description:
      "Auctions create urgency and transparency. Our auction specialists manage the entire campaign — from pre-auction marketing to auction-day coordination and reserve-price strategy — to drive the strongest possible result.",
    process: [
      { step: "1", title: "Campaign Planning", text: "Set auction date, venue and marketing schedule." },
      { step: "2", title: "Pre-Auction Campaign", text: "Four-week marketing push with inspections." },
      { step: "3", title: "Bidder Registration", text: "Qualify and register interested bidders." },
      { step: "4", title: "Reserve Advice", text: "Data-backed reserve price recommendation." },
      { step: "5", title: "Auction Day", text: "Professional auctioneer and on-the-day coordination." },
    ],
    included: [
      "Auction campaign management",
      "Auctioneer engagement",
      "Bidder registration & qualification",
      "Reserve price strategy",
      "Auction-day coordination",
      "Post-auction negotiation (if passed in)",
    ],
    feeInfo:
      "Auctioneer fee from $1,200. Campaign marketing from $4,000. Commission per the sales agreement. Full quote provided pre-campaign.",
  },
  {
    slug: "first-home-buyer",
    title: "First Home Buyer",
    category: "Buying",
    icon: "KeyRound",
    tagline:
      "Guidance, grants and pre-approval support to get you into your first home.",
    description:
      "Buying your first home should be exciting, not overwhelming. We help first-home buyers navigate government grants, secure pre-approval, choose the right suburb and negotiate confidently.",
    process: [
      { step: "1", title: "Grants Check", text: "Identify eligible first-home grants and exemptions." },
      { step: "2", title: "Pre-Approval", text: "Connect you with trusted mortgage brokers." },
      { step: "3", title: "Suburb Matching", text: "Recommend suburbs that fit your budget & lifestyle." },
      { step: "4", title: "Purchase", text: "Inspect, negotiate and secure your first home." },
    ],
    included: [
      "Government grants guidance (FHOG, stamp-duty exemptions)",
      "Pre-approval assistance via broker network",
      "Suburb recommendations within budget",
      "Deposit & borrowing-power education",
      "Buyer advocacy on first purchase",
      "Settlement & handover support",
    ],
    feeInfo:
      "Complimentary for eligible first-home buyers. Buyer advocacy fees may apply on purchase; grants and concessions often offset these.",
  },
];

export const NAV_ITEMS = [
  { label: "Home", route: "home" },
  { label: "Properties", route: "properties" },
  { label: "Services", route: "services" },
  { label: "Suburb Guides", route: "suburbs" },
  { label: "Agents", route: "agents" },
  { label: "Gallery", route: "gallery" },
  { label: "Blog", route: "blog" },
  { label: "About", route: "about" },
  { label: "Contact", route: "contact" },
];

export const FAQS = [
  {
    q: "How do I book a property inspection?",
    a: "Open any property listing and tap 'Book Inspection'. Choose your preferred date and time, leave your contact details, and the listing agent will confirm within one business day. You'll receive an email and SMS confirmation.",
  },
  {
    q: "What does a property appraisal cost?",
    a: "Our appraisals are completely free and carry no obligation. An accredited agent will prepare a comparative market analysis and meet with you to discuss timing and strategy.",
  },
  {
    q: "How are your sales fees structured?",
    a: "Sales commission is performance-based and only payable on a successful sale. Standard commission ranges from 1.8%–2.5% + GST, plus a marketing investment from $2,500. Final fees are confirmed in a written agency agreement.",
  },
  {
    q: "Can you help me buy off-market properties?",
    a: "Yes. Our buyer advocates have an extensive network and regularly source off-market and pre-market opportunities exclusively for our buyers.",
  },
  {
    q: "Do you manage rental properties?",
    a: "Absolutely. Our property management team handles tenant sourcing, rent collection, maintenance, inspections and reporting for a management fee of 7%–9% + GST of collected rent.",
  },
  {
    q: "What happens at auction if my property is passed in?",
    a: "If passed in, our agent immediately negotiates with the highest bidder and any other registered interested parties. Many passed-in properties sell within 48 hours post-auction.",
  },
  {
    q: "How long is a typical sales campaign?",
    a: "A standard campaign runs four weeks for an auction and 4–6 weeks for a private treaty sale. Timing is tailored to your property and market conditions.",
  },
  {
    q: "What areas do you service?",
    a: "We cover Melbourne metro and key growth corridors across Victoria, with offices in the Melbourne CBD, South Yarra and Bayside. Contact us about properties outside these areas.",
  },
];

export const STATS = [
  { value: "Local", label: "Melbourne owned & operated" },
  { value: "Bespoke", label: "Tailored property campaigns" },
  { value: "Dedicated", label: "Specialists on every transaction" },
  { value: "Free", label: "No-obligation appraisals" },
];
