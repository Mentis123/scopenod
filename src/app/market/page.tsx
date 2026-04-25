import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Ban,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Crosshair,
  FileBadge,
  Flame,
  Gauge,
  Globe2,
  Layers,
  LineChart,
  Link2,
  MapPin,
  QrCode,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { StatusPill } from "@/components/status-pill";

export const metadata = {
  title: "ScopeNod — Market & GTM",
  description:
    "Competitive landscape, positioning, and go-to-market plan for ScopeNod's AI-verified service-proof wedge."
};

const marketStats = [
  {
    label: "Global FSM software, 2026",
    value: "USD $6.26B",
    detail: "Mordor Intelligence — ~9.5% CAGR to ~$9.87B by 2031",
    Icon: Globe2
  },
  {
    label: "APAC growth rate",
    value: "17.3% CAGR",
    detail: "Fastest-growing FSM region. Australia named regional leader.",
    Icon: LineChart
  },
  {
    label: "AU operator margins",
    value: "+40%",
    detail: "Higher avg. profit vs. US peers. Premium tech adoption — they pay for polish.",
    Icon: Award
  },
  {
    label: "Net-new FSM growth",
    value: "+USD $2.5B",
    detail: "Technavio: incremental market value, 2026–2030 (14.8% CAGR).",
    Icon: Sparkles
  }
];

type Tier = {
  number: string;
  name: string;
  shape: string;
  examples: string[];
  read: string;
  threat: "high" | "medium" | "low";
  Icon: typeof Camera;
};

const tiers: Tier[] = [
  {
    number: "1",
    name: "Photo-proof / field-camera apps",
    shape: "Worker-held cameras that produce evidence libraries.",
    examples: [
      "CompanyCam (US, $19–29/user/mo)",
      "Timemark, Solocator, Onetrace",
      "Filio, PHOTO iD, SnapProof, ScopeSnap"
    ],
    read: "All photo libraries for the worker. None ship a polished customer-acknowledgement experience as the centre of the product. CompanyCam is the existential question.",
    threat: "high",
    Icon: Camera
  },
  {
    number: "2",
    name: "Auto-detailing software (V1 wedge)",
    shape: "Vertical CRMs that bundle photos as a feature inside a job ticket.",
    examples: [
      "Fieldd (AU) — incumbent to beat",
      "Mobile Tech RX, Urable, OrbisX",
      "RO App, RoadFS, Detailed"
    ],
    read: "Don't out-CRM them. Be the best-in-class Service Record layer detailers can run alongside an existing CRM — or instead of one if they're sole traders.",
    threat: "high",
    Icon: Wrench
  },
  {
    number: "3",
    name: "Field service management (AU stack)",
    shape: "Platforms that already own the buyer relationship and budget.",
    examples: [
      "ServiceM8 (AU, ~$29/mo) — biggest AU adjacency risk",
      "Tradify, simPRO, AroFlo, Fergus",
      "Jobber, Housecall Pro, Klipboard"
    ],
    read: "Don't pretend to compete on scheduling, invoicing, or dispatch. Position as a clip-on Service Record for whatever job system you already use.",
    threat: "medium",
    Icon: Layers
  },
  {
    number: "4",
    name: "Inspection / EHS / mobile forms",
    shape: "Template-first platforms with photos and signatures as features.",
    examples: [
      "SafetyCulture (AU) — existential brand-shadow",
      "GoCanvas, TrueContext, Fluix",
      "Donesafe, Kynection, MaintainX"
    ],
    read: "Template-first, not artefact-first. Different buyer (compliance leaders vs. mobile detail owner). Don't sell against them — sell to a different buyer.",
    threat: "low",
    Icon: ClipboardCheck
  },
  {
    number: "5",
    name: "Property condition / inspection",
    shape: "Closest analogue for the artefact ScopeNod produces.",
    examples: [
      "SnapInspect (AU/NZ) — design reference",
      "HappyCo, InspectRealEstate",
      "Spectora, HomeGauge, Inspector Cloud"
    ],
    read: "Most valuable as a design reference, not a competitor set. Shows what a polished customer-facing condition record can look like in a related vertical.",
    threat: "low",
    Icon: FileBadge
  }
];

