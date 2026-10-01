import { useTranslation } from 'react-i18next'

/**
 * Shared full/section page loader — readable on light & dark themes.
 * Brand accents: blue-600 → indigo-600 / teal (matches RoomsManager).
 */
export default function PageLoader({ fullscreen = false, label, className = '' }) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const text =
    label ??
    t('common.loading', {
      defaultValue: isAr ? 'جاري التحميل...' : 'Loading...',
    })

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={[
        'page-loader flex items-center justify-center animate-fade-in',
        fullscreen ? 'h-screen' : 'h-64 min-h-[40vh]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Dual-ring spinner + brand mark */}
        <div className="relative page-loader-breathe">
          {/* Outer ring */}
          <div
            className="h-14 w-14 rounded-full border-[3px] border-blue-200 dark:border-blue-900/60 border-t-blue-600 dark:border-t-blue-400 animate-spin"
            aria-hidden="true"
          />
          {/* Inner ring (reverse) */}
          <div
            className="absolute inset-2 rounded-full border-[2.5px] border-teal-100 dark:border-teal-900/50 border-b-teal-500 dark:border-b-teal-400 page-loader-ring-reverse"
            aria-hidden="true"
          />
          {/* Soft medical cross / brand mark */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-[7px] font-bold tracking-tight text-white shadow-sm shadow-blue-600/25">
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.5 1.5h3v5h5v3h-5v5h-3v-5h-5v-3h5v-5z" />
              </svg>
            </span>
          </div>
        </div>

        {/* MCSOS mark + label */}
        <div className="text-center space-y-1.5">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-blue-600/70 dark:text-blue-400/80">
            MCSOS
          </p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {text}
          </p>
          {/* Pulse dots */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500/70 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}
