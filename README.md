# UnScroll

> Help people offset social media usage with healthy habits.

A prototype created for [Global Service Jam 2026](https://globalservicejam.org).

UnScroll is a mobile-first accountability app that tracks your daily social media screen time and nudges you to replace scrolling with meaningful activities — running, reading, or meditation.

## How it works

1. **Grant screen time access** — UnScroll reads your social media usage. All data stays on-device.
2. **Pick your counter-habits** — Choose from running, reading, or meditation as your healthy offsets.
3. **Add accountability friends** — Select friends already on UnScroll to keep each other honest. They get a gentle ping when you've been scrolling too long.
4. **Fight back on the dashboard** — Watch your usage in real time, hit your daily activity targets, and earn your Focus Score back.

## Key behaviours

- Activity suggestions kick in after **60 minutes** of social media use.
- Friends are notified when you cross **100 minutes**.
- Suggested activity time is **1.5× your excess** scroll time — so 30 extra minutes of scrolling means 45 minutes of activity to offset it.
- A **daily pick** (one activity, 15 min) is always shown even before you go over the limit.
- Promoted events from partners like Nike, lululemon, and Kindle surface real-world activities nearby.

## Tech stack

- React 19 + TypeScript
- Vite
- Zustand (state management)
- Framer Motion (animations)
- Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```