const winWedges = [
  {
    title: "Customer-acknowledged Service Record as the artefact",
    body: "No tier-1, tier-2, or tier-3 player ships this as the centre of the product. They have signatures and photos as features — ScopeNod has the record as the product.",
    Icon: FileBadge
  },
  {
    title: "No-account customer side",
    body: "QR/link to a clean, mobile-web acknowledgement page is genuinely differentiated. Most competitor flows assume a no-show or a paper signature.",
    Icon: QrCode
  },
  {
    title: "Mobile car detailing as a credible wedge",
    body: "AU detailing has CRMs but no Service Record specialist. Visual, dispute-prone, and explainable to investors — a clean showcase wedge.",
    Icon: Target
  },
  {
    title: "AU-first launch advantage",
    body: "Australia leads APAC in FSM adoption, has ServiceM8/SafetyCulture-trained buyers who expect mobile SaaS — and pays for it.",
    Icon: MapPin
  },
  {
    title: "Brand restraint around AI",
    body: "Most evidence competitors lean on AI as the headline. ScopeNod puts AI in the background — calmer, more trustworthy for non-technical operators.",
    Icon: ShieldCheck
  }
];

const exposures = [
  {
    title: "CompanyCam adds a customer-record flow",
    body: "They have the distribution. Mitigation: lock a defensible Service Record format and Service Record URL pattern fast.",
    severity: "amber"
  },
  {
    title: "ServiceM8 templates a Service Record add-on",
    body: "They already own the AU SMB tradie. Mitigation: deepen customer-side polish in ways a generic FSM won't bother to copy.",
    severity: "amber"
  },
  {
    title: "Detailing CRMs default to photo proof",
    body: "Mobile Tech RX, Urable, Fieldd will. Treat them as integration partners, not enemies — share-sheet handoff is already in V1.",
    severity: "neutral"
  },
  {
    title: "SafetyCulture decides SMB matters",
    body: "Low probability, high impact. Watch their template marketplace and SMB pricing.",
    severity: "neutral"
  },
  {
    title: "App-store name collisions",
    body: "SnapProof, ScopeSnap, Vouch.io are already in this lane. Execute the App Store name lock immediately.",
    severity: "amber"
  },
  {
    title: "The 'just a feature' trap",
    body: "Defensibility cannot live in the camera flow alone. It has to come from the Service Record artefact, customer-side experience, and trust signals.",
    severity: "amber"
  }
];

const pricingBenchmarks = [
  {
    product: "ScopeNod (recommended)",
    pricing: "Free → $12 → $29 AUD",
    angle: "Per record, not per seat. Free tier is the viral surface.",
    highlight: true
  },
  {
    product: "CompanyCam",
    pricing: "$19–29/user/mo · 3-user min",
    angle: "Photo library + AI report builder"
  },
  {
    product: "ServiceM8",
    pricing: "from ~$29/mo",
    angle: "Full FSM, AU SMB tradie default"
  },
  {
    product: "Mobile Tech RX",
    pricing: "from $25/user/mo",
    angle: "Detailing CRM with photo workflow"
  },
  {
    product: "simPRO",
    pricing: "from ~$149/mo",
    angle: "Mid-market project costing"
  }
];

const pricingPlan = [
  {
    tier: "Free",
    price: "$0",
    cadence: "5 records / month",
    rationale:
      "Covers a sole trader's heroic week. Every record carries a small 'Verified by ScopeNod' footer — Calendly-style brand surface area.",
    Icon: Sparkles
  },
  {
    tier: "Solo",
    price: "$12 AUD",
    cadence: "/ mo · 50 records",
    rationale:
      "Sits below CompanyCam's $19/seat and ServiceM8's $29/mo entry. Single-user mobile detailer can say yes without thinking.",
    Icon: Wrench
  },
  {
    tier: "Crew",
    price: "$29 AUD",
    cadence: "/ mo · 3 users · 200 records",
    rationale:
      "Anchored to ServiceM8's price point. Adds embed branding and removes the 'Verified by' footer — the upgrade trigger.",
    Icon: Layers
  },
  {
    tier: "Fleet / Insurance",
    price: "Per record",
    cadence: "Volume + API",
    rationale:
      "Don't sell seats to insurers or fleet ops. Sell records — the unit they actually consume and audit.",
    Icon: ShieldCheck
  }
];

