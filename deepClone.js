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