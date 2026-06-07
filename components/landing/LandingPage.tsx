"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  MapPin,
  House,
  UtensilsCrossed,
  CalendarCheck,
  Heart,
  Compass,
  Star,
} from "lucide-react";
import { guardedHref } from "@/lib/auth-redirect";

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: easeOut, delay: 0.15 + i * 0.08 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Hero navigation (cinematic overlay)                                */
/* ------------------------------------------------------------------ */

function HeroNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="absolute inset-x-0 top-0 z-30"
    >
      <div className="mx-auto grid max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-6 py-6 sm:px-10 lg:py-8">
        {/* Left links */}
        <div className="hidden items-center gap-8 text-[13px] font-medium tracking-wide text-white/75 md:flex">
          <Link href="/housing" className="transition-colors hover:text-white">
            Housing
          </Link>
          <Link
            href="/carinderias"
            className="transition-colors hover:text-white"
          >
            Carinderias
          </Link>
        </div>

        {/* Center wordmark */}
        <Link
          href="/"
          className="col-start-2 flex items-center justify-center gap-3"
          aria-label="RenTell home"
        >
          <Image
            src="/rentell-logo.svg"
            alt=""
            width={54}
            height={54}
            priority
            className="h-13 w-13 brightness-0 invert"
          />
          <span className="text-[27px] font-semibold tracking-[0.16em] text-white">
            RENTELL
          </span>
        </Link>

        {/* Right actions */}
        <div className="col-start-3 flex items-center justify-end gap-3 sm:gap-5">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-white/75 transition-colors hover:text-white sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="group flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
          >
            Get started
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export type LandingPageStats = {
  listings: number;
  carinderias: number;
};

function getHeroQuickLinks(isLoggedIn: boolean) {
  return [
    {
      href: "/housing",
      icon: House,
      label: "Browse housing",
      hint: "Find rooms near campus",
    },
    {
      href: "/carinderias",
      icon: UtensilsCrossed,
      label: "Browse carinderias",
      hint: "Meals near your area",
    },
    {
      href: guardedHref("/visits", isLoggedIn),
      icon: CalendarCheck,
      label: isLoggedIn ? "My visits" : "Sign up for visits",
      hint: isLoggedIn
        ? "Track scheduled visits"
        : "Create an account to schedule",
    },
  ] as const;
}

function formatStatCount(count: number) {
  return count.toLocaleString("en-US");
}

function HeroQuickLink({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof House;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group/quick relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-[var(--gold)]/45 hover:bg-white/5 hover:text-white"
    >
      <Icon
        className="h-4 w-4 transition-colors duration-300 group-hover/quick:text-[var(--gold)]"
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-normal tracking-normal text-white/0 transition-all duration-300 group-hover/quick:text-white/70">
        {hint}
      </span>
    </Link>
  );
}

function HeroEyebrowChip({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof House;
  label: string;
  hint: string;
}) {
  return (
    <span className="group/chip relative inline-flex cursor-default items-center gap-1.5">
      <Icon
        className="h-3 w-3 opacity-0 transition-all duration-300 group-hover/chip:opacity-100 group-hover/chip:text-[var(--gold)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="transition-colors duration-300 group-hover/chip:text-white">
        {label}
      </span>
      <span className="pointer-events-none absolute -bottom-7 left-0 whitespace-nowrap text-[10px] font-normal normal-case tracking-normal text-white/0 transition-all duration-300 group-hover/chip:text-white/70">
        {hint}
      </span>
    </span>
  );
}

function HeroHoverWord({
  children,
  accent = false,
}: {
  children: string;
  accent?: boolean;
}) {
  return (
    <motion.span
      className={`inline-block cursor-default px-[0.06em] transition-[color,text-shadow] duration-300 hover:[text-shadow:0_0_48px_rgba(245,162,24,0.45)] ${
        accent ? "hover:text-[var(--gold)]" : "hover:text-white"
      }`}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      {children}
    </motion.span>
  );
}

function HeroMaskLine({
  text,
  hint,
  imageSrc,
  className = "",
}: {
  text: string;
  hint: string;
  imageSrc: string;
  className?: string;
}) {
  return (
    <motion.span
      variants={rise}
      initial="hidden"
      animate="show"
      custom={2}
      className={`group/mask block cursor-default ${className}`}
    >
      <span className="relative block">
        <span className="block transition-opacity duration-500 group-hover/mask:opacity-0">
          {text}
        </span>
        <span
          aria-hidden
          className="lp-text-mask absolute inset-0 block bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover/mask:opacity-100"
          style={{ backgroundImage: `url(${imageSrc})` }}
        >
          {text}
        </span>
      </span>
      <span className="pointer-events-none block min-h-[2.75rem] max-w-md pt-2 text-[13px] font-light leading-snug tracking-normal text-white/0 transition-colors duration-500 group-hover/mask:text-white/60 sm:min-h-[3rem] sm:text-sm">
        {hint}
      </span>
    </motion.span>
  );
}

