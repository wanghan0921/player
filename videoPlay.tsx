import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IOptions } from './type'

import ProgressBar from './progress-bar'

import { MediaManager } from './manager'

export type VideoStatus = 'playing' | 'pausing' | 'waiting'
// import { imgPathTo } from '@services/lib/path'
export const PUBLIC_URL = process.env.PUBLIC_URL || ''

export function staticPathTo(path: string): string {
  if (/\/$/.test(PUBLIC_URL)) {
    return `${PUBLIC_URL}${path}`
  } else {
    return `${PUBLIC_URL}/${path}`
  }
}

export function imgPathTo(name: string): string {
  return staticPathTo('static/img/' + name)
}

export default function VideoPlay(props: { options: IOptions; type: 'audio' | 'video' }) {
  // const { src, width = '100%', height = '100%', volume = 1, loop = false } = props.options

  const videoRefs = useRef<null | HTMLVideoElement>(null)

  const [currentTime, setCurrentTime] = useState<number>(0) // 当前时间
  const [totalTime, setTotalTime] = useState<number>(0) // 视频总时长

  const [videoPaused, setVideoPaused] = useState<boolean>(false)

  const [videoStatus, setVideoStatus] = useState<VideoStatus>('waiting')

  let videoPlayer: any

  const init = useCallback(() => {
    const videoEle = videoRefs.current
    if (videoEle) {
      videoPlayer = new MediaManager(videoEle, props.options.src, props.options)
      // videoPlayer.autoPlay()
      videoPlayer.on('loadstart', () => {
        setVideoStatus('waiting')
      })
      videoPlayer.on('loadedmetadata', () => {
        setTotalTime(videoPlayer.getDuration())
      })
      videoPlayer.on('canplay', () => {
        console.log('canplay')
        videoPlayer
          .play()
          .then(() => setVideoStatus('playing'))
          .catch(() => setVideoStatus('pausing'))
      })
      videoPlayer.on('timeupdate', () => {
        setCurrentTime(videoPlayer.currentTime())
        setVideoPaused(videoPlayer.paused())
      })
    }
  }, [props.options, videoPlayer])

  useEffect(() => {
    init()
  }, [init])

  // 播放
  const play = useCallback(() => {
    videoPlayer
      .play()
      .then(() => setVideoStatus('playing'))
      .catch(() => console.log('err'))
  }, [videoPlayer])

  const onProgressBarMove = useCallback(
    (currentTime: number, originPaused?: boolean) => {
      const videoPlayer = videoRefs.current
      // 如果在拖动前的状态是播放 , 则拖动后也播放
      if (originPaused === false) play()
      if (videoPlayer) {
        setCurrentTime(currentTime)
        videoPlayer.currentTime = currentTime
      }
    },
    [play]
  )

  // 暂停
  const pause = useCallback(() => {
    videoPlayer.pause()
    setVideoStatus('pausing')
  }, [videoPlayer])

  // 播放按钮
  // const [cName, icon, action]: any = {
  //   playing: ['VideoPlay-pauseImg', imgPathTo('暂停按钮.png'), onPause, 'VideoPlay-pause'],
  //   pausing: ['VideoPlay-playImg', imgPathTo('播放按钮.png'), onPlay, 'VideoPlay-play'],
  //   waiting: ['VideoPlay-loadImg', imgPathTo('加载按钮.png'), onPause, 'VideoPlay-load']
  // }[playButtonState]

  // const statusButtonView = () => {
  const [cName, icon, action]: any = {
    playing: ['VideoPlay-pauseImg', imgPathTo('ico_暂停@3x.png'), pause, 'VideoPlay-pause'],
    pausing: ['VideoPlay-playImg', imgPathTo('ico_播放@3x.png'), play, 'VideoPlay-play'],
    waiting: ['VideoPlay-loadImg', imgPathTo('ico_加载@3x.png'), pause, 'VideoPlay-load']
  }[videoStatus]
  //   // console.log(cName, icon, action)
  //   // return <img className={cName} style={{ width: '50px', height: '50px' }} onClick={action} src={icon} />
  //   return <img style={{ width: '50px', height: '50px' }} onClick={play} src={imgPathTo('ico_播放@3x.png')} />
  // }

  const statusButtonView = (
    <img className={cName} style={{ width: '50px', height: '50px' }} onClick={action} src={icon} />
  )

  // http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4
  return (
    <>
      <ProgressBar
        currentTime={currentTime}
        videoPaused={videoPaused}
        totalTime={totalTime}
        pause={pause}
        onMoved={onProgressBarMove}
      />
      <video ref={videoRefs} />

      {statusButtonView}
    </>
  )
}
