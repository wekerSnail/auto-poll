(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.$poll = factory());
}(this, (function () { 'use strict';

    var isObject = function (obj) {
        return typeof obj === 'object'
    };

    var isFunction = function (fnc) {
        return typeof fnc === 'function'
    };

    var isNumber = function (number) {
        return typeof number === 'number'
    };

    var isPromise = function (val) {
        return isObject(val) && isFunction(val.then) && isFunction(val.catch)
    };

    var PollRequest = function PollRequest(config) {
        if ( config === void 0 ) config = {};

        this.queue = new Map(); //轮询队列
        this.configs = new Map(); //缓存轮询参数
        if (!this.checkConfig(config)) { return }
        this.default = Object.assign({
            time: 5000,
            number: null,//总共需要请求次数，默认无限
            delay: 2,//错误情况时的延迟倍数
        }, config, { arg: null });

        this.key = 0;
        this.recKey = []; //key值回收
    };

    PollRequest.prototype.getKey = function getKey () {
        if (this.recKey.length) {
            return this.recKey.shift()
        }
        return this.key++
    };

    PollRequest.prototype.checkConfig = function checkConfig (config) {
        if (isObject(config)) { return true }
        throw new Error('config must is Object')
    };

    PollRequest.prototype.push = function push (req, config) {
            if ( config === void 0 ) config = {};

        if (!this.checkConfig(config)) { return }
        var key = this.getKey();
        //相同key不在重复添加
        if (this.queue.get(key)) { return }
        //使用key作为唯一标识
        this.queue.set(key, req);
        this.configs.set(key, Object.assign({ currentNumber: 0 }, this.default, config));
        this.pollStart(key);
        return key
    };

    PollRequest.prototype.pollStart = function pollStart (key) {
        this.requsetSend(key);
    };

    PollRequest.prototype.requsetSend = function requsetSend (key) {
            var this$1$1 = this;

        //数据不存在则结束轮询
        var req = this.queue.get(key);
        if (!req) { return }

        //获取缓存的配置
        var config = this.configs.get(key) || this.default;

        //检测是否超次
        if (isNumber(config.number) && config.currentNumber >= config.number) {
            return this.remove(key)
        }

        //直接调用并传参
        var result = req(config.arg || null);
        //记录调用次数
        config.currentNumber += 1;


        //根据轮询函数的不同类型进行处理
        if (isPromise(result)) {
            result.then(function () {
                this$1$1.sendAgain(key, config.time);
            }).catch(function () {
                {
                    //出错时延长轮询时间，保证一定的体验
                    this$1$1.sendAgain(key, config.time * config.delay);
                }
            });
        } else {
            this.sendAgain(key, config.time);
        }
    };

    //轮询调用
    PollRequest.prototype.sendAgain = function sendAgain (key, time) {
            var this$1$1 = this;

        setTimeout(function () {
            this$1$1.requsetSend(key);
        }, time);
    };

    //移除一个轮询
    PollRequest.prototype.remove = function remove (key) {
        var has = this.queue.get(key);
        if (!has) { return }
        this.queue.delete(key);
        this.configs.delete(key);
        this.recKey.push(key);
    };

    //重置整个轮询器
    PollRequest.prototype.clear = function clear () {
        this.queue.clear();
        this.configs.clear();
        this.recKey = [];
        this.key = 0;
    };

    //当前获取轮询信息，已结束的信息将销毁
    PollRequest.prototype.getPollInfo = function getPollInfo (key) {
        return this.configs.get(key) || null
    };



    var createPoll = (function () {
        var tempPollRequest = null;
        return function (config) {
            if ( config === void 0 ) config = {};

            if (tempPollRequest) { return tempPollRequest }
            tempPollRequest = new PollRequest(config);
            return tempPollRequest
        }
    })();

    return createPoll;

})));
//# sourceMappingURL=poll.umd.js.map
