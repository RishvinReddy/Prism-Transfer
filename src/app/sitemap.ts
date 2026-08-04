import { MetadataRoute } from "next";
import { comparisons, guides, docs, blogPosts } from "@/data/seoContent";

const BASE_URL = "https://prismtransfer-rishvinreddy.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/receive",
    "/send",
    "/settings",
    "/simulator",
    "/privacy",
    "/security",
    "/faq",
    "/terms",
    "/changelog",
    "/roadmap",
    "/whitepaper",
    "/open-source",
    "/guides",
    "/blog",
    "/compare",
    "/portfolio",
    "/author/rishvin-reddy",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority:
      path === "" ? 1.0
      : path === "/author/rishvin-reddy" ? 0.9
      : path === "/portfolio" ? 0.8
      : path === "/about" ? 0.8
      : 0.7,
  }));

  // Append comparison entries
  comparisons.forEach((item) => {
    sitemapEntries.push({
      url: `${BASE_URL}/compare/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  // Append guide entries
  guides.forEach((item) => {
    sitemapEntries.push({
      url: `${BASE_URL}/guides/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Append documentation entries
  docs.forEach((item) => {
    sitemapEntries.push({
      url: `${BASE_URL}/docs/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  // Append blog entries
  blogPosts.forEach((item) => {
    sitemapEntries.push({
      url: `${BASE_URL}/blog/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  return sitemapEntries;
}
