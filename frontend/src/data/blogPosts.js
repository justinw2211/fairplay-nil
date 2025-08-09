export const blogPosts = [
  {
    slug: 'welcome-to-fairplay-nil',
    title: 'Welcome to FairPlay NIL',
    date: '2025-08-01',
    author: 'FairPlay Team',
    excerpt: 'Our mission and what athletes can expect from the platform.',
    content: [
      'Welcome to FairPlay NIL — a platform designed to help student‑athletes manage deals, stay compliant, and understand fair value.',
      'This blog will share guidance, platform updates, and stories from the NIL ecosystem. Subscribe and check back for more posts.'
    ].join('\n\n'),
    coverImage: null
  }
  ,
  {
    slug: 'nil-landscape-june-2025',
    title: 'NIL in College Sports – State of the Landscape as of June 1, 2025',
    date: '2025-06-01',
    author: 'FairPlay Team',
    excerpt: 'Where NIL stands as of June 1, 2025: laws, headline deals, trends, and the economic impact across college sports.',
    content: [
      'Introduction\nNearly two years after the NCAA’s decision to allow athletes to profit from their Name, Image, and Likeness (NIL), college sports has entered a new era. This piece reviews the landscape up to June 1, 2025 — legal developments, headline deals, key trends, and economic impacts — with analysis on what it means.',
      'Legal and Legislative Updates\nThe NCAA’s July 1, 2021 interim policy opened NIL nationwide while deferring to state laws, creating a patchwork across 30+ states. By 2023–2024, calls for a uniform standard grew as inducement‑like promises and uneven enforcement surfaced. As of mid‑2025 no federal bill has passed; several proposals exist. The NCAA added transparency (reporting, disclosures) and clarified collective definitions, but enforcement remains limited.',
      'High‑Profile Deals\nSeven‑figure packages emerged for elite football QBs, while women’s sports surged via social reach — LSU’s Livvy Dunne and Iowa’s Caitlin Clark became major earners. Teamwide/group licensing grew (e.g., EA Sports College Football payouts). Many athletes launched businesses and content brands. Most earnings are concentrated among stars, with a long tail of modest local deals.',
      'Trends\nBooster‑funded collectives dominate NIL spend and often function like quasi‑payroll, fueling recruiting/pay‑for‑play concerns. The transfer portal plus NIL resembles free agency; transfers often increase earnings. Positives: athlete education (contracts, taxes, branding) and improved retention as some stars stay in school longer. Challenges: competitive balance, locker‑room dynamics, compliance gray zones, and disparities between well‑funded programs and the rest.',
      'Economic Impacts\nBooster dollars are redirected from facilities/endowments toward NIL, so ADs plan around an effective NIL budget. Benefits include keeping stars longer and amplifying university brand reach; risks include widening haves vs. have‑nots and pressure on non‑revenue sports. A sustainable model likely lies between free‑for‑all and old amateurism: clear rules, transparency, protections — without rolling back athlete rights.'
    ].join('\n\n'),
    coverImage: null
  }
];

export function getAllPosts() {
  return [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null;
}

export default blogPosts;


