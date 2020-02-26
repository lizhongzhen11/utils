/**
 * 
 * @name 模拟new操作符
 * @author lizhongzhen11
 * @host https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new
 * 
 * @see 能够使用new的都是constructor（构造器），其实就是Function
 * 
 * @readonly 参数列表如何传给新生成的对象？当然是调用constructor传参了，但是必须把this改为新创建的obj
 * 
 * @important 构造函数如果有返回值，则会覆盖obj
 */

const myNew = (constructor, ...args) => {
  if (typeof constructor !== 'function') {
    throw '请传入构造函数'
  }
  let obj = Object.create(null)
  Object.setPrototypeOf(obj, constructor.prototype)
  let result = constructor.call(obj, ...args)
  return result && typeof result === 'object' ? result : obj
}