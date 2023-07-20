import selectors from './styles.module.scss'

export default function SongPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className={selectors.top}>{children}</section>
}
