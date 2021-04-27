import React from 'react'
import { IProps } from './type'
import AudioPlay from './audioPlay'
import VideoPlay from './videoPlay'

export default function Player(props: IProps) {
  const { type, config } = props
  if (type === 'audio') {
    return <AudioPlay config={config} />
  } else {
    return <VideoPlay config={config} />
  }
}
