import { buildLocalizedPath, getLocaleConfig, SUPPORTED_LOCALES, type LocaleCode } from '../i18n';

export const LEGAL_LAST_UPDATED = 'June 2026';
export const LEGAL_MAIN_EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL?.trim() || 'info@bboyarena.org';

export const LEGAL_PATHS = {
  privacy: '/privacy',
  cookies: '/cookies',
  terms: '/terms',
  openDevelopment: '/open-development',
  contact: '/contact'
} as const;

export type LegalPageKey = keyof typeof LEGAL_PATHS;

export interface LegalContactRow {
  label: string;
  value: string;
  href?: string;
  note?: string;
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  list?: string[];
  contacts?: LegalContactRow[];
  callout?: string;
}

export interface LegalPageCopy {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

const privacyPage: LegalPageCopy = {
  title: 'Privacy Policy',
  description:
    'Learn how BBoyArena handles privacy-friendly analytics, controller details, retention, and GDPR rights.',
  intro:
    'BBoyArena is an independent project dedicated to breaking culture, creative movement, and experimental game development. This policy explains the limited data we handle and how we keep it privacy-conscious.',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        'BBoyArena is a public project focused on breaking culture, creative movement, and experimental game development. The site is intentionally small, readable, and community-driven.'
      ]
    },
    {
      title: 'Data Controller',
      contacts: [
        {
          label: 'Controller',
          value: 'Giorgio Tedesco'
        },
        {
          label: 'Privacy contact',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        }
      ]
    },
    {
      title: 'What data we collect',
      list: [
        'Basic analytics about page visits and interactions.',
        'Referrers, browser type, operating system, approximate country, and technical events.',
        'Information you intentionally send to us through future contact or project features.',
        'Limited technical logs needed to keep the site stable and secure.'
      ]
    },
    {
      title: 'Privacy-friendly analytics',
      paragraphs: [
        'Analytics are collected through a self-hosted Umami instance available through get.giorgiotedesco.it.',
        'BBoyArena does not use advertising trackers, behavioral profiling, or third-party advertising analytics.',
        'BBoyArena does not use analytics cookies for profiling purposes.'
      ]
    },
    {
      title: 'Legal basis',
      paragraphs: [
        'The processing of aggregated analytics data is based on legitimate interest: understanding how the website is used, improving the project, detecting technical issues, and measuring public interest.'
      ]
    },
    {
      title: 'Where data is processed',
      paragraphs: [
        'Data is processed on the infrastructure used to operate BBoyArena, its privacy contact services, and the self-hosted analytics instance. Depending on hosting and service configuration, processing may happen in the EU/EEA or in other countries with appropriate safeguards where required.'
      ]
    },
    {
      title: 'Data retention',
      paragraphs: [
        'Analytics data is retained only for as long as reasonably necessary for the purposes described above, and in any case no longer than 24 months unless required for security or legal reasons.'
      ]
    },
    {
      title: 'Your GDPR rights',
      list: [
        'Access your personal data.',
        'Request rectification of inaccurate data.',
        'Request erasure where applicable.',
        'Request restriction of processing.',
        'Receive data portability where applicable.',
        'Object to processing based on legitimate interest.',
        'Lodge a complaint with the competent supervisory authority.'
      ]
    },
    {
      title: 'Children / minors',
      paragraphs: [
        `BBoyArena is not intended to intentionally collect personal data from children under 16. If a parent or guardian believes that a minor has provided personal data, they can contact ${LEGAL_MAIN_EMAIL}.`
      ]
    },
    {
      title: 'Contact',
      contacts: [
        {
          label: 'Privacy requests',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        },
        {
          label: 'Privacy website',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        }
      ]
    }
  ]
};

