'use client'
import {
  SiYoutubemusic,
  SiSpotify,
  SiAmazon,
  SiApplemusic,
  SiSoundcloud,
  SiPandora,
} from 'react-icons/si'
import { BsDownload } from 'react-icons/bs'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import selectors from './SongLinks.module.scss'

interface StreamLinks {
  links: {
    soundcloud?: string
    amazon_music?: string
    youtube?: string
    spotify?: string
    apple_music?: string
    pandora?: string
  }
  downloadURL?: string
}

export default function SongLinks({ links, downloadURL }: StreamLinks) {
  // console.log(links)

  return (
    <div id={selectors['song_links']}>
      {links.youtube ? (
        <a
          href={links.youtube}
          rel='noopener noreferrer'
          target='_blank'
          id='youtube'
          data-tooltip-content='Listen on YouTube'
        >
          <SiYoutubemusic />
          <Tooltip anchorSelect='#youtube' place='bottom' />
        </a>
      ) : null}
      {links.spotify ? (
        <a
          href={links.spotify}
          rel='noopener noreferrer'
          target='_blank'
          id='spotify'
          data-tooltip-content='Stream on Spotify'
        >
          <SiSpotify />
          <Tooltip anchorSelect='#spotify' place='bottom' />
        </a>
      ) : null}
      {links.apple_music ? (
        <a
          href={links.apple_music}
          rel='noopener noreferrer'
          target='_blank'
          id='apple_music'
          data-tooltip-content='Stream on Apple Music'
        >
          <SiApplemusic />
          <Tooltip anchorSelect='#apple_music' place='bottom' />
        </a>
      ) : null}
      {links.amazon_music ? (
        <a
          href={links.amazon_music}
          rel='noopener noreferrer'
          target='_blank'
          id='amazon_music'
          data-tooltip-content='Stream on Amazon Music'
        >
          <SiAmazon />
          <Tooltip anchorSelect='#amazon_music' place='bottom' />
        </a>
      ) : null}
      {links.soundcloud ? (
        <a
          href={links.soundcloud}
          rel='noopener noreferrer'
          target='_blank'
          id='soundcloud'
          data-tooltip-content='Stream on SoundCloud'
        >
          <SiSoundcloud />
          <Tooltip anchorSelect='#soundcloud' place='bottom' />
        </a>
      ) : null}
      {links.pandora ? (
        <a
          href={links.pandora}
          rel='noopener noreferrer'
          target='_blank'
          id='pandora'
          data-tooltip-content='Stream on Pandora'
        >
          <SiPandora />
          <Tooltip anchorSelect='#pandora' place='bottom' />
        </a>
      ) : null}
      {downloadURL ? (
        <a
          href={`${downloadURL}?dl=`}
          data-tooltip-content='Download'
          id='download'
        >
          <BsDownload />
          <Tooltip anchorSelect='#download' place='bottom' />
        </a>
      ) : null}
    </div>
  )
}
