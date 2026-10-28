import { useState, type ImgHTMLAttributes } from 'react'

export function AssetImage({ alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  // Preserve geometry if a local/remote reference stops responding.
  if (failed) return <div className={`${className} asset-fallback`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
    <span aria-hidden="true">W<span className="text-white/30">/</span>W</span>
  </div>
  return <img {...props} alt={alt ?? ''} className={className} onError={() => setFailed(true)} />
}
