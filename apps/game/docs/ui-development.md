# Game UI Development Guide

This file explains how to work on the 2D UI layer of BboyArena without fighting the layout.

## Purpose

The goal of the demo pages is simple:

- keep the 2D UI readable
- keep spacing obvious
- keep components reusable
- avoid letting the game shell and the site shell bleed into each other

Use the game-owned UI components as the source of truth. The website route `/__dev/ui-demo` is an Astro development sandbox and should not become a runtime dependency of the game.

## What to build from

Use these as the main building blocks:

- `GamePanel` for surfaces and cards
- `GameButton` for actionable controls
- Tailwind utilities for layout, spacing, and responsive behavior

If you need a quick composition rule:

1. wrap the whole page in one wide shell
2. split content into sections with `gap-*`
3. build each section from panels
4. add internal spacing with `space-y-*`
5. use margin only when a block needs to move away from one specific edge

## Spacing Rules

The most common issue in this project is compressed UI. The fix is usually one of these:

- `gap-6` or `gap-8` for the distance between sections
- `space-y-4` or `space-y-6` for vertical stacks inside a card
- `p-5` or `p-6` for inner padding
- `sm:` and `lg:` prefixes to relax density on bigger screens

Recommended defaults for the 2D layer:

- page shell: `mx-auto flex w-full max-w-7xl flex-col gap-8`
- section grid: `grid gap-6 xl:grid-cols-[1.1fr_0.9fr]`
- card internals: `space-y-4 p-5 sm:p-6`

## Tailwind Pattern

Prefer utility classes for structure and rhythm:

```astro
<div class="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-10">
  <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <GamePanel variant="dark" className="space-y-5 p-6" />
    <aside class="grid gap-6">
      <GamePanel variant="light" className="space-y-4 p-6" />
    </aside>
  </section>
</div>
```

Use arbitrary values only when the standard scale is not enough:

- `rounded-[1.75rem]`
- `tracking-[0.38em]`
- `bg-[rgba(255,255,255,0.05)]`
- `grid-cols-[1.1fr_0.9fr]`

## Visual Rules

For the BboyArena UI, keep this order:

- strong outer shell
- clear section spacing
- cards with visible padding
- one primary action per card
- secondary actions only when they help the next step

Avoid:

- putting cards edge to edge
- mixing too many border radii
- making every button look primary
- using margins as the main layout system

## Demo Reference

The demo page shows:

- dark, light, soft, and warm surfaces
- button variants
- spacing tokens
- a Tailwind code snippet
- do / avoid / next-step guidance

Use the available demo surfaces when you want to compare:

- padding
- border strength
- text size
- spacing rhythm
- hover feedback

## How To Add A New Block

1. Start with a `GamePanel` or a regular `div` wrapped in a section grid.
2. Give the parent a `gap-*` value.
3. Use `space-y-*` inside the card.
4. Keep the title short and the body text readable.
5. Test the result in the standalone game and, where relevant, on `/__dev/ui-demo` while the website development server is running.

## Good Defaults

- `rounded-[1.5rem]` to `rounded-[2rem]`
- `border border-white/10`
- `shadow-[0_12px_40px_rgba(0,0,0,0.35)]`
- `text-[10px] font-black uppercase tracking-[0.34em]`
- `leading-7` for body copy

## Notes

If a section feels crowded, the fix is usually not more color. It is more spacing.
If two things should feel related, keep their spacing smaller than the spacing between sections.
If a block feels lost, give it a stronger border, a little more padding, and a tighter title hierarchy.

## Related documentation

- [Game README](../README.md)
- [Game scene and screen architecture](./threejs-scene-architecture.md)
- [Input Manager](../../../docs/input-manager.md)
