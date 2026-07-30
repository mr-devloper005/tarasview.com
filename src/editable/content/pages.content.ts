import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'A hand-kept library of the internet',
      description:
        'Curated links, tools and references — organised into open collections. A quiet corner of the web, kept by the community.',
      openGraphTitle: 'A hand-kept library of the internet',
      openGraphDescription:
        'Curated links, tools and references — organised into open collections.',
      keywords: ['bookmarks', 'collections', 'resources', 'curated links', 'web library'],
    },
    hero: {
      badge: 'Open library · community-kept',
      title: ['A hand-kept', 'library of the', 'internet.'],
      description:
        'Links, tools and references — collected by the community and organised into open collections. Slow, deliberate, and kept in the open.',
      primaryCta: { label: 'Open the library', href: '/sbm' },
      secondaryCta: { label: 'Browse collections', href: '/sbm' },
      searchPlaceholder: 'Search the library — tools, references, essays…',
      focusLabel: 'This week',
      featureCardBadge: 'On the shelves',
      featureCardTitle: 'Every collection is a shelf, kept by hand.',
      featureCardDescription:
        'New links land on the shelves each day. Follow a collection, or start your own reading route through them.',
      marqueeWords: [
        'BOOKMARKS',
        'COLLECTIONS',
        'FIELD NOTES',
        'REFERENCES',
        'RESOURCES',
        'READING LISTS',
        'TOOLS',
        'STUDIOS',
      ],
    },
    intro: {
      badge: 'On the shelves',
      title: 'A slow library — one collection, one link at a time.',
      paragraphs: [
        'The library is a set of open collections, kept by hand. Every link is added deliberately, tagged, and placed on a shelf someone will actually reach for.',
        'Some collections read like reading lists. Others behave like reference shelves — quick lookups, workbooks, and studio bookmarks. Every collection is public, and every link is worth the click.',
        'Follow along, save what you need, and contribute the pieces you keep coming back to.',
      ],
      sideBadge: 'What lives here',
      sidePoints: [
        'Open, tagged collections — no dark corners, no locked reading rooms.',
        'Hand-added links, one at a time — no crawler dumps, no auto-fills.',
        'A search that reaches through titles, notes, tags and domains.',
        'A quiet interface — the links are the point, not the chrome.',
      ],
      primaryLink: { label: 'Open the library', href: '/sbm' },
      secondaryLink: { label: 'Read about the library', href: '/about' },
    },
    features: [
      {
        title: 'Every link is placed by a person.',
        body: 'Nothing is scraped. Every entry is opened, read, and filed under a shelf that someone will reach for later.',
      },
      {
        title: 'Collections that behave like shelves.',
        body: 'Design references, developer utilities, small studios, field notes — each collection reads like a topic, not a tag cloud.',
      },
      {
        title: 'Search that follows the links, not the noise.',
        body: 'One search box, calm results, and a quick filter across shelves. No ads in the results, no upsells for a paid tier.',
      },
      {
        title: 'Open by default.',
        body: 'Every collection is public and permalinkable. Share one link, and a friend lands on the same shelf you did.',
      },
    ],
    stats: [
      { label: 'Links on the shelves', metric: 'shelved' },
      { label: 'Collections in the open', metric: 'open' },
      { label: 'Contributors keeping the library', metric: 'contributors' },
      { label: 'New links this week', metric: 'weekly' },
    ],
    socialProof: {
      eyebrow: 'On the shelves this month',
      title: '“A quiet corner of the web I actually come back to.”',
      note: 'From the notebook of a reader who has been with us since the first collection went up.',
    },
    faq: {
      eyebrow: 'Small print',
      title: 'A few things people usually ask.',
      items: [
        {
          question: 'What is the library, exactly?',
          answer:
            'A set of open, hand-kept collections of links — tools, references, essays, and studio bookmarks — organised so a person can reach for them. Every collection is public.',
        },
        {
          question: 'Who adds the links?',
          answer:
            'The community. Anyone with an account can suggest a link into a collection. Nothing is scraped or auto-imported.',
        },
        {
          question: 'How do the collections work?',
          answer:
            'Each collection is a shelf on a topic. Design references, developer tools, field notes, studios, and reading lists all live on their own shelves — permalinkable, filterable, and open.',
        },
        {
          question: 'Is the library free?',
          answer: 'Yes — every collection and every link is free to read and to share, forever.',
        },
      ],
    },
    cta: {
      badge: 'Keep the library going',
      title: 'Add the links you keep coming back to.',
      description:
        'The library grows one contribution at a time. Add the tool you open every morning, or the essay you keep re-sending — someone else has been looking for it.',
      primaryCta: { label: 'Contribute a link', href: '/create' },
      secondaryCta: { label: 'Talk to us', href: '/contact' },
    },
    taskSection: {
      heading: 'On the shelves',
      descriptionSuffix: 'The most recent links on the library.',
    },
  },
  about: {
    badge: 'About',
    title: 'A hand-kept library of the internet.',
    description: `${slot4BrandConfig.siteName} is a quiet corner of the web — a set of open, community-kept collections of links, tools, and references.`,
    paragraphs: [
      'It began as a shared notebook — a way to keep track of the tools and essays a small group kept re-sending each other. Over time it grew into a public library, kept in the open, organised into shelves anyone can reach for.',
      'Every collection is public. Every link is placed by a person, not a crawler. There are no dark patterns, no locked reading rooms, and no algorithms deciding what you get to see next.',
      'The library is slow on purpose. Links land one at a time. Shelves fill up because someone thought about them.',
    ],
    values: [
      {
        title: 'Kept by hand.',
        description:
          'Every link is added by a person who read it first. Nothing is scraped, nothing is auto-imported, nothing lands on a shelf by accident.',
      },
      {
        title: 'Open by default.',
        description:
          'Every collection and every link is public and permalinkable. The whole library is one big open shelf — share any part of it freely.',
      },
      {
        title: 'Quiet, on purpose.',
        description:
          'No ads on the collections, no popups, no upsell to a paid tier. Just links, laid out so a person can reach for them.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Say hello to the people who keep the library.',
    description:
      'Suggest a collection, flag a broken link, or send us a note about the small studio you think we should be following. Every message is read by a person.',
    formTitle: 'Send a note',
  },

  search: {
    metadata: {
      title: 'Search the library',
      description: 'Search across every collection, link, tag and note in the library.',
    },
    hero: {
      badge: 'Search the library',
      title: 'Find the link, faster.',
      description:
        'Search through every collection and every link on the shelves. Try a topic, a tool name, a domain, or the exact phrase you remember.',
      placeholder: 'Search titles, notes, tags, or domains…',
    },
    resultsTitle: 'On the shelves right now',
  },
  create: {
    metadata: {
      title: 'Contribute a link',
      description: 'Add a link to the library.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to contribute a link.',
      description:
        'Contributors add links, notes and shelves to the library. Sign in to your account and we will open the contribution desk.',
    },
    hero: {
      badge: 'Contribution desk',
      title: 'Add a link to the library.',
      description:
        'Give the link a title, drop it on a shelf, and add a note about why it belongs there. Everything is public the moment you save it.',
    },
    formTitle: 'Link details',
    submitLabel: 'Add to the library',
    successTitle: 'Added to the library.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to the library.',
      badge: 'Contributor sign-in',
      title: 'Welcome back to the library.',
      description:
        'Sign in to add links, keep track of collections you are following, and pick up where you left off.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount:
        'That account was not found. Create one first, then sign in.',
      success: 'Signed in. Taking you back to the library…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create an account for the library.',
      badge: 'New contributor',
      title: 'Get a library card.',
      description:
        'Create an account to contribute links, save collections, and keep a small notebook of the shelves you follow.',
      formTitle: 'Create an account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least four characters for the password.',
      success: 'Account created. Taking you to the library…',
      loginCta: 'Sign in instead',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'More from the notebook',
      fallbackTitle: 'Notebook entry',
    },
    listing: {
      relatedTitle: 'More like this',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'More from the gallery',
      fallbackTitle: 'Visual entry',
    },
    profile: {
      relatedTitle: 'Their contributions',
      fallbackDescription: 'A curator page — direct link only.',
      visitButton: 'Visit official site',
    },
    sbm: {
      relatedTitle: 'More from this collection',
      fallbackTitle: 'Link details',
      visitButton: 'Visit resource',
      trustPanel: {
        title: 'On the shelf',
        note: 'Every link is placed by a person and reviewed before it lands here.',
        points: [
          'Human-added, not scraped',
          'Public and permalinkable',
          'Filed under a collection',
        ],
      },
      facts: {
        collection: 'Collection',
        domain: 'Domain',
        verified: 'Verified',
      },
    },
  },
} as const
