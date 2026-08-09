import Image, { ImageProps } from 'next/image';
import { blurMap } from '@/lib/blur-data';

/**
 * Drop-in replacement for next/image: when the (local) src has a generated
 * tiny blur placeholder in blurMap, it renders with a soft blur-up reveal.
 * Unknown/remote srcs fall back to a normal <Image>. Same props as next/image.
 */
export default function BlurImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : undefined;
  const blur = src ? blurMap[src] : undefined;

  if (blur && !props.placeholder) {
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps, just not visible to the linter through the spread
    return <Image {...props} placeholder="blur" blurDataURL={blur} />;
  }
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps, just not visible to the linter through the spread
  return <Image {...props} />;
}