const cookiesPage: LegalPageCopy = {
  title: 'Cookie Policy',
  description:
    'Understand how BBoyArena uses only essential cookies, privacy-friendly analytics, and future updates.',
  intro:
    'This policy explains the small cookie footprint of BBoyArena. The project avoids profiling and advertising cookies, and keeps the site simple unless a feature truly needs something technical.',
  sections: [
    {
      title: 'Cookies at a glance',
      paragraphs: [
        'BBoyArena does not use advertising cookies.',
        'BBoyArena does not use profiling cookies.',
        'Analytics are provided through a self-hosted Umami instance and are intended to operate without analytics cookies for profiling.'
      ]
    },
    {
      title: 'Technical cookies',
      paragraphs: [
        'Technical cookies may be used only if they are strictly necessary for site functionality, security, or a feature that the user actively requests.',
        'If future features introduce login, preferences, multiplayer sessions, or community accounts, this policy may be updated to explain the new technical needs.'
      ]
    },
    {
      title: 'Analytics',
      paragraphs: [
        'The analytics setup is meant to gather aggregated usage information, not to identify people individually or build behavioral profiles.',
        'Where Umami is configured without cookies, BBoyArena does not use analytics cookies for profiling purposes.'
      ]
    },
    {
      title: 'Updates',
      paragraphs: [
        'This policy may change if the project adds interactive account features, saved preferences, or other capabilities that require technical cookies. Any future update will aim to stay minimal and clearly documented.'
      ]
    }
  ]
};

const termsPage: LegalPageCopy = {
  title: 'Terms of Service',
  description:
    'Read the basic terms for using BBoyArena, including community conduct, experimental features, and liability limits.',
  intro:
    'These terms are written for a small public project that may evolve quickly. They are meant to be clear, respectful, and easy to revisit as the project grows.',
  sections: [
    {
      title: 'Acceptance of terms',
      paragraphs: [
        'By accessing or using BBoyArena, you agree to these terms. If you do not agree, please do not use the website or any future interactive features.'
      ]
    },
    {
      title: 'Nature of the project',
      paragraphs: [
        'BBoyArena is a community-driven, experimental, and public-facing project. It is intended to evolve over time and may include features distributed through GitHub, IPFS, or Arweave in the future.'
      ]
    },
    {
      title: 'Independent project disclaimer',
      paragraphs: [
        'BBoyArena is an independent project. It is not affiliated with, endorsed by, sponsored by, or connected to Sony, B-Boy, B-Boy The Game, or any other trademark holder.',
        'All trademarks, names, logos, and references belong to their respective owners. BBoyArena may cite cultural or historical inspirations, but it is not presented as an official product, sequel, or replacement.'
      ]
    },
    {
      title: 'Intellectual property',
      paragraphs: [
        'Unless otherwise stated, the visual presentation, code, text, and original project materials published on BBoyArena remain protected by applicable intellectual property laws.',
        'Third-party trademarks, logos, and names remain the property of their respective owners.'
      ]
    },
    {
      title: 'User content',
      paragraphs: [
        'Users retain ownership of their own content.',
        'By uploading or submitting content to BBoyArena in future community features, users may grant BBoyArena a non-exclusive license to display, host, reproduce, and share that content within the platform and related project communication.',
        'Specific rules may be added when those features become available.'
      ]
    },
    {
      title: 'Community conduct',
      list: [
        'Harassment',
        'Hate speech',
        'Spam',
        'Cheating',
        'Exploiting vulnerabilities',
        'Impersonation',
        'Illegal activity',
        'Uploading content that violates the rights of others'
      ]
    },
    {
      title: 'Experimental features',
      paragraphs: [
        'The project may change, break, pause, or be discontinued. Features may be incomplete, experimental, or temporarily unavailable while the project is still evolving.'
      ]
    },
    {
      title: 'Availability',
      paragraphs: [
        'BBoyArena is provided on an as-available basis. We aim to keep the site stable, but we cannot promise uninterrupted uptime or permanent availability for every feature.'
      ]
    },
    {
      title: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by applicable law, BBoyArena is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the site or any experimental feature.',
        'You use the project at your own discretion and accept that public, evolving software can change without notice.'
      ]
    },
    {
      title: 'Changes to the terms',
      paragraphs: [
        'These terms may be updated from time to time. The current version will be the one published on this page, with the last updated date shown above.'
      ]
    },
    {
      title: 'Contact',
      contacts: [
        {
          label: 'Project website',
          value: 'bboyarena.org',
          href: 'https://bboyarena.org'
        },
        {
          label: 'Privacy contact',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        }
      ]
    }
  ]
};