const distributionChannels = [
  {
    name: "Detailing supplier reps",
    detail:
      "Chemicals and polish wholesalers visit every shop weekly. Co-brand a referral kit. Most underrated B2B channel in the trade.",
    tone: "high"
  },
  {
    name: "Auto auction houses + leasing returns",
    detail:
      "End-of-lease and pre-auction inspections are dispute-prone by design. The Service Record is the artefact they already wish existed.",
    tone: "high"
  },
  {
    name: "Insurance pre/post-claim photo evidence",
    detail:
      "Adjacent buyer with deeper pockets. Pilot with one AU insurer's preferred-repairer panel before chasing the wide market.",
    tone: "high"
  },
  {
    name: "Dealership pre-delivery + recon teams",
    detail:
      "Dealers already photograph pre-delivery. They want a customer-side acknowledgement they can attach to the handover, not a new CRM.",
    tone: "medium"
  },
  {
    name: "Detailer Facebook groups + franchise networks",
    detail:
      "The doc-named channel. Real, but slow on its own. Treat as community signal, not a primary growth lever.",
    tone: "medium"
  },
  {
    name: "Tow / accident-tow networks",
    detail:
      "First-touch on damaged vehicles. A condition record at tow is gold for every downstream party.",
    tone: "medium"
  }
];

const myTake = [
  {
    title: "Don't price by seat. Price by record.",
    body: "CompanyCam's 3-seat minimum is hostile to the AU sole-trader detailer. A free tier that watermarks the artefact, plus a per-record fleet/insurance tier, weaponises the very thing competitors treat as a feature.",
    Icon: Gauge
  },
  {
    title: "The moat is the URL, not the camera.",
    body: "The Service Record needs a stable, public, brand-anchored URL pattern (record.scopenod.com/<id>) that becomes a noun in the trade. DocuSign envelopes and Stripe Receipts are the right reference class — not photo apps.",
    Icon: Link2
  },
  {
    title: "Build the export to CompanyCam.",
    body: "Don't fight the incumbent on storage. Be the layer they don't ship — settlement and acknowledgement. Tagline I'd test: \"CompanyCam stores. ScopeNod settles.\"",
    Icon: ShieldCheck
  },
  {
    title: "Find the wedge inside the wedge.",
    body: "Mobile detailing is right. The insurance-claim sub-wedge (hail, flood, vandalism valet) is where dispute pain is highest. Run a 10-shop pilot with detailers who already have insurer relationships before going wide.",
    Icon: Flame
  },
  {
    title: "Trademark the noun, not just the name.",
    body: "Lock 'Service Record' as a defined product term and a visual lockup of the QR + green-tick acknowledgement state. The artefact should be recognisable from 2 metres in a service bay — that's the brand asset.",
    Icon: FileBadge
  },
  {
    title: "Make 'nod' a UI verb.",
    body: "Surface 'Nodded by customer at 2:14pm' as the artefact's heartbeat. The brand promise gets carried by the language inside the product, not the marketing site.",
    Icon: CheckCircle2
  }
];

const dontBuild = [
  {
    title: "Scheduling, dispatch, invoicing",
    body: "Every adjacent founder will tell you to add it. It's the slippery slope to Fieldd-lite. Stay clip-on."
  },
  {
    title: "An AI-first headline narrative",
    body: "The PRD is right — AI is the sidekick. Investors who fund 'AI for service' will push you off the artefact thesis."
  },
  {
    title: "EHS / compliance buyer motion",
    body: "Different sales cycle, different buyer, distorts the product. Let SafetyCulture have that lane."
  },
  {
    title: "Native apps before the web record is undeniable",
    body: "The customer side is the moat. Optimise the QR/link experience before you spend a quarter on iOS+Android parity."
  }
];

