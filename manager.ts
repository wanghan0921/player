import { MediaManagerEvent, NativeEventHandler, TimeupdateHandler, MediaManagerEventHandler } from './type'

declare const wx: any

export interface MediaManagerOptions {
  autoplay?: boolean
  preload?: 'preload' | 'auto' | 'none'
  loop?: boolean
  height?: string
  width?: string
  volume?: number
}

export class MediaManager {
  private mediaHTMLElement: HTMLMediaElement
  private timeupdateHandlers: TimeupdateHandler[] = []
  private timeupdateEventHandler: () => void

  constructor(private type: 'audio' | 'video', private src: string, private options: MediaManagerOptions) {
    this.mediaHTMLElement = this.createMediaElement(this.type, this.src)
    this.timeupdateEventHandler = this.timeupdateHandler.bind(this)
  }

  // 创建媒体元素 , 初始化属性
  private createMediaElement(type: 'audio' | 'video', src: string) {
    const mediaHTMLElement = document.createElement(type)
    mediaHTMLElement.src = src
    mediaHTMLElement.volume = this.options.volume || 1
    mediaHTMLElement.autoplay = this.options.autoplay || true
    mediaHTMLElement.preload = this.options.preload || 'auto'
    mediaHTMLElement.loop = this.options.loop || false
    mediaHTMLElement.controls = false
    mediaHTMLElement.style.height = this.options.height || '100%'
    mediaHTMLElement.style.width = this.options.width || '100%'
    if (this.type === 'video') {
      mediaHTMLElement.setAttribute('playsinline', '')
      mediaHTMLElement.setAttribute('webkit-playsinline', '')
      mediaHTMLElement.setAttribute('x5-playsinline', 'true')
      mediaHTMLElement.setAttribute('x-webkit-airplay', 'true')
    }
    return mediaHTMLElement
  }

  getElement() {
    return this.mediaHTMLElement
  }

  /**
   * 更改音频/视频元素的当前来源
   * @param {string} src 源
   */
  changeSrc(src: string) {
    if (!this.mediaHTMLElement) return
    this.mediaHTMLElement.src = src
  }

  /**
   * 返回当前音频/视频的长度（以秒计）
   * @returns {number} 总时长
   */
  getDuration() {
    return this.mediaHTMLElement.duration
  }

  /**
   * 返回音频/视频中的当前播放位置（以秒计）
   * @returns {Number} 当时时间
   */
  currentTime() {
    return this.mediaHTMLElement.currentTime
  }

  /**
   * 返回表示音频/视频已缓冲部分的 TimeRanges 对象
   * @returns TimeRanges
   * @params length - 获得音视频中已缓冲范围的数量
   * @params start(index) - 获得某个已缓冲范围的开始位置
   * @params end(index) - 获得某个已缓冲范围的结束位置
   */
  buffered() {
    return this.mediaHTMLElement.buffered
  }

  // getMediaProperty(name: string) {
  //   return this.mediaHTMLElement[name]
  // }

  // setMediaProperty(name: string, value: any) {
  //   this.mediaHTMLElement[name] = value
  // }

  destroy() {
    this.timeupdateHandlers = []
  }

  /**
   * 封装 play 方法为 promise
   * @returns {Promise} Promise
   */
  play(): Promise<void> {
    const currentTime = this.currentTime()
    const playPromise = this.mediaHTMLElement.play()
    // chrome 支持 play 方法为 promise, 直接返回
    if (playPromise !== undefined) {
      return playPromise
    }
    // 不支持 promise 的浏览器，每 50 毫秒轮询一次播放进度，确认播放是否成功
    return new Promise((resolve, reject) => {
      let retryTimes = 0
      const playInterval = setInterval(() => {
        // 轮询 200 次之后(10秒) 返回失败
        retryTimes++
        if (retryTimes > 200) {
          clearInterval(playInterval)
          return reject()
        }
        if (this.mediaHTMLElement.currentTime > currentTime) {
          clearInterval(playInterval)
          return resolve()
        }
      }, 50)
    })
  }

  /**
   * 自动播放处理
   * @description ios 不支持自动播放，只能在用户主动激活的操作中调用播放
   * @returns {Promise} Promise
   */
  autoPlay() {
    return new Promise((resolve: (value: unknown) => void, _) => {
      const autoPlayHandler = (event: string) => {
        const startPlay = () => {
          document.removeEventListener(event, startPlay)
          // this.mediaHTMLElement.load()
          this.play().then(resolve)
        }
        document.addEventListener(event, startPlay)
      }
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      const isWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
      // 微信里监听 WeixinJSBridgeReady 事件
      if (isWechat) {
        if (typeof wx === 'undefined') {
          autoPlayHandler('WeixinJSBridgeReady')
        } else {
          wx.ready(() => {
            alert('ready')
            this.play().then(resolve)
          })
          wx.error(() => {
            alert('error')
            this.play().then(resolve)
          })
        }
      } else if (iOS) {
        // iOS touchstart 事件
        autoPlayHandler('touchstart')
      } else {
        // 其他浏览器尝试自动播放，无法播放时会绑定用户事件激活
        this.play().catch(() => {
          const clickEventType = document.ontouchstart !== null ? 'click' : 'touchstart'
          autoPlayHandler(clickEventType)
        })
      }
    })
  }

  /**
   * 暂停当前播放的视频。
   */
  pause() {
    this.mediaHTMLElement.pause()
  }

  /**
   * 设置音频/视频的播放位置
   * @param {number} time 用户已移动/跳跃到音频/视频中的新位置
   * @returns
   */
  seek(time: number) {
    const duration = this.getDuration()
    // TODO
    if (time > duration) {
      return
    }
    this.mediaHTMLElement.currentTime = time
  }

  /**
   * 设置音频/视频播放的速度
   * @param {number} rate
   */
  changeSpeed(rate: number) {
    this.mediaHTMLElement.playbackRate = rate
  }

  /**
   * 当目前的播放位置已更改时处理方法
   */
  // TODO
  private timeupdateHandler() {
    // const total = this.getDuration()
    const current = this.currentTime()
    // const percent = (current / total) * 100
    this.timeupdateHandlers.forEach(handler => {
      // handler(percent, current)
      handler(current)
    })
  }

  on(event: MediaManagerEvent, handler: MediaManagerEventHandler) {
    if (event === 'timeupdate') {
      this.timeupdateHandlers.push(handler as TimeupdateHandler)
      this.mediaHTMLElement.addEventListener('timeupdate', this.timeupdateEventHandler)
      return
    }
    this.mediaHTMLElement.addEventListener(event, handler as NativeEventHandler)
  }

  off(event: MediaManagerEvent, handler: MediaManagerEventHandler) {
    if (event === 'timeupdate') {
      this.timeupdateHandlers = this.timeupdateHandlers.filter(h => h !== handler)
      if (this.timeupdateHandlers.length === 0) {
        this.mediaHTMLElement.removeEventListener('timeupdate', this.timeupdateEventHandler)
      }
      return
    }
    this.mediaHTMLElement.removeEventListener(event, handler as NativeEventHandler)
  }
}
