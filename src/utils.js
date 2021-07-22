export const isObject = (obj) => {
    return typeof obj === 'object'
}

export const isFunction = (fnc) => {
    return typeof fnc === 'function'
}

export const isNumber = (number) => {
    return typeof number === 'number'
}

export const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}