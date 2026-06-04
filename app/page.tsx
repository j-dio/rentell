'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Globe,
  Search,
  SlidersHorizontal,
  ArrowDown,
  ArrowUpRight,
  MapPin,
  House,
  UtensilsCrossed,
  CalendarCheck,
  Heart,
  Compass,
  Star,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: easeOut, delay: 0.15 + i * 0.08 },
  }),
}

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
          <Link href="/carinderias" className="transition-colors hover:text-white">
            Carinderias
          </Link>
        </div>

        {/* Center wordmark */}
        <Link
          href="/"
          className="col-start-2 flex items-center justify-center gap-2.5"
          aria-label="RenTell home"
        >
          <Image
            src="/rentell-logo.svg"
            alt=""
            width={34}
            height={34}
            priority
            className="h-7 w-7 brightness-0 invert"
          />
          <span className="text-[17px] font-semibold tracking-[0.16em] text-white">
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
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: '120+', label: 'campuses' },
  { value: '2,400', label: 'listings' },
  { value: '650', label: 'carinderias' },
]

const ICON_BTNS = [Globe, SlidersHorizontal, Search]

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
      {/* Background image */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
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
          {ICON_BTNS.map((Icon, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/60 hover:text-white"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-10">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-white">{s.value}</span>
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
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-6 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]"
          >
            <span className="h-px w-8 bg-[var(--gold)]/60" />
            Student housing &amp; dining · Philippines
          </motion.p>

          <h1 className="font-sans text-white">
            <motion.span
              variants={rise}
              initial="hidden"
              animate="show"
              custom={1}
              className="block text-[clamp(3rem,10vw,8.5rem)] font-extralight leading-[0.92] tracking-[-0.03em]"
            >
              Student Living
            </motion.span>
            <motion.span
              variants={rise}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-1 block text-[clamp(3rem,10vw,8.5rem)] font-light leading-[0.92] tracking-[-0.03em] text-white/95"
            >
              Made Effortless
            </motion.span>
          </h1>

          {/* Oversized accent word, echoing the reference's "Experiences" */}
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={3}
            className="pointer-events-none mt-2 hidden justify-end pr-2 lg:flex"
          >
            <span className="bg-gradient-to-r from-white/15 to-white/40 bg-clip-text text-[clamp(3rem,9vw,7.5rem)] font-extralight leading-none tracking-[-0.04em] text-transparent">
              Near Campus
            </span>
          </motion.div>
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
            Skip the cluttered Facebook groups. RenTell brings transparent,
            up-to-date listings for long-term student stays — and the local
            carinderias next door — into one calm, searchable home.
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
              <MapPin className="h-4 w-4 text-[var(--gold)]" strokeWidth={1.6} />
              <div className="leading-tight">
                <p className="text-[13px] font-medium text-white">Metro Manila</p>
                <p className="text-[11px] tracking-wide text-white/50">Philippines</p>
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
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 text-white/40"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Marquee strip                                                      */
/* ------------------------------------------------------------------ */

const MARQUEE = [
  'Boarding houses',
  'Apartments',
  'Bedspace',
  'Dormitories',
  'Carinderias',
  'Near campus',
  'Budget-friendly',
  'Long-term stays',
]

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
  )
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
  href: string
  image: string
  eyebrow: string
  title: string
  copy: string
  icon: typeof House
  index: number
}) {
  return (
    <motion.div
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
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
          <h3 className="mt-2 text-3xl font-light tracking-tight text-white">{title}</h3>
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
  )
}

function DualFeature() {
  return (
    <section className="bg-[#0c0d0c] px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
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
            copy="Filter by proximity to your campus, compare saved favorites at your own pace, and schedule visits — without a single phone call."
            icon={House}
            index={0}
          />
          <FeatureCard
            href="/carinderias"
            image="/section-dining.png?v=2"
            eyebrow="Find a meal"
            title="The carinderia next door"
            copy="Local eateries serving your community, listed right alongside your housing — so a reliable, budget-friendly meal is never far."
            icon={UtensilsCrossed}
            index={1}
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Compass,
    n: '01',
    title: 'Search near campus',
    copy: 'Set your university and filter by distance, budget, and the room type you actually need.',
  },
  {
    icon: CalendarCheck,
    n: '02',
    title: 'Schedule a visit',
    copy: 'Request a property visit directly in the app and track every request in one place.',
  },
  {
    icon: Heart,
    n: '03',
    title: 'Save & decide',
    copy: 'Bookmark favorites, compare them side by side, and move in when it feels right.',
  },
]

function HowItWorks() {
  return (
    <section className="border-t border-white/10 bg-[#0a0b0a] px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <h2 className="max-w-xl text-[clamp(2rem,4.5vw,3.5rem)] font-extralight leading-[1.02] tracking-tight text-white">
            The way student renters
            <br />
            <span className="text-white/55">actually move.</span>
          </h2>
          <p className="max-w-sm text-[15px] font-light leading-relaxed text-white/55">
            Built from the ground up for how Filipino students search, decide,
            and settle in — calm, transparent, and on your schedule.
          </p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
              className="group relative bg-[#0c0d0c] p-9 transition-colors hover:bg-[#101210]"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-[var(--gold)] transition-colors group-hover:border-[var(--gold)]/50">
                  <step.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="text-5xl font-extralight text-white/10">{step.n}</span>
              </div>
              <h3 className="text-xl font-light text-white">{step.title}</h3>
              <p className="mt-3 text-[14px] font-light leading-relaxed text-white/55">
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
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
        viewport={{ once: true, margin: '-80px' }}
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
          Post transparent listings made for long-term student stays, track
          visit requests, and message interested tenants directly — reaching
          the renters who are actually looking.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--cta)' }}
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
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
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
              A student housing and dining directory built for Filipino
              university students — find a home and a regular meal in one place.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[13px] text-white/45">
              <Star className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Made for students, across the Philippines</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Discover"
              links={[
                { label: 'Housing', href: '/housing' },
                { label: 'Carinderias', href: '/carinderias' },
                { label: 'Favorites', href: '/favorites' },
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                { label: 'Log in', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'My visits', href: '/visits' },
              ]}
            />
            <FooterCol
              title="Hosts"
              links={[
                { label: 'Become a host', href: '/register' },
                { label: 'My listings', href: '/listings' },
                { label: 'Dashboard', href: '/dashboard' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[12px] text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} RenTell. All rights reserved.</p>
          <p className="tracking-wide">Find a home. Find a meal. Near campus.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
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
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <main className="bg-[#0a0b0a]">
      <Hero />
      <Marquee />
      <DualFeature />
      <HowItWorks />
      <HostCta />
      <Footer />
    </main>
  )
}
