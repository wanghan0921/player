import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IProps } from './type'

import { MediaManager } from './manager'

import ProgressBar from './progress-bar'

export type VideoStatus = 'playing' | 'pausing' | 'waiting'

export default function VideoPlay(props: IProps) {
  // const { src, width = '100%', height = '100%', volume = 1, loop = false } = props.options
  const { type, options } = props

  const videoRefs = useRef<null | HTMLVideoElement>(null)

  const [currentTime, setCurrentTime] = useState<number>(0) // 当前时间
  const totalTime = useRef<number>(0) // 视频总时长

  const [videoPaused, setVideoPaused] = useState<boolean>(false)

  const playerElement = React.createRef<HTMLDivElement>()

  const url = options.src
  const mediaManager = new MediaManager(type, url, options)
  const mediaElement = mediaManager.getElement()

  const handleTotalTime = () => {
    const videoEle = videoRefs.current
    if (videoEle) {
      totalTime.current = videoEle.duration
    }
  }
  const onTimeUpdate = () => {
    const videoEle = videoRefs.current
    if (videoEle) {
      // console.log(videoEle.currentTime, 'currentTime') // 当前时间
      console.log(videoEle.buffered)
      console.log(videoEle.buffered.start(0)) // 返回表示视频已缓冲部分的 TimeRanges 对象。
      console.log(videoEle.buffered.end(0)) // 返回表示视频已缓冲部分的 TimeRanges 对象。
      // console.log(videoEle.duration, 'duration') // 返回视频的长度（以秒计）。
      // console.log(videoEle.readyState) // 返回视频当前的就绪状态。
      // 0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息
      // 1 = HAVE_METADATA - 关于音频/视频就绪的元数据
      // 2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
      // 3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的
      // 4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放
      // setProgressData({ currentTime: videoEle.currentTime })
      setCurrentTime(videoEle.currentTime)
      setVideoPaused(videoEle.paused)
      console.log(videoEle.networkState, 'networkState')
      handleTotalTime()
    }
    // }, 1000)
  }

  const onSeeked = () => {
    const videoEle = videoRefs.current
    if (videoEle) {
      console.log('onSeeked....onSeeked....onSeeked...onSeeked')
    }
  }

  const onSeeking = () => {
    const videoEle = videoRefs.current
    if (videoEle) {
      console.log('onSeeking....onSeeking....onSeeking...onSeeking')
    }
  }

  const init = useCallback(() => {
    const videoEle = videoRefs.current
    if (videoEle) {
      videoEle.volume = options.volume
      videoEle.loop = options.loop
      // console.log(videoEle.paused, 'init')
      // videoPaused.current = videoEle.paused
      // console.log(videoEle.currentTime)
      // console.log(videoEle.buffered)
      // console.log(videoEle.duration)
      // console.log(videoEle.readyState)
      videoEle.addEventListener('loadstart', function() {
        console.log('loadstart')
      })

      videoEle.addEventListener('durationchange', handleTotalTime)
      videoEle.addEventListener('loadedmetadata', function() {
        console.log('loadedmetadata')
      })
      videoEle.addEventListener('loadeddata', function() {
        console.log('loadeddata')
        totalTime.current = videoEle.duration
      })
      videoEle.addEventListener('progress', function() {
        console.log('progress')
      })
      videoEle.addEventListener('canplay', function() {
        console.log('canplay')
      })
      videoEle.addEventListener('canplaythrough', function() {
        console.log('canplaythrough')
      })
      // getStatus()
      return () => {
        videoEle.removeEventListener('durationchange', handleTotalTime)
      }
    }
  }, [options.loop, options.volume])

  useEffect(() => {
    playerElement.current && playerElement.current.appendChild(mediaElement)
  }, [init, mediaElement, playerElement])

  // 播放
  const play = () => {
    videoRefs.current && videoRefs.current.play()
  }

  const onProgressBarMove = useCallback((currentTime: number, originPaused?: boolean) => {
    const videoPlayer = videoRefs.current
    // 如果在拖动前的状态是播放 , 则拖动后也播放
    if (originPaused === false) play()
    if (videoPlayer) {
      setCurrentTime(currentTime)
      videoPlayer.currentTime = currentTime
    }
  }, [])

  // 暂停
  const pause = () => {
    videoRefs.current && videoRefs.current.pause()
  }

  // http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4
  return (
    <div>
      <ProgressBar
        currentTime={currentTime}
        videoPaused={videoPaused}
        totalTime={totalTime.current}
        pause={pause}
        onMoved={onProgressBarMove}
      />
      <div ref={playerElement}></div>
      {/* <video
        ref={videoRefs}
        onTimeUpdate={onTimeUpdate}
        onSeeked={onSeeked}
        onSeeking={onSeeking}
        src={src}
        width={width}
        height={height}
        controls
      /> */}
    </div>
  )
}
