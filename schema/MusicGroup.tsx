import Script from 'next/script'

export const MusicGroupSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'The Second Messenger',
    url: 'https://thesecondmessenger.com',
    logo: 'https://thesecondmessenger.com/imgs/logos/circle-crow.png', // Update with your actual logo URL
    image: 'https://thesecondmessenger.com/imgs/michael/michael-today.jpg', // Update with a band photo
    sameAs: [
      'https://www.youtube.com/@TheSecondMessenger',
      'https://open.spotify.com/artist/44ueDtWuMKuBOqFE7CS7ax?si=YOxdEKxFQQmmvAs5OpTcng',
      'https://www.instagram.com/the2ndmsngr/',
      'https://www.facebook.com/TheSecondMessenger/',
      'https://www.tiktok.com/@the2ndmsngr',
      'https://music.youtube.com/channel/UC7s-BDNomZ-sqKCecBIRrjQ',
      'https://music.apple.com/us/artist/the-second-messenger/1528822765',
      'https://music.amazon.com/artists/B08GH5L2XF/the-second-messenger',
      'https://tidal.com/artist/21016548',
      'https://soundcloud.com/thesecondmessenger',
      'https://www.qobuz.com/us-en/interpreter/the-second-messenger/7784222',
      'https://www.deezer.com/us/artist/104889592',
      'https://www.pandora.com/artist/the-2nd-messenger/ARq9ch556cPPjrV',
      // Add other social links here
    ],
    description:
      'Sci-Fi Rock project by Michael Zeta. Melodic modern rock transmissions from California.',
    genre: ['Rock', 'Sci-Fi Rock', 'Alternative'],
    location: {
      '@type': 'Place',
      name: 'California, USA',
    },
    member: [
      {
        '@type': 'Person',
        name: 'Michael Zeta',
        url: 'https://thesecondmessenger.com/bio',
      },
    ],
  }

  return (
    <Script
      id="music-group-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
