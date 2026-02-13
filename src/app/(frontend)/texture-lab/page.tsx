'use client'

import React, { useState, useEffect } from 'react'

const TextureLab = () => {
  // SVG Filter Params
  const [baseFrequencyX, setBaseFrequencyX] = useState(0.8)
  const [baseFrequencyY, setBaseFrequencyY] = useState(0.8) // Often kept same, but nice to split
  const [numOctaves, setNumOctaves] = useState(3)
  const [stitchTiles, setStitchTiles] = useState<'stitch' | 'noStitch'>('stitch')

  // ColorMatrix Params (Contrast/Sparsity Control)
  // Standard Matrix Identity:
  // 1 0 0 0 0
  // 0 1 0 0 0
  // 0 0 1 0 0
  // 0 0 0 1 0
  //
  // For High Contrast Alpha Channel:
  // 0 0 0 0 1  (R = 1)
  // 0 0 0 0 1  (G = 1)
  // 0 0 0 0 1  (B = 1)
  // 0 0 0 [slope] [intercept] (A = slope * inputAlpha + intercept)
  // A high slope increases strictness (contrast), intercept shifts threshold
  const [alphaSlope, setAlphaSlope] = useState(100)
  const [alphaIntercept, setAlphaIntercept] = useState(-87)

  // Output Opacity
  const [outputOpacity, setOutputOpacity] = useState(0.6)

  // Blend Mode for Review
  const [blendMode, setBlendMode] = useState<string>('screen')

  // --- GENERATE SVG STRING ---
  const generateSvgString = () => {
    // 1. Construct the inner SVG content
    // Note: We use mostly single quotes inside to avoid escaping hell if possible, or careful double quotes
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="${baseFrequencyX === baseFrequencyY ? baseFrequencyX : `${baseFrequencyX} ${baseFrequencyY}`}" numOctaves="${numOctaves}" stitchTiles="${stitchTiles}" />
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${alphaSlope} ${alphaIntercept}" />
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="${outputOpacity}" />
</svg>`

    return svgContent
  }

  // --- ENCODE TO BASE64 ---
  const getBase64String = () => {
    const svg = generateSvgString()
    // btoa needs binary string, so we might need encoding if we had special chars, but standard ASCII is fine here
    return typeof window !== 'undefined' ? window.btoa(svg) : ''
  }

  const base64Url = `data:image/svg+xml;base64,${getBase64String()}`
  // Tailwind doesn't support dynamic arbitrary values in class names at runtime.
  // We'll output the style object for the user to copy.
  const copyString = `style={{ backgroundImage: \`url('${base64Url}')\` }}`

  // --- COPY TO CLIPBOARD ---
  const [copied, setCopied] = useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Effect to log for debugging if needed
  // useEffect(() => { console.log(generateSvgString()) }, [baseFrequencyX, numOctaves, alphaIntercept])

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- LEFT: CONTROLS --- */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">Texture Lab</h1>
            <p className="text-muted-foreground text-sm">
              Tweak SVG parameters to generate a noise texture.
              <br />
              <span className="text-xs opacity-70">
                Tip: High alpha slope + low intercept = Sparse Particles.
              </span>
            </p>
          </div>

          <div className="space-y-6 bg-card/20 p-6 rounded-lg border border-white/10">
            {/* Base Frequency */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary">
                Base Frequency (Grain Size)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    X: {baseFrequencyX}
                  </span>
                  <input
                    type="range"
                    min="0.01"
                    max="2.0"
                    step="0.01"
                    value={baseFrequencyX}
                    onChange={(e) => setBaseFrequencyX(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    Y: {baseFrequencyY}
                  </span>
                  <input
                    type="range"
                    min="0.01"
                    max="2.0"
                    step="0.01"
                    value={baseFrequencyY}
                    onChange={(e) => setBaseFrequencyY(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Octaves */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Octaves (Detail): {numOctaves}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={numOctaves}
                onChange={(e) => setNumOctaves(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="h-px bg-white/10 my-4" />

            {/* Alpha Threshold (Sparsity) */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-accent">Sparsity & Contrast</label>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Slope (Contrast/Hardness): {alphaSlope}
                </span>
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={alphaSlope}
                  onChange={(e) => setAlphaSlope(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Intercept (Threshold): {alphaIntercept}
                </span>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Lower values = Fewer particles (more transparency).
                </p>
                <input
                  type="range"
                  min="-200"
                  max="0"
                  step="1"
                  value={alphaIntercept}
                  onChange={(e) => setAlphaIntercept(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            {/* Opacity */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Output Opacity: {outputOpacity}
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={outputOpacity}
                onChange={(e) => setOutputOpacity(parseFloat(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            {/* Blend Mode */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Preview Blend Mode</label>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm"
              >
                <option value="normal">normal</option>
                <option value="screen">screen</option>
                <option value="overlay">overlay</option>
                <option value="soft-light">soft-light</option>
                <option value="plus-lighter">plus-lighter</option>
              </select>
            </div>
          </div>

          {/* CODE OUTPUT */}
          <div className="bg-black border border-white/20 rounded-lg p-4 relative group">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Generated Style Object
            </h3>
            <div className="overflow-x-auto whitespace-pre-wrap break-all text-[10px] text-primary font-mono bg-white/5 p-2 rounded max-h-32 overflow-y-auto">
              {copyString}
            </div>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-primary text-black text-xs px-3 py-1 rounded font-bold hover:bg-white transition-colors"
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* --- RIGHT: PREVIEW --- */}
        <div className="sticky top-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Preview</h2>
            {/* CARD PREVIEW */}
            <div className="relative w-full aspect-square md:aspect-video bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Background Gradients (to test transparency) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-gray-900 to-slate-900" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay" />

              {/* THE TEXTURE LAYER */}
              {/* applying the raw style directly to avoid massive class string issues in DOM preview if it gets truncated */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `url('${base64Url}')`,
                  // @ts-ignore
                  mixBlendMode: blendMode,
                }}
              />

              {/* Foreground Content Mockup */}
              <div className="relative z-20 text-center space-y-2 p-8 bg-black/40 backdrop-blur-sm rounded border border-white/10">
                <h3 className="text-2xl font-bold text-white">Song Title</h3>
                <p className="text-primary text-sm uppercase tracking-widest">Artist Name</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Raw SVG Output</h2>
            <div className="p-4 bg-white/5 rounded border border-white/10 text-[10px] whitespace-pre font-mono overflow-x-auto">
              {generateSvgString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextureLab
