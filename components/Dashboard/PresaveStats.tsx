import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

import './PresaveStats.scss'

const baseClass = 'presave-stats'

const PresaveStats = async () => {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch all Songs
  const songs = await payload.find({
    collection: 'songs',
    limit: 100,
  })

  // 2. Fetch all Presaves
  const presaves = await payload.find({
    collection: 'presaves',
    limit: 1000,
  })

  // 3. Calculate Stats
  // Map: { songId: count }
  const stats: Record<string | number, number> = {}

  ;(
    presaves.docs as unknown as {
      campaigns?: (string | { id: string | number })[]
    }[]
  ).forEach((user) => {
    if (user.campaigns) {
      user.campaigns.forEach((campaignItem) => {
        // Handle if campaignItem is ID or Object
        const id =
          typeof campaignItem === 'object' ? campaignItem.id : campaignItem
        stats[id] = (stats[id] || 0) + 1
      })
    }
  })

  return (
    <div className="dashboard-group">
      <h2 className="dashboard-group__title">Transmission Data</h2>
      <div className={`${baseClass}__grid`}>
        {/* Total Users Card */}
        <div className="card">
          <h4 className={`${baseClass}__card-label`}>Total Audience</h4>
          <div className={`${baseClass}__card-value`}>{presaves.totalDocs}</div>
        </div>

        {/* Songs List */}
        <div className={`${baseClass}__table-container`}>
          <table className={`${baseClass}__table`}>
            <thead>
              <tr className={`${baseClass}__thead`}>
                <th className={`${baseClass}__th`}>Song Title</th>
                <th className={`${baseClass}__th ${baseClass}__th--right`}>
                  Pre-Saves / Saves
                </th>
                <th className={`${baseClass}__th ${baseClass}__th--right`}>
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody>
              {songs.docs.map((song) => {
                const count = stats[song.id] || 0
                const conversion =
                  presaves.totalDocs > 0
                    ? ((count / presaves.totalDocs) * 100).toFixed(1)
                    : '0.0'

                return (
                  <tr key={song.id} className={`${baseClass}__tr`}>
                    <td className={`${baseClass}__td ${baseClass}__td--bold`}>
                      <Link
                        href={`/admin/collections/songs/${song.id}`}
                        className={`${baseClass}__link`}
                      >
                        {song.title}
                      </Link>
                    </td>
                    <td
                      className={`${baseClass}__td ${baseClass}__td--right ${baseClass}__td--mono`}
                    >
                      {count}
                    </td>
                    <td
                      className={`${baseClass}__td ${baseClass}__td--right ${baseClass}__td--muted`}
                    >
                      {conversion}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PresaveStats
