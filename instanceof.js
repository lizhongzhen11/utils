/**
 * @see 模拟实现instanceof
 * @see 只要固定右边待检测的原型不动，上溯左边的原型链与右边原型比较即可
 * @see instance必须是引用数据类型，基本数据类型都返回false
 * @see constructor必须是对象且具有prototype属性
 */

const instanceOf = (instance, constructor) => {
  if (!constructor || !constructor.prototype) {
    throw '请传入待检测的原型'
  }
  if (!instance || (typeof instance !== 'object' && typeof instance !== 'function')) {
    return false
  }
  let targetPrototype = Object.getPrototypeOf(instance)
  let prototype = constructor.prototype
  if (targetPrototype === prototype) {
    return true
  }
  return targetPrototype ? instanceOf(targetPrototype, constructor) : false
}

console.log(instanceOf([], Array))
console.log(instanceOf(() => {}, Function))
console.log(instanceOf({}, Object))
console.log(instanceOf(1, Number)) // false