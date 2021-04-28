export interface IOptions {
  src: string
  width: string
  height: string
  volume: number
  loop: boolean
}

export interface IProps {
  type: 'audio' | 'video'
  options: IOptions
}

export enum PlayState {
  LOADING, // 加载中
  READY, // 准备完成，可以开始播放
  PLAYING, // 播放中
  PAUSED, // 已暂停
  FINISHED // 已播放完成
}

export type MediaManagerEvent =
  | 'abort' // 当音频/视频的加载已放弃时
  | 'canplay' // 当浏览器可以播放音频/视频是
  | 'canplaythrough' // 当浏览器可在不因缓冲而停顿的情况下进行播放时
  | 'durationchange' // 当音频/视频的时长已更改时
  | 'emptied' // 当目前的播放列表为空时
  | 'ended' // 当目前的播放列表已结束时
  | 'error' // 当在音频/视频加载期间发生错误时
  | 'loadeddata' // 当浏览器已加载音频/视频的当前帧时
  | 'loadedmetadata' // 当浏览器已加载音频/视频的元数据时
  | 'loadstart' // 当浏览器开始查找音频/视频时
  | 'pause' // 当音频/视频已暂停
  | 'play' // 当音频.视频已开始或不再暂停时
  | 'playing' // 当音频 / 视频在已因缓冲而停止 或 停止后已就绪时
  | 'progress' // 当浏览器正在下载音频/视频时
  | 'ratechange' // 当音频 / 视频的播放速度已更改时
  | 'seeked' // 当用户已移动 / 跳跃到音频 /视频 中的新位置时
  | 'seeking' // 当用户开始移动 / 跳跃到音频 / 视频中的新位置时
  | 'stalled' // 当浏览器尝试获取媒体数据 , 但数据不可用时
  | 'suspend' // 当浏览器刻意不获取媒体数据时
  | 'timeupdate' // 当目前的播放位置已更改时
  | 'volumechange' // 当音量已更改时
  | 'waiting' // 当视频由于需要缓冲下一帧而停止

export type NativeEventHandler = (e: Event) => void

// export type TimeupdateHandler = (percent: number, currentTime: number) => void
export type TimeupdateHandler = (currentTime: number) => void

export type MediaManagerEventHandler = TimeupdateHandler | NativeEventHandler