const openDevelopmentPage: LegalPageCopy = {
  title: 'Open Development',
  description:
    'Learn how BBoyArena stays public, evolving, and open to future distribution through GitHub, IPFS, and Arweave.',
  intro:
    'BBoyArena is a small public surface with a moving project behind it. It starts as a public, evolving project, and the development process is part of the story.',
  sections: [
    {
      title: 'A public surface',
      paragraphs: [
        'What you see here is the front edge of a project that may continue to shift behind the scenes. The goal is to keep the public face simple while the work remains active and open to change.'
      ]
    },
    {
      title: 'How it may evolve',
      list: [
        'Development may happen through GitHub.',
        'Future versions may explore decentralized distribution through IPFS.',
        'Future versions may explore archival distribution through Arweave.',
        'The project may also add community-facing workflows as it grows.'
      ]
    },
    {
      title: 'Why open development matters',
      paragraphs: [
        'The goal is to preserve and reinterpret breaking culture through interactive media. Open development makes room for iteration, transparency, and public conversation while the project finds its shape.'
      ]
    },
    {
      title: 'What this project is doing',
      paragraphs: [
        'BBoyArena is not trying to own breaking culture. It is built by an enthusiast, for people who care about movement, style, rhythm, battle culture, and experimentation.',
        'The project is meant to feel grounded, respectful, and still in motion.'
      ]
    },
    {
      title: 'Future note',
      paragraphs: [
        'This page may grow with release notes, repository links, and project history as BBoyArena expands. For now, it acts as a simple statement of direction.'
      ]
    }
  ]
};

const contactPage: LegalPageCopy = {
  title: 'Contact',
  description:
    'Find the official contact points for BBoyArena, including privacy requests, analytics, and project status.',
  intro:
    `If you need to reach the project, this page keeps the main contact details in one place. For general messages and privacy requests, use ${LEGAL_MAIN_EMAIL}.`,
  sections: [
    {
      title: 'Project',
      contacts: [
        {
          label: 'Project',
          value: 'BBoyArena'
        },
        {
          label: 'Website',
          value: 'bboyarena.org',
          href: 'https://bboyarena.org'
        }
      ]
    },
    {
      title: 'Privacy / data requests',
      contacts: [
        {
          label: 'Main email',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        }
      ]
    },
    {
      title: 'Analytics endpoint',
      contacts: [
        {
          label: 'Analytics service',
          value: 'get.giorgiotedesco.it',
          href: 'https://get.giorgiotedesco.it'
        }
      ]
    },
    {
      title: 'General contact',
      contacts: [
        {
          label: 'Email',
          value: LEGAL_MAIN_EMAIL,
          href: `mailto:${LEGAL_MAIN_EMAIL}`
        }
      ]
    }
  ]
};

export const LEGAL_PAGES: Record<LegalPageKey, LegalPageCopy> = {
  privacy: privacyPage,
  cookies: cookiesPage,
  terms: termsPage,
  openDevelopment: openDevelopmentPage,
  contact: contactPage
};

export const getLegalPageCopy = (pageKey: LegalPageKey) => LEGAL_PAGES[pageKey];

export const getLegalSwitcherLinks = (pageKey: LegalPageKey) => {
  const pagePath = LEGAL_PATHS[pageKey];
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    label: getLocaleConfig(locale).nativeLabel,
    path: buildLocalizedPath(locale, pagePath)
  }));
};