const northStarMetric = {
  metric: "Service Record acknowledgement rate within 24h",
  green: "≥ 90%",
  yellow: "70–89%",
  red: "< 70%",
  rationale:
    "Not ARR, not seats, not jobs. If issued records reliably come back nodded inside a day, the artefact is sticky enough that no photo-app feature release can catch you. Below 70%, the customer side isn't doing its job and CompanyCam-style incumbents have time to copy it."
};

const gtmPhases = [
  {
    phase: "Day 0–1",
    label: "Lock the brand",
    actions: [
      "Final live check on scopenod.com / .ai / .app — buy in order",
      "Reserve @scopenod (or @scopenodhq) on X, LinkedIn, Instagram, TikTok",
      "Create non-public Apple App Store + Google Play records under ScopeNod",
      "Publish a simple landing page with a waitlist"
    ],
    Icon: ShieldCheck
  },
  {
    phase: "Week 1–2",
    label: "Mark the territory",
    actions: [
      "File trademark in Class 9 + 42 (Class 35 optional) — AU + US + EUIPO same week if budget allows",
      "Set EUIPO trademark watching / alerts",
      "Update product UI, favicon, splash, QR pages, legal docs to ScopeNod",
      "Begin exact-match SEO seeding so 'ScopeNode' technical noise doesn't drift"
    ],
    Icon: Crosshair
  },
  {
    phase: "Month 1",
    label: "Detailer wedge beta",
    actions: [
      "Public beta under ScopeNod, AU mobile detailing only",
      "Distribution: AU detailer Facebook groups, franchise networks, supplier programs",
      "Position against 'photos buried inside a CRM job ticket' — not against the CRMs",
      "Monitor search, app, and social collisions; defensive redirects as needed"
    ],
    Icon: Target
  },
  {
    phase: "Month 2–6",
    label: "Expand the lane",
    actions: [
      "Madrid / priority-window filings for international footprint",
      "Open second wedge: mobile mechanics or property inspection (per PRD expansion list)",
      "Pricing benchmark sheet vs. CompanyCam + ServiceM8 published",
      "Watchlist: SafetyCulture template marketplace, ServiceM8 release notes, CompanyCam blog for 'customer-facing record' signals"
    ],
    Icon: Compass
  }
];

const positioningPillars = [
  {
    label: "Buyer",
    value: "Mobile detail business owner who wants to stop arguing with customers."
  },
  {
    label: "Wedge",
    value: "AU mobile car detailing. Visual, dispute-prone, explainable."
  },
  {
    label: "Centre of gravity",
    value: "The customer-acknowledged Service Record artefact — not the camera, not the AI."
  },
  {
    label: "Posture",
    value: "Clip-on, async-first, AI as a sidekick. Sells next to ServiceM8, not against it."
  }
];

function ThreatPill({ threat }: { threat: Tier["threat"] }) {
  if (threat === "high") return <StatusPill tone="amber">High overlap</StatusPill>;
  if (threat === "medium") return <StatusPill tone="blue">Adjacent</StatusPill>;
  return <StatusPill tone="neutral">Reference</StatusPill>;
}

