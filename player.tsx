import React from 'react'
import { IProps } from './type'
import AudioPlay from './audioPlay'
import VideoPlay from './videoPlay'

export default function Player(props: IProps) {
  const { type, options } = props
  // if (type === 'audio') {
  //   return <AudioPlay config={options} />
  // } else {
  return <VideoPlay options={options} type={type} />
  // }
}
