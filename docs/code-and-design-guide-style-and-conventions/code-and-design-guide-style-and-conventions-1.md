---
icon: paintbrush
cover: >-
  https://images.unsplash.com/photo-1559028012-481c04fa702d?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw0fHx3ZWIlMjBkZXNpZ258ZW58MHx8fHwxNzM2ODQ0OTk4fDA&ixlib=rb-4.0.3&q=85
coverY: -98
---

# Design Style and Conventions Guide

## :frame\_photo: Figma Design Links

* [KindFi MVP - Index.](https://www.figma.com/design/N6eCxAkGM19hQUGBK9GBJa/KindFi-MVP?node-id=65-26)
* [KindFi MVP - Figma Design.](https://www.figma.com/design/N6eCxAkGM19hQUGBK9GBJa/KindFi-MVP?node-id=65-26\&viewport=454%252C490%252C0.04\&t=oBLcVopqbit3ZxxZ-0)

## :art: Design Guidelines

Our design system emphasizes clarity, efficiency, and seamless collaboration between designers and developers. The following guidelines outline our professional approach to design implementation:

### Design System Implementation

When creating design assets, follow a structured approach that enables clear communication and efficient development:

1. **Component Architecture:** Build a component-based design structure using Figma's auto-layout functionality. This ensures consistency and supports responsive design principles while aligning with development frameworks.
2. **Documentation Standards:** Include comprehensive documentation for each significant design element:
   * Functional specifications
   * Component behavior parameters
   * Interactive states
   * Implementation considerations
3. **Design Token Management:** Create a systematic approach to design tokens:
   * Define clear color systems and typography scales
   * Implement consistent spacing hierarchies
   * Document component-specific properties

### Theme Implementation

For multi-theme applications, use this structure:

* **Variable System:** Use Figma's variable functionality to create robust, scalable theming solutions
* **Theme Documentation:** Keep thorough documentation of theme variations and implementation parameters
* **Component States:** Document how components behave across different themes and states

A well-implemented design system ensures consistency while maintaining professional standards throughout the design and development process. Keep communication open when sharing new designs until all details are clear.

### Figma Conventions

* Use auto-layout for all components to ensure responsive design.
* Name all frames, components, and elements using kebab-case convention.
* Follow component hierarchy and organization as outlined in our design system.
* Document all design decisions within the related issue.
* Maintain consistency with established design system guidelines.
* Ensure proper implementation of constraints and responsive design principles.
* Always ask to export in SVG when creating/using vectors, always create Vectors to ensure asset high quality.
* Always ask to export in `webp` format, best way is to use online converters from [PNG to WEBP](https://cloudconvert.com/png-to-webp).
* Reduce the use of low images resolution or images in vectors.

### Font / Typography

Typography uses a hierarchical pattern to help users navigate content effectively. Here's how it works in practice:

A page begins with a content title, followed by a subtitle and cover image. The first text block follows, leading to a second-level title that introduces the first secondary section.

Further down, third-level titles mark content that's less related to the main topic.

We use sequential text sizes to help users distinguish content importance and follow the site's natural flow.

Text styles are defined as follows:

* _display\_\_n\_\__ (where n = intensity level): Defines webpage headers. Uses 2 scales for Landing Banners, either at page start or site landing, based on design needs.
* _h\_\_n\_\__ (where n = importance level): Defines text sizes for content titles, sections, and page banners.
* _body-size_ (where size = text size): Defines text sizes for content elements like subtitles, headers, labels, footers, and lists. Uses t-shirt sizing (from xxs to xxl).

### Spacing

Design pattern spacing uses an exponential t-shirt sizing scale. We use [TailwindCSS spacing](https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale) as our reference for pixel scaling in REM.

Consider your design concept when choosing spacing. Decide whether sections need clear separation for focus or should be more condensed, as in blogs or mobile-adaptive designs.

Begin with a middle point pixel size (regular) of 32px. Create a scale using negative and positive exponents (e.g., ...14 x 1.5 = 21 x 1.5 = 32\[midpoint] x 1.5 = 48 x 1.5 = 72...).

Scale names MUST use kebab-case with t-shirt sizing and include a zero value: none, x-small, small, regular, large, x-large.

### Colors

Color schemes follow [TailwindCSS color palette](https://tailwindcss.com/docs/customizing-colors#default-color-palette) conventions. Use contrast scales (black/white, based on primary color contrast) to accent or soften colors.

Color scales follow this pattern:

* _**main-n**_ (main = primary color, n = tint/shade): Primary colors with different tints/shades. Midpoint has no number, with tints ranging from 50-400 and shades from 600-900.

> TIP: Keep primary color tints minimal but maintain a complete (contrast) gray scale, including 500 for midpoint.
