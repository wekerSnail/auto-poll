## 轮询控制器

* 支持promise函数轮询
* 支持轮询次数
* 支持轮询传参

### 使用方法

> 浏览器

```
//引入script umd

    console.log(window)
        var createPoll = $poll({
            time: 1000
        })
```

> es6

```js
import $poll from 'poll.es.js'

const createPoll = $poll({
    time: 1000
})

 function write() {
            var date = new Date()
            count = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
            document.querySelector('#count').innerHTML = count
        }

        function write2(arg) {
            var date = new Date()
            count = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
            document.querySelector('#count2').innerHTML = count + ' 这是参数：' + arg
        }
        var time = createPoll.push(write, {
            number: 10,
        })

        var time2 = createPoll.push(write2, {
            arg: 2
        })

        setTimeout(() => {
            console.log(createPoll.getPollInfo(time2))
        }, 5000)

        setTimeout(() => {

            createPoll.remove(time2)
        }, 15000)

```

### api

| 名称        | 参数                                  | 说明                                                |
| ----------- | ------------------------------------- | --------------------------------------------------- |
| $poll       | config(详见下表)  -> 全局配置         | 用于获取轮询器实例                                  |
| push        | fnc,config(详见下表)  -> 单个轮询配置 | push接口会返回一个key用户查询及销毁，类似setTimeout |
| remove      | key                                   | 移除轮询                                            |
| clear       |                                       | 重置轮询器                                          |
| getPollInfo | key                                   | 返回对应轮询信息（移除的轮询返回null）              |

### config

| 名称     | 必传  | 默认 | 类型     | 说明                                                         |
| -------- | ----- | ---- | -------- | ------------------------------------------------------------ |
| time     | false | 5000 | number   | 轮询的时间间隔                                               |
| number   | false | null | number   | 需要轮询的次数，不传或者null时为不限次数                     |
| delay    | false | 2    | number   | promise异常时，下次轮询的延迟倍数，基数是time                |
| arg      | false | null | Any      | 轮询函数需要的传参（仅在push可用，全局不支持）               |
| errEvent | false | null | function | promise异常时的错误处理函数，返回参数（err,key,next） next()代表继续执行，不调用则轮询暂停 |



#### Pormise和普通轮询的区别

传入的轮询函数是promise时，下一次轮询会在then的基础上执行，并且有异常处理,不适用异常处理函数时，会默认下次轮询延迟2被time运行
