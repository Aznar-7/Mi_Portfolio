import { useState } from 'react'

export function ProgressiveImage({ src, alt, className = '', wrapperClassName = '', eager = false, imgProps = {} }) {
  const [loaded, setLoaded] = useState(false)

  if (!src) return null

  return (
    <div className={`relative overflow-hidden bg-white/[0.035] ${wrapperClassName}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-opacity duration-300 -translate-x-full animate-shimmer ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-[opacity,transform] duration-500 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...imgProps}
      />
    </div>
  )
}
