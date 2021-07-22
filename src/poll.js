import { isPromise, isObject, isNumber } from './utils'
class PollRequest {
    constructor(config = {}) {
        this.queue = new Map() //轮询队列
        this.configs = new Map() //缓存轮询参数
        if (!this.checkConfig(config)) return
        this.default = Object.assign({
            time: 5000,
            number: null,//总共需要请求次数，默认无限
            delay: 2,//错误情况时的延迟倍数
        }, config, { arg: null })

        this.key = 0
        this.recKey = [] //key值回收
    }

    getKey() {
        if (this.recKey.length) {
            return this.recKey.shift()
        }
        return this.key++
    }

    checkConfig(config) {
        if (isObject(config)) return true
        throw new Error('config must is Object')
        return false
    }

    push(req, config = {}) {
        if (!this.checkConfig(config)) return
        const key = this.getKey()
        //相同key不在重复添加
        if (this.queue.get(key)) return
        //使用key作为唯一标识
        this.queue.set(key, req)
        this.configs.set(key, Object.assign({ currentNumber: 0 }, this.default, config))
        this.pollStart(key)
        return key
    }

    pollStart(key) {
        this.requsetSend(key)
    }

    requsetSend(key) {
        //数据不存在则结束轮询
        const req = this.queue.get(key)
        if (!req) return

        //获取缓存的配置
        const config = this.configs.get(key) || this.default

        //检测是否超次
        if (isNumber(config.number) && config.currentNumber >= config.number) {
            return this.remove(key)
        }

        //直接调用并传参
        const result = req(config.arg || null)
        //记录调用次数
        config.currentNumber += 1


        //根据轮询函数的不同类型进行处理
        if (isPromise(result)) {
            result.then(() => {
                this.sendAgain(key, config.time)
            }).catch((e) => {
                {
                    const next = () => {
                        this.sendAgain(key, config.time * config.delay)
                    }
                    if (config.errEvent) {
                        config.errEvent(e, key, next)
                    } else {
                        next()
                    }
                    //出错时延长轮询时间，保证一定的体验

                }
            })
        } else {
            this.sendAgain(key, config.time)
        }
    }

    //轮询调用
    sendAgain(key, time) {
        setTimeout(() => {
            this.requsetSend(key)
        }, time)
    }

    //移除一个轮询
    remove(key) {
        const has = this.queue.get(key)
        if (!has) return
        this.queue.delete(key)
        this.configs.delete(key)
        this.recKey.push(key)
    }

    //重置整个轮询器
    clear() {
        this.queue.clear()
        this.configs.clear()
        this.recKey = []
        this.key = 0
    }

    //当前获取轮询信息，已结束的信息将销毁
    getPollInfo(key) {
        return this.configs.get(key) || null
    }
}



const createPoll = (function () {
    let tempPollRequest = null
    return function (config = {}) {
        if (tempPollRequest) return tempPollRequest
        tempPollRequest = new PollRequest(config)
        return tempPollRequest
    }
})()


export default createPoll