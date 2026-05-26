'use client'

import { motion } from 'framer-motion'
import type { HousingListItem } from '@/lib/queries/housing'
import HousingCard from '@/components/HousingCard'
import FavoriteButton from '@/components/FavoriteButton'

type Props = {
  listings: HousingListItem[]
  favoritedIds: number[]
  isLoggedIn: boolean
  selected: HousingListItem | null
  onSelect: (h: HousingListItem) => void
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export default function HousingResults({
  listings,
  favoritedIds,
  isLoggedIn,
  selected,
  onSelect,
}: Props) {
  const favSet = new Set(favoritedIds)
  const isOpen = !!selected

  return (
    <motion.div
      className={`grid gap-6 ${
        isOpen
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {listings.map((housing) => (
        <motion.div key={housing.housing_id} className="relative" variants={itemVariants}>
          <HousingCard
            housing={housing}
            onSelect={onSelect}
            isSelected={selected?.housing_id === housing.housing_id}
          />
          {isLoggedIn && (
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton
                listingType="housing"
                listingId={housing.housing_id}
                initialFavorited={favSet.has(housing.housing_id)}
              />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
