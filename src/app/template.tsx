import PageTransition from "@/components/PageTransition";

/**
 * Next.js template — re-renders on every navigation (unlike layout which
 * persists). Used to drive page-level enter animations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
