/**
 * @name observe
 * @see 监听对象属性值改变，一般mvvm库都有这种需求
 * @see 两种核心api:
 * 1. Object.defineProperty() 忘了这个api怎么用的了
 * 2. proxy 
 * 
 * @description 这里打算两种都实现下
 */


// 通用的判断是不是对象
const isObject = (target) => {
  return target && typeof target === 'object'
}

// proxy版本
const observeByProxy = (target) => {
  return isObject(target) ? (new ProxyObserve(target)) : target
}

class ProxyObserve {
  constructor(target) {
    this.target = target
    Object.keys(this.target).forEach(key => {
      if (this.target.hasOwnProperty(key)) {
        this.target[key] = observeByProxy(this.target[key]) // 这里是容易遗忘的点，需要对嵌套对象也进行拦截
      }
    })
    return this.proxy()
  }
  proxy() {
    return new Proxy(this.target, {
      get(target, key) {
        console.log('get...', key)
        return target[key]
      },
      set(target, key, value) {
        console.log('set...', value)
        if (target[key] === value) {
          return true
        }
        target[key] = observeByProxy(value)
        return true
      }
    })
  }
}


let obj = {
  a: 'a',
  b: {
    c: 'c',
    d: {
      e: []
    }
  }
}
// let observeObj = observeByProxy(obj)
// observeObj.f = 1
// observeObj.b.d.e.push('hello')
// console.log(observeObj.b.d.e)


// Object.defineProperty版本
// 目前只实现了对象属性值的修改
const observeByDefineProperty = (target) => {
  return isObject(target) ? (new DefineProperty(target)) : target
}

// 监听数组对象，必须要魔改下 能改变数组自身的方法
const methods = ['push', 'pop', 'splice', 'shift', 'unshift', 'sort', 'reserve']

class DefineProperty {
  constructor(target) {
    Object.keys(target).forEach(key => {
      if (target.hasOwnProperty(key)) {
        target[key] = observeByDefineProperty(target[key])
        this.defineProperty(target, key)
      }
    })
    Array.isArray(target) && methods.forEach(method => this.defineProperty(target, method, true))
    return target
  }
  defineProperty(target, key, isArray) {
    let oldValue = target[key]
    let self = this
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log('get...', key)
        return isArray ? (...args) => {
          // 这段代码有弊端，虽然保证数组改变后，其下标也被监听了，
          // 但是如果超出当前数组长度，采用直接下标赋值方式则无法监听
          let oldLen = target.length
          let res = Array.prototype[key].call(target, ...args)
          let newLen = target.length
          let diff = newLen - oldLen
          if (diff > 0) {
            for (let i = 0; i < diff; i++) {
              self.defineProperty(target, oldLen + i)
            }
          }
          return res
        } : oldValue
      },
      set(newValue) {
        console.log('set...', newValue)
        if (newValue === oldValue) {
          return
        }
        observeByDefineProperty(newValue)
        oldValue = newValue // 注意和Proxy方式的区别
      }
    })
  }
}

// let obj_1 = {a: 'a', b: {c: {}}}
// observeByDefineProperty(obj_1)
// console.log(obj_1.a)
// obj_1.a = 1
// console.log(obj_1.b)
// obj_1.b.c.d = 'd'
// console.log(obj_1.b.c.d)

let arr = [1]
observeByDefineProperty(arr)
arr.push(1, 2, 3)
arr.splice(2)
console.log(arr.push(1, 2, 3))
console.log(arr.splice(2))
console.log(arr[1])
arr[1] = 10

// let arr = []
// Object.defineProperty(arr, 'push', {
//   enumerable: true,
//   configurable: true,
//   writable: true,
//   value: (...args) => {
//     return Array.prototype['push'].call(arr, ...args)
//   }
// })

// arr.push(1)
// console.log(arr.push(1))
// console.log(arr.length)