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
];

export function getAllPosts() {
  return [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null;
}

export default blogPosts;


