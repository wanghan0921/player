import React from 'react'
import { IOptions } from './type'

export default function AudioPlay(props: { config: IOptions }) {
  const { src } = props.config
  //https://media.lycheer.net/lecture/68865652/5bf50e0277de0c602f3b10ff_transcoded.m4a
  return <audio controls src={src} />
}