function HeroNearCampus() {
  return (
    <motion.div
      variants={rise}
      initial="hidden"
      animate="show"
      custom={3}
      className="group/campus relative mt-2 hidden cursor-default justify-end pr-2 lg:flex"
    >
      {/* Distance rings — suggest proximity radius on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-[var(--gold)]/0 opacity-0 transition-all duration-700 group-hover/campus:border-[var(--gold)]/25 group-hover/campus:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-white/0 opacity-0 transition-all delay-100 duration-700 group-hover/campus:border-white/10 group-hover/campus:opacity-100"
      />

      <Compass
        className="pointer-events-none absolute right-full top-1/2 mr-4 h-7 w-7 -translate-y-1/2 text-[var(--gold)] opacity-0 transition-all duration-500 group-hover/campus:rotate-12 group-hover/campus:opacity-100"
        strokeWidth={1.25}
        aria-hidden
      />

      <p className="relative text-right text-[clamp(3rem,9vw,7.5rem)] font-extralight leading-none tracking-[-0.04em] transition-all duration-700 group-hover/campus:tracking-[-0.02em]">
        {/* Ghost outline — visible by default, fades on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/15 to-white/40 bg-clip-text text-transparent transition-opacity duration-700 group-hover/campus:opacity-0"
        >
          Near Campus
        </span>

        {/* Interactive fill — invisible until hover, then solid with per-word lift */}
        <span className="relative text-white/0 transition-colors duration-700 group-hover/campus:text-white">
          <HeroHoverWord>Near</HeroHoverWord>{" "}
          <HeroHoverWord accent>Campus</HeroHoverWord>
        </span>
      </p>

      <span className="pointer-events-none absolute right-2 top-full mt-3 max-w-[16rem] text-right text-[13px] font-light leading-snug tracking-normal text-white/0 transition-all duration-500 group-hover/campus:text-white/55">
        Search by distance to work or school. See if it is walkable, bikeable, or one jeepney ride away.
      </span>
    </motion.div>
  );
}

function HeroHeadline() {
  return (
    <>
      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="group/eyebrow mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]"
      >
        <span className="h-px w-8 bg-[var(--gold)]/60 transition-all duration-500 group-hover/eyebrow:w-12 group-hover/eyebrow:bg-[var(--gold)]" />
        <HeroEyebrowChip
          icon={House}
          label="Student housing"
          hint="Boarding houses, dorms & apartments"
        />
        <span className="text-[var(--gold)]/50">&amp;</span>
        <HeroEyebrowChip
          icon={UtensilsCrossed}
          label="dining"
          hint="Carinderias near where you live"
        />
        <span className="text-[var(--gold)]/50">· Philippines</span>
      </motion.p>

      <h1 className="font-sans text-white">
        <motion.span
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="group/line block"
        >
          <span className="block text-[clamp(3rem,10vw,8.5rem)] font-extralight leading-[0.92] tracking-[-0.03em] transition-[letter-spacing] duration-500 hover:tracking-[-0.01em]">
            <HeroHoverWord accent>Student</HeroHoverWord>{" "}
            <HeroHoverWord>Living</HeroHoverWord>
          </span>
          <span className="pointer-events-none block min-h-[2.75rem] max-w-lg pt-2 text-[13px] font-light leading-snug tracking-normal text-white/0 transition-colors duration-500 group-hover/line:text-white/55 sm:min-h-[3rem] sm:text-sm">
            Designed for university life, open to anyone looking for their next
            home.
          </span>
        </motion.span>

        <HeroMaskLine
          text="Made Effortless"
          hint="Filter by location, save favorites, and schedule visits in-app. No phone calls needed."
          imageSrc="/hero-housing.png?v=2"
          className="whitespace-nowrap text-[clamp(3rem,10vw,8.5rem)] font-light leading-[0.92] tracking-[-0.03em] text-white/95"
        />
      </h1>
    </>
  );
}

