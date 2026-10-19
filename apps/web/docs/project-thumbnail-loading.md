# Project card thumbnail loading policy

`ProjectCardGrid` no longer derives image priority from its position in a list.
Cards used to default `index` to `0` and mark every index below `6` as priority,
so any caller that omitted the index preloaded its image, and the home carousel
asked the browser to preload six thumbnails at once.

## Policy

`~/lib/projects/project-thumbnail-loading` owns the mapping and resolves a policy
into `next/image` props using the Next.js 16 API (`priority` is deprecated in
favour of `preload`):

| Policy      | Emitted image props                  | Used by                                  |
| ----------- | ------------------------------------ | ---------------------------------------- |
| `lazy`      | `loading="lazy" fetchPriority="auto"` | default when a page states no policy     |
| `eager`     | `loading="eager" fetchPriority="high"` | first card of the `/projects` grid       |
| `preload`   | `preload`                             | nobody; opt in only for a named LCP image |

`projectThumbnailLoadingForIndex` keeps the index-based call sites honest: only
index `0` loads eagerly, everything else is lazy, and no listing card preloads.
Both listings render a text hero above the cards (`ProjectsHero` on `/projects`,
the home headline plus `CategoryPills`), so a thumbnail is not the LCP candidate.

## Inspection notes

Verified by unit tests (`test/project-thumbnail-loading.test.ts`) that assert the
prop set for each policy and that an omitted policy emits no `preload`.

Not yet measured in this repository: a real mobile/desktop network trace needs
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
`apps/web/.env.local` (see `.env.local.example`) to render project data with
`bun run dev`. When that environment is available, compare the first
document response and the Network panel at a 390px and a 1440px viewport on `/`
and `/projects` and record the LCP element, the number of concurrent thumbnail
requests, and whether any `rel="preload" as="image"` link is present. No byte
savings are claimed here because none were measured.
