import { MetadataRoute } from "next";

const BASE_URL = "https://tennessee-toss.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicPages = [
    { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/menu", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/build", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/cart", changeFrequency: "weekly" as const, priority: 0.6 },
  ];

  const locales = ["en", "es"] as const;

  return publicPages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );
}