export default function MarketPage() {
  return (
    <main className="app-bg min-h-screen text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between">
          <Logo tagline />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to product
          </Link>
        </div>

        <section className="mt-14 max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
            Market &amp; go-to-market
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
            Photo apps, detailer CRMs, FSM platforms, inspection tools — each touch one corner of
            the problem.{" "}
            <span className="text-scope-blue">
              The unclaimed centre is the Service Record itself.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            ScopeNod is not entering an empty market. It is entering a fragmented one. This page
            maps the lane, names the competitors that matter, and lays out the AU-first plan to
            secure the centre before anyone else collapses the acknowledgement loop into a feature.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/55">
            <StatusPill tone="green">Live snapshot · 2026-04-25</StatusPill>
            <span className="text-white/35">Preliminary business research, not a legal opinion.</span>
          </div>
        </section>

        <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {marketStats.map(({ label, value, detail, Icon }) => (
            <div key={label} className="camera-glass rounded-2xl p-5">
              <Icon className="h-5 w-5 text-scope-blue" />
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-2 text-xs leading-5 text-white/58">{detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
                Positioning
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                The defensible centre of gravity
              </h2>
            </div>
            <Radar className="hidden h-10 w-10 shrink-0 text-scope-blue/70 sm:block" />
          </div>
          <div className="mt-6 camera-glass rounded-[24px] p-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {positioningPillars.map((pillar) => (
                <div key={pillar.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-scope-blue">
                    {pillar.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/82">{pillar.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
                Competitor map
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Five tiers, ordered most-direct to most-adjacent
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                ScopeNod sits at the intersection of four established categories. The threats most
                worth tracking are the ones that already do <em>more</em> than ScopeNod and could
                collapse the acknowledgement loop into a feature.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {tiers.map((tier) => (
              <div key={tier.number} className="camera-glass rounded-[24px] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-scope-blue text-sm font-bold text-white">
                      {tier.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">{tier.name}</h3>
                      <p className="mt-1 text-xs text-white/55">{tier.shape}</p>
                    </div>
                  </div>
                  <ThreatPill threat={tier.threat} />
                </div>
                <ul className="mt-5 space-y-2">
                  {tier.examples.map((example) => (
                    <li
                      key={example}
                      className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/72"
                    >
                      <tier.Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-scope-blue" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl border border-scope-blue/20 bg-scope-blue/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-scope-blue">
                    Read for ScopeNod
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/82">{tier.read}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="camera-glass rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-scope-green" />
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-green">
                Where we win
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              Cross-category whitespace, in priority order
            </h2>
            <ol className="mt-5 space-y-3">
              {winWedges.map((wedge, index) => (
                <li
                  key={wedge.title}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-scope-green/15 text-sm font-bold text-scope-green">
                    {index + 1}
                  </span>
                  <span>
                    <h3 className="text-sm font-semibold">{wedge.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/58">{wedge.body}</p>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="camera-glass rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-scope-amber" />
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-amber">
                Where we're exposed
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              Honest read of the risks
            </h2>
            <ul className="mt-5 space-y-3">
              {exposures.map((risk) => (
                <li
                  key={risk.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold">{risk.title}</h3>
                    {risk.severity === "amber" ? (
                      <StatusPill tone="amber">Watch</StatusPill>
                    ) : (
                      <StatusPill tone="neutral">Monitor</StatusPill>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/58">{risk.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-amber">
                Beyond the docs · my take
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Six calls I'd make that aren't already in the markdown
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                The market analysis maps the lane well. These are the opinionated moves I'd add on
                top — pricing, moat construction, naming, and the wedge inside the wedge.
              </p>
            </div>
            <StatusPill tone="amber">Opinion, not summary</StatusPill>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTake.map(({ title, body, Icon }) => (
              <div key={title} className="camera-glass rounded-[24px] p-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-scope-amber/15 text-scope-amber">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold leading-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
                Pricing benchmark
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                What buyers will compare ScopeNod against
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                ScopeNod's solo plan should be readable next to CompanyCam and ServiceM8 — the two
                anchor prices most operators already know.
              </p>
            </div>
          </div>
          <div className="mt-6 camera-glass overflow-hidden rounded-[24px]">
            <div className="hidden grid-cols-[1.1fr_1.1fr_1.4fr] gap-4 border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white/55 sm:grid">
              <span>Product</span>
              <span>Pricing</span>
              <span>What it sells</span>
            </div>
            <ul>
              {pricingBenchmarks.map((row) => (
                <li
                  key={row.product}
                  className={
                    row.highlight
                      ? "grid gap-2 border-b border-white/10 bg-scope-blue/[0.08] px-6 py-4 text-sm sm:grid-cols-[1.1fr_1.1fr_1.4fr] sm:gap-4"
                      : "grid gap-2 border-b border-white/10 px-6 py-4 text-sm last:border-b-0 sm:grid-cols-[1.1fr_1.1fr_1.4fr] sm:gap-4"
                  }
                >
                  <span
                    className={
                      row.highlight
                        ? "flex items-center gap-2 font-semibold text-scope-blue"
                        : "font-semibold text-white"
                    }
                  >
                    {row.highlight ? <Sparkles className="h-4 w-4" /> : null}
                    {row.product}
                  </span>
                  <span className="text-white/72">{row.pricing}</span>
                  <span className="text-white/58">{row.angle}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-amber">
                Recommended pricing structure
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Free at the bottom, per-record at the top
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                Don't compete on seats — competitors already won that frame. Compete on the unit
                of value buyers actually consume: a finished, customer-acknowledged record.
              </p>
            </div>
            <StatusPill tone="amber">My recommendation</StatusPill>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlan.map(({ tier, price, cadence, rationale, Icon }) => (
              <div key={tier} className="camera-glass rounded-[24px] p-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-scope-blue/15 text-scope-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                  {tier}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{price}</p>
                <p className="mt-1 text-xs text-white/55">{cadence}</p>
                <p className="mt-3 text-xs leading-5 text-white/68">{rationale}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-amber">
                Distribution beyond Facebook groups
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Where the early Service Records actually come from
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                The doc lists detailer Facebook groups and franchise networks. They're real but
                slow. These are the channels I'd prioritise above them.
              </p>
            </div>
            <StatusPill tone="amber">My recommendation</StatusPill>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {distributionChannels.map(({ name, detail, tone }) => (
              <div key={name} className="camera-glass rounded-[24px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-tight">{name}</h3>
                  {tone === "high" ? (
                    <StatusPill tone="green">Priority</StatusPill>
                  ) : (
                    <StatusPill tone="neutral">Background</StatusPill>
                  )}
                </div>
                <p className="mt-3 text-xs leading-5 text-white/68">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="camera-glass rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-scope-amber" />
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-amber">
                Do not build (yet)
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              The four temptations that will kill the wedge
            </h2>
            <ul className="mt-5 space-y-3">
              {dontBuild.map(({ title, body }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/58">{body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="camera-glass rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-scope-green" />
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-green">
                North-star metric
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              {northStarMetric.metric}
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-scope-green/30 bg-scope-green/10 p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-scope-green">
                  Healthy
                </p>
                <p className="mt-2 text-xl font-semibold text-scope-green">
                  {northStarMetric.green}
                </p>
              </div>
              <div className="rounded-2xl border border-scope-amber/30 bg-scope-amber/10 p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-scope-amber">
                  Watch
                </p>
                <p className="mt-2 text-xl font-semibold text-scope-amber">
                  {northStarMetric.yellow}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                  Broken
                </p>
                <p className="mt-2 text-xl font-semibold text-white/72">
                  {northStarMetric.red}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/68">{northStarMetric.rationale}</p>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
                GTM playbook
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Lock the brand. Mark the territory. Win the wedge.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                Sequenced rollout based on the brand-clearance plan and the AU-first detailer
                wedge. Every phase has one job.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {gtmPhases.map(({ phase, label, actions, Icon }) => (
              <div key={phase} className="camera-glass rounded-[24px] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-scope-blue/15 text-scope-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-scope-blue">
                        {phase}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold leading-tight">{label}</h3>
                    </div>
                  </div>
                </div>
                <ul className="mt-5 space-y-2">
                  {actions.map((action) => (
                    <li
                      key={action}
                      className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/72"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-scope-green" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 camera-glass rounded-[24px] p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
            Bottom line
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Stay narrow. Price by record. Make the artefact a noun in the trade.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
            Photo apps want to be photo libraries. CRMs want to be CRMs. EHS platforms want
            compliance leaders. None of them wants to ship a customer-acknowledged Service Record
            as the centre of the product — so ScopeNod should. The competitive map names the lane,
            but the moat is built by pricing posture, the URL pattern, and the wedge inside the
            wedge: AU mobile detailers with insurer relationships and a cold artefact problem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-scope-blue px-5 text-sm font-semibold text-white transition hover:bg-scope-blue/90"
            >
              See the product
            </Link>
            <Link
              href="/moodboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white/82 transition hover:border-white/30 hover:text-white"
            >
              Moodboard
            </Link>
          </div>
        </section>

        <footer className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Sourced from <code className="text-white/65">ScopeNod_market_analysis.md</code> and{" "}
            <code className="text-white/65">ScopeNod.md</code>. Pricing &amp; positioning drift
            over time.
          </span>
          <span>© ScopeNod · 2026</span>
        </footer>
      </div>
    </main>
  );
}
