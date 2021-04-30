import './index.css'
import React, { useEffect, useState, useMemo } from 'react'
// import { captureRef, renderTime } from '@services/lib/utils'

interface ProgressProps {
  currentTime: number
  onMoved: (currentTime: number, originPaused?: boolean) => void
  totalTime: number
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
  setMovedProgressData: (current: number | null) => void
) {
  const handleStart = (event: TouchEvent | MouseEvent) => {
    console.log('点了 , 但还没动')
    const timePerPx = totalTime / progressElm.offsetWidth
    const originOffsetX = getCurrentX(event)

    let resultData = current
    const handleMove = (event: TouchEvent | MouseEvent) => {
      const offsetX = getCurrentX(event) - originOffsetX
      const currentTime = Math.floor(current + offsetX * timePerPx)
      resultData = Math.min(Math.max(currentTime, 0), totalTime)
      setMovedProgressData(resultData)
      console.log('拖动中')
    }
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('mousemove', handleMove)

    const handleEnd = () => {
      console.log('松手了')
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
      setMovedProgressData(null)
      onMoved(resultData)
    }
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
  }
  pointElm.addEventListener('mousedown', handleStart, true)
  pointElm.addEventListener('touchstart', handleStart, true)
  return () => {
    pointElm.removeEventListener('mousedown', handleStart, true)
    pointElm.removeEventListener('touchstart', handleStart, true)
  }
}

export default function ProgressBar(props: ProgressProps) {
  const { currentTime, onMoved, totalTime } = props
  const [pointElm, setPointElm] = useState<HTMLDivElement | null>(null)
  const [progressElm, setProgressElm] = useState<HTMLDivElement | null>(null)
  const [movedProgressData, setMovedProgressData] = useState<number | null>(0)

  const currentData = useMemo(() => {
    return currentTime
  }, [currentTime])

  useEffect(() => {
    if (pointElm && progressElm) {
      return bindProgressPoint(currentData, totalTime, pointElm, progressElm, onMoved, setMovedProgressData)
    }
  }, [currentData, onMoved, pointElm, progressElm, totalTime, setMovedProgressData])

  const ProgressCurrentTime = movedProgressData ? movedProgressData : currentTime

  return (
    <div className="ProgressBar" style={{ backgroundColor: '#000' }}>
      <div className="ProgressBar-currentTime">{renderTime(ProgressCurrentTime || 0)}</div>
      {/* ----------------------------------------------------------------------------- */}

      <div className="ProgressBar-progress" ref={captureRef(progressElm, setProgressElm)}>
        <div
          className="ProgressBar-progress-fg"
          style={{
            width: totalTime && totalTime > 0 ? `${(Math.min(ProgressCurrentTime, totalTime) / totalTime) * 100}%` : 0
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
