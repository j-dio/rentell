'use client'

import { Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HousingListItem } from '@/lib/queries/housing'
import HousingFilterPanel from '@/components/HousingFilterPanel'
import HousingResults from '@/components/HousingResults'
import HousingOverviewPanel from '@/components/HousingOverviewPanel'

const PANEL_W = 420

type Props = {
  listings: HousingListItem[]
  favoritedIds: number[]
  isLoggedIn: boolean
  allAmenities: string[]
  hasFilters: boolean
}

export default function HousingPageShell({
  listings,
  favoritedIds,
  isLoggedIn,
  allAmenities,
  hasFilters,
}: Props) {
  const [selected, setSelected] = useState<HousingListItem | null>(null)
  const isOpen = !!selected
  const favSet = new Set(favoritedIds)

  return (
    <>
      {/* Main — slides left when panel opens, no resizing */}
      <motion.main
        className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6"
        animate={{ x: isOpen ? -(PANEL_W / 2) : 0, scale: isOpen ? 0.97 : 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 36 }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Housing Listings</h1>
          {listings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {listings.length} result{listings.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filter panel */}
        <Suspense fallback={<div className="w-full h-28 animate-pulse rounded-2xl bg-muted" />}>
          <HousingFilterPanel amenities={allAmenities} />
        </Suspense>

        {/* Grid or empty state */}
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 mb-5 rounded-2xl bg-secondary flex items-center justify-center">
              <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-base font-semibold text-foreground">
              {hasFilters ? 'No housing matches your filters.' : 'No housing listings yet.'}
            </p>
            {hasFilters && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Try broadening your search or clearing some filters.
              </p>
            )}
          </div>
        ) : (
          <HousingResults
            listings={listings}
            favoritedIds={favoritedIds}
            isLoggedIn={isLoggedIn}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </motion.main>

      {/* Overview panel — fixed to the right edge of the viewport, slides in */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overview-panel"
            initial={{ x: PANEL_W }}
            animate={{ x: 0 }}
            exit={{ x: PANEL_W }}
            transition={{ type: 'spring', stiffness: 280, damping: 36 }}
            className="fixed right-0 top-[var(--site-header-height)] z-30 h-[calc(100vh-var(--site-header-height))] overflow-hidden border-l border-border shadow-2xl"
            style={{ width: PANEL_W }}
          >
            <HousingOverviewPanel
              housing={selected}
              onClose={() => setSelected(null)}
              isFavorited={favSet.has(selected!.housing_id)}
              isLoggedIn={isLoggedIn}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
