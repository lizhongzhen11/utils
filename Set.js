/**
 * @name 模拟Set
 * @author lizhongzhen11 
 * @host https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set
 * 
 * @readonly 必须要对api非常熟悉，不然只能对着MDN模拟，那么就毫无意义
 * @readonly Set 其实类似 类数组对象
 * @readonly 实例化时要么不传要么接受 iterable 对象（具有Symbol.iterator属性），传null也行，效果与不传一致
 * 
 * @see 删除时indexOf无法识别NaN，把indexOf换成findIndex
 * @important NaN 和undefined 都可以被存储在 Set 中，NaN被视为相等（数组的includes方法完美帮我避开这个坑）
 * 
 * @important Set 都具有Symbol.iterator属性，可迭代。Symbol.iterator方法需要重点注意
 * 
 * @important entries也是返回一个新的迭代器对象。值为[value, value]形式
 * 
 * @important 迭代器对象需要掌握，不然只能边看api边模拟，我目前就是这样的。。。这玩意不用就忘！
 * 
 * @important delete操作，后面的key自动前移一位
 */

class MySet {
  constructor (iterable) {
    this.set = {}
    this.tempVal = []
    this.size = 0
    if (iterable == null) {
      return this
    }
    if (iterable && !iterable[Symbol.iterator]) {
      throw '不是可迭代对象'
    }
    for (let v of iterable) {
      this.add(v)
    }
    this.size = this.tempVal.length
    return this
  }
  add (value) {
    if (!this.tempVal.includes(value)) {
      this.set[this.tempVal.length] = value
      this.tempVal.push(value)
      this.size += 1
    }
  }
  clear () {
    let len = this.tempVal.length
    for (let i = 0 ; i < len; i++) {
      delete this.set[i]
    }
    this.tempVal.length = 0
    this.size = 0
  }
  delete (value) { // 这里烦点，删除后，原先占据的key也让出来了，若后面还有元素，它们相应的需要前移一位
    let index = this.tempVal.findIndex(item => item === value || Number.isNaN(value) === Number.isNaN(item))
    let len = this.tempVal.length
    if (index !== -1) {
      for (let i = index; i < len - 1; i++) {
        this.set[i] = this.set[i + 1]
      }
      delete this.set[len - 1]
      this.tempVal.splice(index, 1)
      this.size -= 1
      return true
    }
    return false
  }
  entries () {
    let obj = {}
    this.tempVal.forEach((item, index) => obj[index] = [item, item])
    obj[Symbol.iterator] = () => {
      let i = 0
      let self = this
      return {
        next () {
          if (i < self.tempVal.length) {
            return {
              value: obj[i++],
              done: false
            }
          } else {
            return {
              value: undefined,
              done: true
            }
          }
        }
      }
    }
    return obj
  }
  forEach (cb, thisArg) {
    this.tempVal.forEach(item => cb.call(thisArg, item, item))
  }
  has (value) {
    return this.tempVal.includes(value)
  }
  keys () {
    return this.values()
  }
  values () {
    let self = this
    return {
      set: self.set,
      [Symbol.iterator]: self[Symbol.iterator]
    }
  }
  [Symbol.iterator] () {
    let i = 0
    let self = this
    return {
      next () {
        if (i < self.tempVal.length) {
          return {
            value: self.tempVal[i++],
            done: false
          }
        } else {
          return {
            value: undefined,
            done: true
          }
        }
      }
    }
  }
}

let ms = new MySet()
let obj = {}
ms.add(1)
ms.add(2)
ms.add(obj)
console.log(ms) // MySet {set: {0: 1, 1: 2, 2: {}}, tempVal: [1, 2, {}], size: 3}
console.log('MySet has...', ms.has(obj)) // MySet has..., true
console.log('MySet delete...', ms.delete(2)) // true
console.log(ms) // MySet { set: { '0': 1, '1': {} }, tempVal: [ 1, {} ], size: 2 }
console.log(ms.values())
// {
//   set: { '0': 1, '1': {} },
//   [Symbol(Symbol.iterator)]: [Function: [Symbol.iterator]]
// }
console.log(ms.entries())
// {
//   '0': [ 1, 1 ],
//   '1': [ {}, {} ],
//   [Symbol(Symbol.iterator)]: [Function]
// }
ms.clear()
console.log(ms) // MySet { set: {}, tempVal: [], size: 0 }
ms.add('')
ms.add(NaN)
ms.add()
console.log(ms)
// MySet {
//   set: { '0': '', '1': NaN, '2': undefined },
//   tempVal: [ '', NaN, undefined ],
//   size: 3
// }
ms.delete(NaN)
console.log(ms)
// MySet {
//   set: { '0': '', '1': undefined },
//   tempVal: [ '', undefined ],
//   size: 2
// }