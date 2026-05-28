'use client'
import { useEffect, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import Prism from 'prismjs/components/prism-core.js'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

const PRISM_LANGUAGE_MAP: Record<string, string> = {
  // Payload uses `shell`; Prism's shell grammar is `bash`
  shell: 'bash',
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  const [prismReady, setPrismReady] = useState(false)
  const [markdownReady, setMarkdownReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // Prism "components" modules patch a shared Prism instance. Ensure the
      // instance we pass into `prism-react-renderer` is the one being patched.
      ;(globalThis as typeof globalThis & { Prism?: typeof Prism }).Prism =
        Prism

      try {
        await Promise.all([
          import('prismjs/components/prism-bash.js'),
          import('prismjs/components/prism-json.js'),
          import('prismjs/components/prism-markup.js'),
          import('prismjs/components/prism-markup-templating.js'),
          import('prismjs/components/prism-python.js'),
          import('prismjs/components/prism-sql.js'),
          import('prismjs/components/prism-yaml.js'),
        ])
        if (cancelled) return
        setPrismReady(true)
      } catch {
        // If base grammars fail to load, keep `prismReady=false` and fall back.
      }

      if (cancelled) return

      // Markdown grammar is optional; if it fails to initialize, fall back to HTML-ish highlighting.
      try {
        await import('prismjs/components/prism-markdown.js')
        if (!cancelled) setMarkdownReady(true)
      } catch {
        // ignore
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!code) return null

  const effectiveLanguage =
    language === 'markdown' && !markdownReady ? 'markup' : language
  const prismLanguage =
    PRISM_LANGUAGE_MAP[effectiveLanguage] ?? effectiveLanguage

  if (!prismReady) {
    return (
      <pre
        spellCheck={false}
        className="overflow-x-auto rounded border border-border bg-black p-4 text-xs"
      >
        {code}
        <CopyButton code={code} />
      </pre>
    )
  }

  return (
    <Highlight
      code={code}
      language={prismLanguage}
      theme={themes.vsDark}
      prism={Prism}
    >
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre
          spellCheck={false}
          className="overflow-x-auto rounded border border-border bg-black p-4 text-xs"
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ className: 'table-row', line })}>
              <span className="table-cell text-right text-white/25 select-none">
                {i + 1}
              </span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
