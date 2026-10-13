import type { Metadata, ResolvingMetadata } from "next";

interface PageMeta {
  title: string;
  description: string;
  /** Keeps an unlisted page out of search results. */
  noindex?: boolean;
}

/**
 * Metadata for an agent page: its own title and description, in the browser tab and in link previews.
 * Setting `openGraph` on a page replaces the site-wide one (image included), so the preview image is
 * copied over from the parent (src/app/opengraph-image.jpg) rather than lost.
 */
export function agentMetadata({ title, description, noindex = false }: PageMeta) {
  return async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
    const inherited = await parent;
    return {
      title,
      description,
      ...(noindex && { robots: { index: false, follow: false } }),
      openGraph: { type: "website", siteName: "Haven", title, description, images: inherited.openGraph?.images },
      twitter: { card: "summary_large_image", title, description, images: inherited.twitter?.images },
    };
  };
}
