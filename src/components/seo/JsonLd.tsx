import * as React from "react";

export interface WebApplicationSchema {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  browserRequirements: string;
  features: string[];
}

export interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  founder: string;
}

export interface FAQSchema {
  questions: { q: string; a: string }[];
}

export interface HowToSchema {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}

export interface BreadcrumbSchema {
  items: { name: string; item: string }[];
}

interface JsonLdProps {
  type: "WebApplication" | "Organization" | "FAQPage" | "HowTo" | "BreadcrumbList" | "WebSite";
  data: any;
}

export function JsonLd({ type, data }: JsonLdProps) {
  let schema: any = null;

  if (type === "WebApplication") {
    schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": data.name,
      "description": data.description,
      "url": data.url,
      "applicationCategory": data.applicationCategory || "UtilityApplication",
      "operatingSystem": data.operatingSystem || "All",
      "browserRequirements": data.browserRequirements || "Requires HTML5 getUserMedia and IndexedDB support.",
      "softwareVersion": "1.0.0",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": data.features || []
    };
  } else if (type === "Organization") {
    schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": data.name,
      "url": data.url,
      "logo": data.logo,
      "founder": {
        "@type": "Person",
        "name": data.founder
      }
    };
  } else if (type === "FAQPage") {
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.questions.map((q: any) => ({
        "@type": "Question",
        "name": q.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.a
        }
      }))
    };
  } else if (type === "HowTo") {
    schema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": data.name,
      "description": data.description,
      "step": data.steps.map((s: any, idx: number) => ({
        "@type": "HowToStep",
        "position": idx + 1,
        "name": s.name,
        "text": s.text
      }))
    };
  } else if (type === "BreadcrumbList") {
    schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": data.items.map((b: any, idx: number) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": b.item
      }))
    };
  } else if (type === "WebSite") {
    schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": data.name,
      "url": data.url,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${data.url}/guides?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
