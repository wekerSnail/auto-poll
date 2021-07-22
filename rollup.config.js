import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'


export default {
    input: 'src/poll.js',
    output: [{
        file: 'lib/umd/poll.umd.js', // 输出文件
        format: 'umd',  //  五种输出格式：amd /  es6 / iife / umd / cjs
        name: '$poll',  //当format为iife和umd时必须提供，将作为全局变量挂在window(浏览器环境)下：window.A=...
        sourcemap: true  //生成bundle.map.js文件，方便调试
    }, {
        file: 'lib/es/poll.es.js', // 输出文件
        format: 'es',  //  五种输出格式：amd /  es6 / iife / umd / cjs
        name: '$poll',  //当format为iife和umd时必须提供，将作为全局变量挂在window(浏览器环境)下：window.A=...
        sourcemap: true  //生成bundle.map.js文件，方便调试
    }],
    plugins: [buble()]
}