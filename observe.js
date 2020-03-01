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
// 目前只实现了对象属性值的修改，新增以及数组还没考虑
const observeByDefineProperty = (target) => {
  return isObject(target) ? (new DefineProperty(target)) : target
}

class DefineProperty {
  constructor(target) {
    Object.keys(target).forEach(key => {
      if (target.hasOwnProperty(key)) {
        target[key] = observeByDefineProperty(target[key])
        this.defineProperty(target, key)
      }
    })
    return target
  }
  defineProperty(target, key) {
    let oldValue = target[key]
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log('get...', key)
        return oldValue
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

let obj_1 = {a: 'a', b: {}}
observeByDefineProperty(obj_1)
console.log(obj_1.a)
obj_1.a = 1
console.log(obj_1.b)
obj_1.b.c = 'c'
console.log(obj_1.b.c)