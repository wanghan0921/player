import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IConfig } from './type'

import ProgressBar from './progress-bar'

export default function VideoPlay(props: { config: IConfig }) {
  const { src, width = '100%', height = '100%', volume = 1, loop = false } = props.config

  const videoRefs = useRef<null | HTMLVideoElement>(null)

  // const [progressData, setProgressData] = useState<ProgressData>({ currentTime: 0 })

  const [currentTime, setCurrentTime] = useState<number>(0)
  const totalTime = useRef<number>(0)
  const timer = useRef(0)

  const getStatus = () => {
    clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      const videoEle = videoRefs.current
      if (videoEle) {
        // console.log(videoEle.currentTime, 'currentTime') // 当前时间
        // console.log(videoEle.buffered.start(0)) // 返回表示视频已缓冲部分的 TimeRanges 对象。
        // console.log(videoEle.buffered.end(0)) // 返回表示视频已缓冲部分的 TimeRanges 对象。
        // console.log(videoEle.duration, 'duration') // 返回视频的长度（以秒计）。
        // console.log(videoEle.readyState) // 返回视频当前的就绪状态。
        // 0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息
        // 1 = HAVE_METADATA - 关于音频/视频就绪的元数据
        // 2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
        // 3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的
        // 4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放
        // setProgressData({ currentTime: videoEle.currentTime })
        setCurrentTime(videoEle.currentTime)
        totalTime.current = videoEle.duration
      }
    }, 1000)
  }

  const init = useCallback(() => {
    const videoEle = videoRefs.current
    if (videoEle) {
      videoEle.volume = volume
      videoEle.loop = loop
      // console.log(videoEle.currentTime)
      // console.log(videoEle.buffered)
      // console.log(videoEle.duration)
      // console.log(videoEle.readyState)
      // videoEle.addEventListener('loadstart', function() {
      //   console.log('loadstart')
      // })
      // videoEle.addEventListener('durationchange', function() {
      //   console.log('durationchange')
      //   console.log(videoEle.duration)
      // })
      // videoEle.addEventListener('loadedmetadata', function() {
      //   console.log('loadedmetadata')
      // })
      // videoEle.addEventListener('loadeddata', function() {
      //   console.log('loadeddata')
      // })
      // videoEle.addEventListener('progress', function() {
      //   console.log('progress')
      // })
      // videoEle.addEventListener('canplay', function() {
      //   console.log('canplay')
      // })
      // videoEle.addEventListener('canplaythrough', function() {
      //   console.log('canplaythrough')
      // })
      getStatus()
    }
  }, [loop, volume])

  useEffect(() => {
    init()
  }, [init, loop, volume])

  const onProgressBarMove = useCallback((currentTime: number) => {
    const videoPlayer = videoRefs.current
    if (videoPlayer) {
      console.log(111111)
      setCurrentTime(currentTime)
      // videoPlayer.seek(currentTime)
      videoPlayer.currentTime = currentTime
    }
  }, [])

  const turnOFF = useCallback(() => {
    const videoPlayer = videoRefs.current
    if (videoPlayer) {
      videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause()
    }
  }, [])

  // http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4
  return (
    <div>
      <ProgressBar currentTime={currentTime} totalTime={totalTime.current} onMoved={onProgressBarMove} />
      <video ref={videoRefs} src={src} width={width} height={height} muted autoPlay controls />
    </div>
  )
}
