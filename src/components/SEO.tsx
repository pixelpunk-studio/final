import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function SEO({
  title = "PixelPunk Studio - Design that hits different",
  description = "Professional video editing and graphic design services. Transform your vision into stunning visuals with PixelPunk Studio.",
  keywords = "video editing, graphic design, design services, creative studio, branding, visual content",
  image = "/og-image.jpg",
  url = "https://pixelpunk.studio",
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const metaTags = [
      { name: "description", content: description },
      { name: "keywords", content: keywords },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#000000" },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const attribute = name ? "name" : "property";
      const value = name || property;
      let meta = document.querySelector(`meta[${attribute}="${value}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, value!);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    });
  }, [title, description, keywords, image, url]);

  return null;
}
