export interface LegacyEssayGroupConfig {
  label: string;
  slug: string;
  items: string[];
}

export const ACHIEVEMENT_CATEGORY_SLUGS = new Set(["drdo-achievements", "achievements", "professional-achievements", "career-highlights"]);

export const STRUCTURAL_PAGE_SLUGS = new Set([
  "home",
  "about",
  "blog",
  "essays",
  "achievements",
  "defence-issues",
  "science-and-technology",
  "short-stories",
  "random-thoughts",
  "travelogues",
  "movie-mania",
  "sample-page"
]);

export const LEGACY_ESSAY_GROUPS: LegacyEssayGroupConfig[] = [
  {
    label: "Defence Issues",
    slug: "defence-issues",
    items: [
      "autonomous-weapons-the-future-of-warfare-and-what-it-means-for-india",
      "drdo-achievements-and-the-way-ahead",
      "significance-of-science-and-technology-base-in-strategic-decisions",
      "challenging-the-technology-barriers-to-safeguard-the-national-frontiers-2",
      "siachen",
      "how-to-create-brand-drdo"
    ]
  },
  {
    label: "Science and Technology",
    slug: "science-and-technology",
    items: [
      "popularizing-science",
      "hr-challenges-of-tomorrow-for-r-d-organizations",
      "women-scientists-paradox-two-steps-forward-one-step-backward",
      "women-scientists"
    ]
  },
  {
    label: "Short Stories",
    slug: "short-stories",
    items: ["the-hold"]
  },
  {
    label: "Random Thoughts",
    slug: "random-thoughts",
    items: ["nirbhaya-a-crusade-for-fearless-existence-of-women", "handlooms-in-the-21st-century"]
  },
  {
    label: "Travelogues",
    slug: "travelogues",
    items: ["kasol", "triloknath-conflunce-of-buddhism-and-hinduism"]
  },
  {
    label: "Movie Mania",
    slug: "movie-mania",
    items: []
  }
];

export function getLegacyGroupForSlug(slug: string): LegacyEssayGroupConfig | undefined {
  return LEGACY_ESSAY_GROUPS.find((group) => group.items.includes(slug));
}

export function getLegacyEssaySlugs(): Set<string> {
  return new Set(LEGACY_ESSAY_GROUPS.flatMap((group) => group.items));
}
