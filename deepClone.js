/**
 * @name 深拷贝
 * @author lizhongzhen11
 * @see JSON.parse(JSON.stringify())的确能进行深拷贝，只是对于undefined,function,Symbol,NaN,Infinity,Date,Map,Set等无能为力
 * @host https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 * 
 * @description 基于以上缺陷，需要写一个较好的深拷贝函数来应对日常开发。起码undefined,function,NaN,Infinity,Date等能正常拷贝才行
 * @readonly 难点：
 * @see Symbol如何深拷贝？我把它放到原始值里面直接赋值了。
 * @see Date如何深拷贝？我也不知道。。。还是百度的=>再次实例化就行了！！！ new Date(obj[key])
 * @see Array这种特殊的Object需要考虑到！！！
 * @see 循环引用如何避免？增加第二个参数，缓存所有已出现过的父级对象（包括数组），只要确定父级对象数组中存在该对象，说明它是循环引用！
 * @see Function如何深拷贝？我还真不知道怎么做。看到有这样的：
 * (new fn).constructor，但是测试发现并不行
 * 后来刷知乎发现，通过bind改变this执行即可返回新函数！！！
 * 但是这应该不叫深拷贝，例如：
 * function test1() {}
 * test1.obj = {prop: {key: ''}}
 * let test2 = test1.bind(null)
 * test2.obj // undefined
 * 
 * 所以这里不叫深拷贝了，它只是得到新函数，旧函数上绑定的属性新函数并没有拷贝过来，
 * 其实不应该有这种需求。
 */

const deepClone = (obj, fathers = []) => {
  if (isPrimitive(obj)) {
    return obj
  }
  let result = Array.isArray(obj) ? [] : Object.create(null)
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) { // 不拷贝原型上的属性
      break
    }
    if (isPrimitive(obj[key])) {
      result[key] = obj[key]
      continue
    }
    switch (Object.prototype.toString.call(obj[key])) {
      case '[object Object]':
        fathers = [...fathers, obj]
        if (!fathers.includes(obj[key])) {
          result[key] = deepClone(obj[key], fathers)
        }
        break
      case '[object Array]':
        fathers = [...fathers, obj]
        result[key] = []
        for (let i = 0; i < obj[key].length; i++) {
          if (!fathers.includes(obj[key])) {
            result[key][i] = deepClone(obj[key][i], fathers)
          } 
        }
        break
      case '[object Date]':
        result[key] = new Date(obj[key])
        break
      case '[object Function]':
        result[key] = obj[key].bind(obj)
        break
      default:
        result[key] = obj[key]
    }
  }
  return result
}

// 判断是不是原始值
const isPrimitive = (obj) => {
  let primitiveType = ['[object Null]', '[object Undefined]', '[object Number]', '[object Boolean]', '[object String]', '[object BigInt]', '[object Symbol]']
  return primitiveType.includes(Object.prototype.toString.call(obj))
}



let obj = {a : 1, b: NaN, c: undefined, d: Infinity, e: true, f: '', g: null, h: {}, i: new Date(), j: [], k: () => {}}
obj.h.a = obj
obj.j.push({obj: obj})
obj.k.a = 'a'
let obj1 = deepClone(obj)
obj1.a = 2
obj1.h.a = NaN 
obj1.j[0]['pp'] = '...'
console.log(obj1)
console.log(obj1.k.a) // undefined
console.log(obj)

let obj2 = [1, {a: 1}]
let obj3 = deepClone(obj2)
obj3.push(NaN)
console.log(obj2) // [ 1, { a: 1 } ]
console.log(obj3) // [ 1, [Object: null prototype] { a: 1 }, NaN ]





// 策略模式改写下
// 依赖于 Object.prototype.toString.call 未被改变
const typing = (target) => {
  return Object.prototype.toString.call(target)
}

// 将各个类型对应的处理方式封装好
const handler = {
  '[object primitive]': (target) => { // 非 Object 类型全走这里
    return target
  },
  '[object Function]': (fn, cachObj) => {
    // return fn.bind(null) // 这里是生成新的函数，严格意义上不算深拷贝
    // return fn // 正常来说也没这种需求，可以直接返回原来的函数
    // 还可以选择遍历函数自有属性，通过深拷贝这些自有属性以及改变this值可以近似的认为深拷贝吧，
    // 不过这个需求其实很操蛋，没道理存在
    let newFn = fn.bind(null)
    Object.keys(fn).forEach(key => {
      if (fn.hasOwnProperty(key)) {
        newFn[key] = deepClone2(fn[key], cachObj)
      }
    })
    return newFn
  },
  '[object Array]': (arr, cachObj) => {
    // let array = []
    // arr.forEach(item => {
    //   array.push(deepClone2(item))
    // })
    // return array
    return arr.map(item => deepClone2(item, cachObj))
  },
  '[object Object]': (obj, cachObj) => {
    if (cachObj.includes(obj)) { // 防止循环引用
      return '循环引用'
    }
    cachObj.push(obj) // 防止循环引用
    let keys = Object.keys(obj)
    let object = Object.create(null)
    keys.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        object[key] = deepClone2(obj[key], cachObj)
      }
    })
    return object
  },
}


// 改版
const deepClone2 = (target, cachObj = []) => {
  let type = typing(target)
  // 可选链，有对应的babel插件;
  // 不用babel插件的话，谷歌浏览器需要开放相应的能力才能运行
  return handler?.[type]?.(target, cachObj) || handler['[object primitive]'](target) 
  // return handler[type] ? handler[type](target, cachObj) : handler['[object primitive]'](target)
}


let obj4 = {a : 1, b: NaN, c: undefined, d: Infinity, e: true, f: '', g: null, h: {}, i: new Date(), j: [], k: () => {}}
obj4.h.a = obj4
obj4.j.push({obj: obj4})
obj4.k.a = 'a'
let obj5 = deepClone2(obj4)
obj5.a = 2
obj5.h.a = NaN 
obj5.j[0]['pp'] = '...'
console.log(obj5)
console.log(obj5.k.a)
console.log(obj4)