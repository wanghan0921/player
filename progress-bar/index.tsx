import './index.css'
import React, { useEffect, useState, useMemo } from 'react'
// import { captureRef, renderTime } from '@services/lib/utils'

interface ProgressProps {
  currentTime: number
  onMoved: (currentTime: number, originPaused?: boolean) => void
  totalTime: number
  pause: () => void
  videoPaused: boolean
}

function captureRef<T>(value: T, setValue: (value: T) => void) {
  return (ref: T) => {
    if (ref && ref !== value) {
      setValue(ref)
    }
  }
}

function renderTime(time: number): string {
  const seconds = Math.round(time)

  const minute = Math.floor(seconds / 60)
  const remainderSeconds = seconds - minute * 60

  const secondsString = remainderSeconds < 10 ? '0' + remainderSeconds : remainderSeconds

  return `${minute}:${secondsString}`
}

function getCurrentX(event: TouchEvent | MouseEvent) {
  if (/mouse/.test(event.type)) {
    return (event as MouseEvent).clientX
  } else if (/touch/.test(event.type)) {
    return (event as TouchEvent).touches[0].clientX
  } else {
    throw new Error()
  }
}

function bindProgressPoint(
  current: number,
  totalTime: number,
  pointElm: HTMLDivElement,
  progressElm: HTMLDivElement,
  onMoved: (currentTime: number, originPaused?: boolean) => void,
  pause: () => void,
  videoPaused: boolean
) {
  const handleStart = (event: TouchEvent | MouseEvent) => {
    console.log('点了 , 但还没动')
    const originPaused = videoPaused
    const timePerPx = totalTime / progressElm.offsetWidth
    const originOffsetX = getCurrentX(event)

    let resultData = current
    const handleMove = (event: TouchEvent | MouseEvent) => {
      pause()
      // console.log('``````````````````', timePerPx)
      // console.log('``````````````````', originOffsetX)
      // console.log('`````````````````', getCurrentX(event))
      const offsetX = getCurrentX(event) - originOffsetX
      // console.log('`````````````````', offsetX)
      const currentTime = Math.floor(current + offsetX * timePerPx)
      resultData = Math.min(Math.max(currentTime, 0), totalTime)
      // console.log(resultData)
      // setMovedProgressData(resultData)
      // setMovedProgressData(null)
      onMoved(resultData)
      console.log('aaaaaaaaaaaaaaaaaaaaa')
    }
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('mousemove', handleMove)

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
      // setMovedProgressData(null)
      console.log(originPaused)
      onMoved(resultData, originPaused)
    }
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
  }
  pointElm.addEventListener('mousedown', handleStart)
  pointElm.addEventListener('touchstart', handleStart)
  return () => {
    pointElm.removeEventListener('mousedown', handleStart)
    pointElm.removeEventListener('touchstart', handleStart)
  }
}

export default function ProgressBar(props: ProgressProps) {
  const { currentTime, onMoved, totalTime, pause, videoPaused } = props
  const [pointElm, setPointElm] = useState<HTMLDivElement | null>(null)
  const [progressElm, setProgressElm] = useState<HTMLDivElement | null>(null)
  // const [movedProgressData, setMovedProgressData] = useState<number | null>(0)

  const currentData = useMemo(() => {
    return currentTime
  }, [currentTime])

  useEffect(() => {
    if (pointElm && progressElm) {
      return bindProgressPoint(currentData, totalTime, pointElm, progressElm, onMoved, pause, videoPaused)
    }
  }, [currentData, onMoved, pause, pointElm, progressElm, totalTime, videoPaused])

  // const ProgressCurrentTime = movedProgressData ? movedProgressData : currentTime

  return (
    <div className="ProgressBar" style={{ backgroundColor: '#000' }}>
      <div className="ProgressBar-currentTime">{renderTime(currentTime || 0)}</div>
      {/* ----------------------------------------------------------------------------- */}

      <div className="ProgressBar-progress" ref={captureRef(progressElm, setProgressElm)}>
        <div
          className="ProgressBar-progress-fg"
          style={{
            width: totalTime && totalTime > 0 ? `${(Math.min(currentTime, totalTime) / totalTime) * 100}%` : 0
          }}
        />
        <div className="ProgressBar-progress-pointBox" ref={captureRef(pointElm, setPointElm)}>
          <div className="ProgressBar-progress-point" />
        </div>
      </div>

      {/* ----------------------------------------------------------------------------- */}
      <div className="ProgressBar-totalTime">{renderTime(totalTime || 0)}</div>
    </div>
  )
}
