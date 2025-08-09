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
  },
  {
    slug: 'nil-landscape-june-2025',
    title: 'NIL in College Sports – State of the Landscape as of June 1, 2025',
    date: '2025-06-01',
    author: 'FairPlay Team',
    excerpt: 'A concise review of the NIL landscape through June 1, 2025: laws and enforcement, headline deals, market trends, and economic impacts on programs.',
    content: [
      'Introduction\nNearly two years after the NCAA’s decision to allow athletes to profit from their Name, Image, and Likeness (NIL), college sports has entered a new era of opportunity and strain. From football to Olympic sports, athletes are monetizing personal brands, donors are organizing collectives, and schools are adapting. This first of three monthly installments reviews the NIL landscape up to June 1, 2025 — legal developments, high‑profile deals, emerging trends, and economic effects — with practical analysis on what it means.',
      'Legal and Legislative Updates to Date\nThe Dawn of NIL (July 1, 2021) opened the door for all student‑athletes to earn from endorsements, appearances, social media, and more. The NCAA took a hands‑off interim policy and deferred to states, producing a patchwork of 30+ state laws. By 2023–2024, leaders increasingly called for a uniform standard as stories of “promises made but not kept” and inducement‑like offers surfaced. As of mid‑2025, multiple federal NIL bills exist but none have passed; state updates continue, some explicitly empowering schools/boosters. The NCAA added modest transparency rules (reporting deals, NIL portal, >$600 disclosure) and clarified collective definitions, but meaningful enforcement remains limited. Even as the NCAA reiterates that pay‑for‑play and recruiting inducements are banned, practical proof and enforcement are difficult. The net result is a fragmented system with rising calls for a single national framework.',
      'High‑Profile NIL Deals and Endorsements\nThe marketplace exploded: seven‑figure packages for elite quarterbacks, reported multi‑million commitments tied to collectives, and major commercial endorsements. Women’s sports surged: LSU’s Livvy Dunne and Iowa’s Caitlin Clark became NIL powerhouses, demonstrating that social reach and on‑court success both convert. Teamwide and group licensing grew (e.g., EA Sports College Football payments), and athletes launched entrepreneurial ventures. While a minority of stars earn seven figures, a long tail earns modest sums from local sponsorships, camps, or digital content. Empowerment is real, but the boundary between genuine endorsement value and pay‑for‑play via collectives is often blurred.',
      'Trends in the NIL Era\nCollectives dominate spend and drive concerns that NIL is functioning as quasi‑payroll and recruiting leverage. The transfer portal plus NIL resembles free agency; athletes who transfer often increase earnings, and coaches re‑recruit their own rosters annually. Positively, NIL has accelerated athlete education in contracts, taxes, and brand building and has encouraged some stars to remain in school longer. Non‑revenue sports also benefit where donor interest and social media lift visibility. Challenges include competitive balance, locker‑room dynamics, compliance gray zones, and uneven access between well‑funded programs and others.',
      'Economic Impact on Schools and Programs\nBooster dollars are being redirected to NIL, forcing ADs to rethink budgets. Many programs now plan around an effective “NIL line‑item” to remain competitive. Benefits include stronger retention (stars staying longer) and rising institutional brand reach via athlete creators. Risks include widening gaps between haves and have‑nots, pressure on non‑revenue sports, and donor substitution away from facilities/scholarships. Administrators and policymakers are exploring models that preserve athlete compensation while sustaining broad participation. A sustainable path likely lies between free‑for‑all and old amateurism — clear rules, transparency, and protections without rolling back earned athlete rights.'
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


