// utils/websocket.js

// // 手动关闭连接
// // ws.close()
export default class WebSocket {
    constructor(options = {}) {
        const defaultOptions = {
            url: 'wss://1.15.115.21:9000/ws/1',
            // url: `ws://1.15.115.21:8089//ws/${sid}`,
            heartInterval: 30000, // 心跳间隔
            reconnInterval: 5000, // 重连间隔
            maxReconnAttempts: 5, // 最大重连次数
            heartMsg: 'ping', // 心跳消息
            isReconn: true // 是否自动重连
        }

        this.options = Object.assign({}, defaultOptions, options)
        this.wsTask = null
        this.reconnAttempts = 0
        this.messageQueue = []
        this.isActiveClose = false // 是否主动关闭
        this.heartTimer = null
        this.serverTimer = null
        this.status = 'disconnected' // 连接状态

        this.init()
    }

    // 初始化连接
    init() {
        this.wsTask = uni.connectSocket({
            url: this.options.url,
            success: () => {
                this.status = 'connecting'
            }
        })

        this.wsTask.onOpen(() => {
            this.status = 'connected'
            this.reconnAttempts = 0 // 重置重连次数
            this.options.onOpen?.()
            this.startHeartBeat()
            this.flushMessageQueue()
        })

        this.wsTask.onMessage((res) => {
            this.options.onMessage?.(res.data)
            this.resetHeartBeat() // 收到消息重置心跳
        })

        this.wsTask.onClose(() => {
            this.status = 'disconnected'
            this.clearTimers()
            this.options.onClose?.()
            if (!this.isActiveClose && this.options.isReconn) {
                this.reconnect()
            }
        })

        this.wsTask.onError((err) => {
            this.status = 'error'
            this.options.onError?.(err)
            if (this.options.isReconn) this.reconnect()
        })
    }

    // 发送消息
    send(msg) {
        if (this.status === 'connected') {
            this.wsTask.send({
                data: msg,
                success: () => {
                    this.resetHeartBeat()
                }
            })
        } else {
            this.messageQueue.push(msg)
        }
    }

    // 手动关闭
    close() {
        this.isActiveClose = true
        this.wsTask?.close()
    }

    // 重新连接
    reconnect() {
        if (this.reconnAttempts >= this.options.maxReconnAttempts) return

        this.reconnAttempts++
        this.status = 'reconnecting'
        setTimeout(() => {
            this.init()
        }, this.options.reconnInterval)
    }

    // 开启心跳检测
    startHeartBeat() {
        this.heartTimer = setInterval(() => {
            this.send(this.options.heartMsg)
            this.serverTimer = setTimeout(() => {
                this.wsTask?.close()
            }, this.options.heartInterval)
        }, this.options.heartInterval)
    }

    // 重置心跳检测
    resetHeartBeat() {
        clearTimeout(this.serverTimer)
    }

    // 清空定时器
    clearTimers() {
        clearInterval(this.heartTimer)
        clearTimeout(this.serverTimer)
        this.heartTimer = null
        this.serverTimer = null
    }

    // 发送队列中的消息
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift()
            this.send(msg)
        }
    }
}