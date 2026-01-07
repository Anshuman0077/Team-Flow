import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "../../../components/header";
import BackgorundImage from "@/public/backgorund/NightBg.png";
import HeroDark from "@/public/screenshot/ScreenShot1.png";
import HeroLight from "@/public/screenshot/ScreenShot2.png";

import ArcjetLogo from "@/public/companies/Arcjet.png";
import Kinde from "@/public/companies/Kinde.png";
import Orpc from "@/public/companies/Orpc.png";
import Vercel from "@/public/companies/Vercel.png";
import NeonDB from "@/public/companies/NeonDB.png";
import Prisma from "@/public/companies/Prisma.png";
import MotionLogo from "@/public/companies/Motion.png";

// Animation configuration for framer-motion variants
// This defines how elements appear and disappear with animations
const transitionVariants = {
  item: {
    hidden: {
      opacity: 0, // Start invisible
      filter: "blur(12px)", // Start with blur effect
      y: 12, // Start 12px lower than final position
    },
    visible: {
      opacity: 1, // End fully visible
      filter: "blur(0px)", // Remove blur effect
      y: 0, // Move to final position
      transition: {
        type: "spring" as const, // Spring animation for bouncy effect
        bounce: 0.3, // How bouncy the spring is
        duration: 1.5, // Animation duration in seconds
      },
    },
  },
};

export default function HeroSection() {
  return (
    <>
      {/* Navigation header component */}
      <HeroHeader />

      {/* Main content area - overflow-hidden prevents scroll bars from animations */}
      <main className="overflow-hidden">
        {/* Background decorative elements */}
        <div
          aria-hidden // Hide from screen readers since it's decorative
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          {/* Gradient circles for visual background effects */}
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>

        {/* Hero content section */}
        <section>
          {/* Main container with padding and positioning */}
          <div className="relative pt-24 md:pt-36">
            {/* Animated background image container */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1, // Delay child animations by 1 second
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20, // Start 20px lower
                  },
                  visible: {
                    opacity: 1,
                    y: 0, // Move to final position
                    transition: {
                      type: "spring",
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
            >
              {/* Background image - only shows in dark mode */}
              <Image
                src={BackgorundImage}
                alt="background"
                className="hidden size-full dark:block" // Hidden in light mode
                width="3276"
                height="4095"
              />
            </AnimatedGroup>

            {/* Overlay gradient to blend background image */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            {/* Main content container */}
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                {/* Announcement badge/link with animation */}
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Introducing New AI features
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    {/* Animated arrow icon container */}
                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                {/* Main headline with text animation effects */}
                <TextEffect
                  preset="fade-in-blur" // Predefined animation from Tailark
                  speedSegment={0.3} // Speed of animation per segment
                  as="h1" // Render as h1 tag
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                >
                  The AI-ready home for team commutication
                </TextEffect>

                {/* Subheading with animation */}
                <TextEffect
                  per="line" // Animate line by line
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5} // Delay start by 0.5 seconds
                  as="p" // Render as paragraph
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                >
                  Team-Flow orgainzes conversation into channels with threads,
                  is realtime, and AI to keep teams in sync
                </TextEffect>

                {/* Call-to-action buttons with staggered animation */}
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05, // Delay between each child animation
                          delayChildren: 0.75, // Delay before starting children animations
                        },
                      },
                    },
                    ...transitionVariants, // Spread in our predefined animation variants
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-5 md:flex-row"
                >
                  {/* Primary button with special border effect */}
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                  >
                    <Button
                      asChild // Button acts as wrapper for Link
                      size="lg"
                      className="rounded-xl px-5 text-base"
                    >
                      <Link href="#link">
                        <span className="text-nowrap">Get Started</span>
                      </Link>
                    </Button>
                  </div>

                  {/* Secondary button */}
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="secondary" // Ghost variant for secondary appearance
                    className="h-10.5 rounded-xl px-5"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Request a demo</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            {/* App screenshot section with animation */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="mask-b-from-55% relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                {/* Container for app screenshot with shadow effects */}
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  {/* App screenshot - dark mode version */}
                  <Image
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block object-contain object-top"
                    src={HeroDark}
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  {/* App screenshot - light mode version */}
                  <Image
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden object-contain object-top"
                    src={HeroLight}
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Customer logos section */}
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            {/* Hover overlay that appears when hovering the logos */}
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                href="/"
                className="block text-sm duration-150 hover:opacity-75"
              >
                <span> Meet Our Customers</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>

            {/* Grid of customer logos that blur on hover */}
            <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
              {/* Customer logo images - dark:invert makes them visible in dark mode */}
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain invert dark:invert-0"
                  src={NeonDB}
                  alt="Nvidia Logo"
                />
              </div>

              {/* ... more customer logos ... */}

              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain invert dark:invert-0"
                  src={Prisma}
                  alt="Column Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain dark:invert-0 invert"
                  src={ArcjetLogo}
                  alt="Column Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain dark:invert-0 invert"
                  src={Vercel}
                  alt="Vercel Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain dark:invert-0 invert"
                  src={Kinde}
                  alt="Nike Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain"
                  src={Orpc}
                  alt="Lemon Squeezy Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 object-contain"
                  src={MotionLogo}
                  alt="Laravel Logo"
                />
              </div>
              <div className="flex">
                <Image
                  className="mx-auto h-7 w-auto dark:invert object-contain"
                  src="https://html.tailus.io/blocks/customers/lilly.svg"
                  alt="Lilly Logo"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
