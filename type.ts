export interface IConfig {
  src: string
  width?: string
  height?: string
  volume?: number
  loop?: boolean
}

export interface IProps {
  type: 'audio' | 'video'
  config: IConfig
}

export enum PlayState {
  LOADING, // 加载中
  READY, // 准备完成，可以开始播放
  PLAYING, // 播放中
  PAUSED, // 已暂停
  FINISHED // 已播放完成
}
