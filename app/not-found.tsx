import { NotFoundView } from '@/components/NotFoundView'
import { ThemeProvider } from '@/components/ThemeProvider'
import { frontendFontVariableClassName } from './(frontend)/frontend-fonts'
import './(frontend)/globals.css'

export default function NotFound() {
  return (
    <div
      className={`${frontendFontVariableClassName} flex min-h-screen flex-col font-body antialiased`}
    >
      <ThemeProvider>
        <NotFoundView
          linkMode="hard"
          sectionClassName="min-h-0 flex-1 flex-col"
        />
      </ThemeProvider>
    </div>
  )
}
