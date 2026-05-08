import React from 'react'

const LoadingSpinner = ({
  fullScreen = false,
  size = 'md',
  text = 'Loading...',
  variant = 'pulse'
}) => {

  const sizeMap = {
    sm: {
      outer: 'w-12 h-12',
      inner: 'w-8 h-8',
      dot: 'w-2 h-2'
    },
    md: {
      outer: 'w-20 h-20',
      inner: 'w-14 h-14',
      dot: 'w-3 h-3'
    },
    lg: {
      outer: 'w-28 h-28',
      inner: 'w-20 h-20',
      dot: 'w-4 h-4'
    }
  }

  const current = sizeMap[size]

  /* ───────────────────── VARIANTS ───────────────────── */

  const variants = {

    /* RING */
    ring: (
      <div className="relative flex items-center justify-center">

        <div
          className={`
            ${current.outer}
            rounded-full
            border-[3px]
            border-white/10
          `}
        />

        <div
          className={`
            absolute
            ${current.outer}
            rounded-full
            border-[3px]
            border-transparent
            border-t-cyan-400
            border-r-fuchsia-500
            animate-spin
          `}
        />

      </div>
    ),

    /* PULSE */
    pulse: (
      <div className="relative flex items-center justify-center">

        <div
          className={`
            ${current.outer}
            rounded-full
            bg-cyan-500/20
            animate-ping
            absolute
          `}
        />

        <div
          className={`
            ${current.inner}
            rounded-full
            bg-gradient-to-br
            from-cyan-400
            via-blue-500
            to-fuchsia-500
            shadow-[0_0_60px_rgba(34,211,238,0.6)]
          `}
        />

      </div>
    ),

    /* DOTS */
    dots: (
      <div className="flex items-center gap-3">

        <div
          className={`${current.dot} rounded-full bg-cyan-400 animate-bounce`}
        />

        <div
          className={`${current.dot} rounded-full bg-fuchsia-500 animate-bounce [animation-delay:0.15s]`}
        />

        <div
          className={`${current.dot} rounded-full bg-white animate-bounce [animation-delay:0.3s]`}
        />

      </div>
    ),

    /* GLASS */
    glass: (
      <div className="relative flex items-center justify-center">

        <div
          className={`
            ${current.outer}
            rounded-[30px]
            bg-white/5
            border border-white/10
            backdrop-blur-xl
            animate-pulse
            shadow-2xl
          `}
        />

        <div
          className={`
            absolute
            ${current.inner}
            rounded-2xl
            border-[3px]
            border-transparent
            border-t-cyan-400
            border-r-purple-500
            animate-spin
          `}
        />

      </div>
    ),

    /* CYBER */
    cyber: (
      <div className="relative flex items-center justify-center">

        <div
          className={`
            ${current.outer}
            rounded-full
            border border-cyan-500/20
            absolute
            animate-ping
          `}
        />

        <div
          className={`
            ${current.inner}
            rounded-full
            border-[4px]
            border-transparent
            border-t-cyan-400
            border-l-fuchsia-500
            animate-spin
            shadow-[0_0_50px_rgba(168,85,247,0.6)]
          `}
        />

        <div
          className={`
            absolute
            ${current.dot}
            rounded-full
            bg-white
          `}
        />

      </div>
    )
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">

      {variants[variant]}

      <div className="text-center">
        <p className="text-white font-medium tracking-wide">
          {text}
        </p>

        <div className="flex justify-center gap-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse delay-150" />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-300" />
        </div>
      </div>

    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#050507] flex items-center justify-center overflow-hidden"
      >

        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />

        </div>

        {content}

      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-10">
      {content}
    </div>
  )
}

export default LoadingSpinner