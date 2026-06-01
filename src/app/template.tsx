/**
 * Route transitions are handled by the browser View Transitions API
 * (via `next-view-transitions` for client navigations and the
 * `@view-transition` CSS rule for full-page navigations). This template is a
 * passthrough; the previous framer-motion fade lived here but would now
 * double-animate against the view transition.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return children;
}
