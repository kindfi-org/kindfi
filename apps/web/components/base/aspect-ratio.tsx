'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

/**
 * AspectRatio component for maintaining a consistent aspect ratio for its children.
 * This is a wrapper around Radix UI's AspectRatio primitive.
 *
 * @see {@link https://ui.shadcn.com/docs/components/aspect-ratio} for documentation and usage examples.
 *
 * @component
 *
 * @example
 * // Basic usage with a 16:9 aspect ratio
 * <AspectRatio ratio={16 / 9}>
 *   <img src="example.jpg" alt="Example" className="w-full h-full object-cover" />
 * </AspectRatio>
 *
 * @param {AspectRatioPrimitive.AspectRatioProps} props - The properties passed to the AspectRatio component.
 * @returns {JSX.Element} The AspectRatio component.
 */
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
