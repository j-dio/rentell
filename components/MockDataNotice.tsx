'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const DISMISSED_KEY = 'rentell_demo_dismissed'
const SEEN_KEY = 'rentell_demo_seen'

export default function MockDataNotice() {
  const [visible, setVisible] = useState(false)
  const [dontShow, setDontShow] = useState(false)

  useEffect(() => {
    const permanentlyDismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    const seenThisSession = sessionStorage.getItem(SEEN_KEY) === '1'

    if (!permanentlyDismissed && !seenThisSession) {
      setVisible(true)
      sessionStorage.setItem(SEEN_KEY, '1')
    }
  }, [])

  function handleClose() {
    if (dontShow) {
      localStorage.setItem(DISMISSED_KEY, '1')
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="notice-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <motion.div
            key="notice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-notice-title"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="w-full max-w-[440px] pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-12px_rgba(26,106,70,0.18)]">
              {/* Brand accent stripe */}
              <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />

              <div className="px-6 pb-6 pt-5 pl-8">
                {/* Header row */}
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2
                      id="mock-notice-title"
                      className="text-sm font-semibold text-foreground"
                    >
                      Demo Content
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Dismiss notice"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  All housing and carinderia listings shown here are{' '}
                  <span className="font-medium text-foreground">sample data</span> created for
                  demonstration purposes. RenTell is a school project currently under development
                  and has not yet been populated with real listings from actual providers.
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4">
                  <label className="group flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={(e) => setDontShow(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-[var(--primary)]"
                    />
                    <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                      Don&apos;t show this again
                    </span>
                  </label>

                  <button
                    onClick={handleClose}
                    className="rounded-full px-5 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
