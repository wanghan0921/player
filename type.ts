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