function Hero({
  stats,
  isLoggedIn,
}: {
  stats: LandingPageStats;
  isLoggedIn: boolean;
}) {
  const heroQuickLinks = getHeroQuickLinks(isLoggedIn);
  const statItems = [
    { value: formatStatCount(stats.listings), label: "listings" },
    { value: formatStatCount(stats.carinderias), label: "carinderias" },
  ];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black"
    >
      {/* Background image */}
      <motion.div
        style={{ y: imgY, scale: imgScale }}
        className="absolute inset-0"
      >
        <Image
          src="/hero-housing.png?v=2"
          alt="Student living near campus at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />
      <div className="lp-grain pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay" />

      <HeroNav />

      {/* Sub-nav: icon buttons + stats */}
      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={1}
        className="absolute inset-x-0 top-[88px] z-20 mx-auto hidden max-w-screen-2xl items-center justify-between px-6 sm:px-10 lg:top-[104px] lg:flex"
      >
        <div className="flex items-center gap-2.5">
          {heroQuickLinks.map((item) => (
            <HeroQuickLink key={item.href} {...item} />
          ))}
        </div>
        <div className="flex items-center gap-10">
          {statItems.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-white">
                {s.value}
              </span>
              <span className="text-[13px] font-light tracking-wide text-white/55">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main hero content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="absolute inset-0 z-10 flex flex-col justify-center"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-10">
          <HeroHeadline />

          <HeroNearCampus />
        </div>
      </motion.div>

      {/* Bottom-left description + CTA */}
      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={4}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-0 z-20 w-full px-6 sm:bottom-10 sm:px-10"
      >
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-[15px] font-light leading-relaxed text-white/65">
            Skip cluttered Facebook groups. Find up-to-date rentals and nearby carinderias in one searchable platform.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/housing"
              className="group flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse listings
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="hidden items-center gap-3 rounded-full border border-white/20 px-4 py-2.5 text-white/80 backdrop-blur-sm sm:flex">
              <MapPin
                className="h-4 w-4 text-[var(--gold)]"
                strokeWidth={1.6}
              />
              <div className="leading-tight">
                <p className="text-[13px] font-medium text-white">
                  Metro Manila
                </p>
                <p className="text-[11px] tracking-wide text-white/50">
                  Philippines
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-white/40"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee strip                                                      */
/* ------------------------------------------------------------------ */

const MARQUEE = [
  "Boarding houses",
  "Apartments",
  "Bedspace",
  "Dormitories",
  "Carinderias",
  "Near campus",
  "Budget-friendly",
  "Long-term stays",
];

function Marquee() {
  return (
    <div className="border-y border-white/10 bg-[#0c0d0c] py-5">
      <div className="flex overflow-hidden">
        <div className="lp-marquee flex shrink-0 items-center gap-10 pr-10">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <div key={i} className="flex shrink-0 items-center gap-10">
              <span className="text-[15px] font-light tracking-wide text-white/45">
                {word}
              </span>
              <span className="h-1 w-1 rounded-full bg-[var(--gold)]/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dual feature: a home AND a meal                                    */
/* ------------------------------------------------------------------ */

function FeatureCard({
  href,
  image,
  eyebrow,
  title,
  copy,
  icon: Icon,
  index,
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  copy: string;
  icon: typeof House;
  index: number;
}) {
  return (
    <motion.div
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
    >
      <Link
        href={href}
        className="group relative block h-[480px] overflow-hidden rounded-2xl"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="lp-grain pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />

        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white backdrop-blur-sm">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[var(--gold)]">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-3xl font-light tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-3 max-w-sm text-[15px] font-light leading-relaxed text-white/65">
            {copy}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
            Explore
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function DualFeature() {
  return (
    <section className="bg-[#0c0d0c] px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-5 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
            <span className="h-px w-8 bg-[var(--gold)]/60" />
            One platform, two needs
          </p>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-extralight leading-[1.02] tracking-tight text-white">
            A home and a meal,
            <br />
            <span className="text-white/55">in one place.</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          <FeatureCard
            href="/housing"
            image="/section-room.png?v=2"
            eyebrow="Find a home"
            title="Rooms built for student life"
            copy="Sort by commute time, compare favorites, and book visits right from your phone."
            icon={House}
            index={0}
          />
          <FeatureCard
            href="/carinderias"
            image="/section-dining.png?v=2"
            eyebrow="Find a meal"
            title="The carinderia next door"
            copy="Discover nearby eateries right alongside housing listings. A budget-friendly meal is never too far."
            icon={UtensilsCrossed}
            index={1}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Compass,
    n: "01",
    title: "Search near campus",
    copy: "Set your university and filter by distance, budget, and the room type you actually need.",
    hint: "Filter by distance.",
    cta: "Browse housing",
    href: "/housing",
  },
  {
    icon: CalendarCheck,
    n: "02",
    title: "Schedule a visit",
    copy: "Request a property visit directly in the app and track every request in one place.",
    hint: "No chasing landlords on Messenger.",
    cta: "View my visits",
    href: "/visits",
  },
  {
    icon: Heart,
    n: "03",
    title: "Save & decide",
    copy: "Bookmark favorites, compare them side by side, and move in when it feels right.",
    hint: "Compare saved listings at your own pace.",
    cta: "Open favorites",
    href: "/favorites",
  },
];

function HowItWorksStep({
  step,
  index,
  isActive,
  isDimmed,
  onActivate,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onActivate: (index: number | null) => void;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={index}
      animate={{ opacity: isDimmed ? 0.45 : 1, scale: isDimmed ? 0.985 : 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      onMouseEnter={() => onActivate(index)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(index)}
      onBlur={() => onActivate(null)}
      className="relative bg-[#0c0d0c]"
    >
      <Link
        href={step.href}
        className={`group/step relative block h-full p-9 outline-none transition-colors duration-500 ${
          isActive ? "bg-[#121412]" : "hover:bg-[#101210]"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0 group-hover/step:opacity-60"
          }`}
        />

        <span
          aria-hidden
          className={`pointer-events-none absolute -right-4 -top-6 select-none text-[7rem] font-extralight leading-none transition-all duration-700 sm:text-[8rem] ${
            isActive
              ? "text-[var(--gold)]/15"
              : "text-white/5 group-hover/step:text-white/12"
          }`}
        >
          {step.n}
        </span>

        <div className="relative mb-10 flex items-center justify-between">
          <motion.span
            animate={{
              scale: isActive ? 1.08 : 1,
              borderColor: isActive
                ? "rgba(245, 162, 24, 0.55)"
                : "rgba(255, 255, 255, 0.15)",
              backgroundColor: isActive
                ? "rgba(245, 162, 24, 0.08)"
                : "rgba(255, 255, 255, 0)",
            }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border text-[var(--gold)]"
          >
            <motion.span
              animate={{ rotate: isActive ? 8 : 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </motion.span>
          </motion.span>

          <span
            className={`relative text-5xl font-extralight transition-colors duration-500 ${
              isActive
                ? "text-white/25"
                : "text-white/10 group-hover/step:text-white/18"
            }`}
          >
            {step.n}
          </span>
        </div>

        <h3
          className={`relative text-xl font-light transition-colors duration-300 ${
            isActive
              ? "text-white"
              : "text-white/90 group-hover/step:text-white"
          }`}
        >
          {step.title}
        </h3>
        <p className="relative mt-3 text-[14px] font-light leading-relaxed text-white/55 transition-colors duration-300 group-hover/step:text-white/65">
          {step.copy}
        </p>

        <p
          className={`relative mt-4 text-[12px] font-light leading-snug transition-all duration-500 ${
            isActive
              ? "max-h-12 translate-y-0 text-[var(--gold)]/80 opacity-100"
              : "max-h-0 -translate-y-1 overflow-hidden text-white/0 opacity-0 group-hover/step:max-h-12 group-hover/step:translate-y-0 group-hover/step:text-white/45 group-hover/step:opacity-100"
          }`}
        >
          {step.hint}
        </p>

        <span
          className={`relative mt-6 inline-flex items-center gap-2 text-sm font-medium transition-all duration-500 ${
            isActive
              ? "translate-y-0 text-white opacity-100"
              : "translate-y-2 text-white/0 opacity-0 group-hover/step:translate-y-0 group-hover/step:text-white group-hover/step:opacity-100"
          }`}
        >
          {step.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/step:translate-x-0.5 group-hover/step:-translate-y-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}

function HowItWorks({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const steps = STEPS.map((step) => ({
    ...step,
    href: guardedHref(step.href, isLoggedIn),
  }));
  const activeHint = activeStep !== null ? steps[activeStep].hint : null;

  return (
    <section className="border-t border-white/10 bg-[#0a0b0a] px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <h2 className="max-w-xl text-[clamp(2rem,4.5vw,3.5rem)] font-extralight leading-[1.02] tracking-tight text-white">
            <span className="group/headline block cursor-default">
              The way student renters
              <br />
              <span className="text-white/55 transition-colors duration-500 group-hover/headline:text-white/75">
                <HeroHoverWord>actually</HeroHoverWord>{" "}
                <HeroHoverWord accent>move.</HeroHoverWord>
              </span>
            </span>
          </h2>
          <div className="max-w-sm">
            <p className="text-[15px] font-light leading-relaxed text-white/55 transition-colors duration-500">
              Built for how Filipinos actually search and settle in. Enjoy a calm, transparent process on your schedule.
            </p>
            <p
              className={`mt-3 text-[13px] font-light leading-snug transition-all duration-500 ${
                activeHint
                  ? "max-h-12 translate-y-0 text-[var(--gold)]/75 opacity-100"
                  : "max-h-0 -translate-y-1 overflow-hidden text-white/0 opacity-0"
              }`}
            >
              {activeHint}
            </p>
          </div>
        </motion.div>

        <div
          className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 transition-shadow duration-500 md:grid-cols-3"
          onMouseLeave={() => setActiveStep(null)}
        >
          {steps.map((step, i) => (
            <HowItWorksStep
              key={step.n}
              step={step}
              index={i}
              isActive={activeStep === i}
              isDimmed={activeStep !== null && activeStep !== i}
              onActivate={setActiveStep}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Host CTA                                                           */
/* ------------------------------------------------------------------ */

function HostCta() {
  return (
    <section className="relative overflow-hidden bg-[#0c0d0c] px-6 py-24 sm:px-10 lg:py-32">
      <div className="absolute inset-0 opacity-40">
        <Image
          src="/hero-housing.png?v=2"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0c] via-[#0c0d0c]/85 to-[#0c0d0c]/40" />
      <div className="lp-grain pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />

      <motion.div
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-screen-2xl"
      >
        <p className="mb-5 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
          <span className="h-px w-8 bg-[var(--gold)]/60" />
          For hosts &amp; landlords
        </p>
        <h2 className="max-w-3xl text-[clamp(2rem,5vw,4rem)] font-extralight leading-[1.02] tracking-tight text-white">
          List once. Manage everything
          <br />
          <span className="text-white/55">from one dashboard.</span>
        </h2>
        <p className="mt-6 max-w-xl text-[15px] font-light leading-relaxed text-white/60">
          Post clear listings, track visits, and message tenants directly. Connect with renters actively looking for a home.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--cta)" }}
          >
            Become a host
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
          >
            Host log in
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function getFooterSections(isLoggedIn: boolean) {
  const href = (path: string) => guardedHref(path, isLoggedIn);

  return [
    {
      title: "Discover",
      links: [
        { label: "Housing", href: "/housing" },
        { label: "Carinderias", href: "/carinderias" },
        { label: "Favorites", href: href("/favorites") },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Log in", href: "/login" },
        { label: "Register", href: "/register" },
        { label: "My visits", href: href("/visits") },
      ],
    },
    {
      title: "Hosts",
      links: [
        { label: "Become a host", href: "/register" },
        { label: "My listings", href: href("/listings") },
        { label: "Dashboard", href: href("/dashboard") },
      ],
    },
  ] as const;
}

function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const footerSections = getFooterSections(isLoggedIn);

  return (
    <footer className="border-t border-white/10 bg-[#0a0b0a] px-6 pb-10 pt-16 sm:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Image
                src="/rentell-logo.svg"
                alt=""
                width={30}
                height={30}
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="text-[16px] font-semibold tracking-[0.16em] text-white">
                RENTELL
              </span>
            </div>
            <p className="mt-5 text-[14px] font-light leading-relaxed text-white/50">
              A local housing and dining directory. Find your next long-term home and a reliable meal in one place.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[13px] text-white/45">
              <Star className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Find your next long-term stay, anywhere in the Philippines.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {footerSections.map((section) => (
              <FooterCol
                key={section.title}
                title={section.title}
                links={[...section.links]}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[12px] text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} RenTell. All rights reserved.</p>
          <p className="tracking-wide">
            Find a home. Find a meal. Near campus or your workplace.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[14px] font-light text-white/65 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage({
  stats,
  isLoggedIn,
}: {
  stats: LandingPageStats;
  isLoggedIn: boolean;
}) {
  return (
    <main className="bg-[#0a0b0a]">
      <Hero stats={stats} isLoggedIn={isLoggedIn} />
      <Marquee />
      <DualFeature />
      <HowItWorks isLoggedIn={isLoggedIn} />
      <HostCta />
      <Footer isLoggedIn={isLoggedIn} />
    </main>
  );
}
