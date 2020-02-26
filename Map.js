/**
 * @name 模拟Map数据结构
 * @author lizhongzhen11
 * @host https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map
 * 
 * @see 传[],null或不传都可生成一个空的Map对象
 * @see 和Set一样，实例化时参数必须是可迭代对象
 * @see 和Set不同，它只接受key-value对
 * @see 数组splice方法，splice(-1,1)会删除第一个元素
 * @see 和Set一样，删除时需要把后面的key前移；原先的最后一个位置空出来，可以删掉
 * @see 在Map和Set中NaN算相等的值，通过数组includes可以避开；但是删除时indexOf无法识别NaN，换成findIndex
 */

class MyMap {
  constructor (iterator) {
    this.size = 0
    this.length = 0
    this.cacheKeys = []
    this.cacheValues = []
    this.map = {}
    if (!iterator) {
      return this
    }
    if (!iterator[Symbol.iterator]) {
      throw '请传入可迭代对象'
    }
    for (let v of iterator) {
      this.map[this.size++] = v
    }
    return this
  }
  keys () {
    return this.cacheKeys
  }
  values () {
    return this.cacheValues
  }
  set (key, value) {
    let index = this.cacheKeys.indexOf(key)
    if (index !== -1) {
      this.cacheValues[index] = value
      return this
    }
    this.cacheKeys.push(key)
    this.cacheValues.push(value)
    this.map[this.size++] = [key, value]
    return this
  }
  get (key) {
    let index = this.cacheKeys.indexOf(key)
    return this.cacheValues[index]
  }
  delete (key) {
    let index = this.cacheKeys.findIndex(item => item === key || Number.isNaN(item) === Number.isNaN(key))
    if (index === -1) {
      return false
    }
    this.cacheKeys.splice(index, 1)
    this.cacheValues.splice(index, 1)
    for (let i = index; i < this.size; i++) {
      this.map[index] = this.map[index + 1]
    }
    this.size -= 1
    delete this.map[this.size]
    return true
  }
  clear () {
    this.cacheKeys.length = 0
    this.cacheValues.length = 0
    this.map = {}
    this.size = 0
  }
  has (key) {
    return this.cacheKeys.includes(key)
  }
  forEach (cb, thisArg) {
    for (let i = 0; i < this.size; i++) {
      cb.apply(thisArg, this.map[i])
    }
  }
  entries () { // 这个不想模拟了，应该需要返回一个新的迭代器对象
    return this
  }
  [Symbol.iterator] () {
    let self = this
    let i = 0
    return {
      next () {
        if (i < self.size) {
          return {
            value: self.map[i++],
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

let m = new MyMap()
console.log(m) // MyMap { size: 0, length: 0, cacheKeys: [], cacheValues: [], map: {} }
console.log(m.has(1)) // false
m.set(1)
console.log(m)
// MyMap {
//   size: 1,
//   length: 0,
//   cacheKeys: [ 1 ],
//   cacheValues: [ undefined ],
//   map: { '0': [ 1, undefined ] }
// }
console.log(m.has(1)) // true
m.set(NaN, NaN)
console.log(m.has(NaN)) // true
m.set(undefined, undefined)
console.log(m)
// MyMap {
//   size: 3,
//   length: 0,
//   cacheKeys: [ 1, NaN, undefined ],
//   cacheValues: [ undefined, NaN, undefined ],
//   map: {
//     '0': [ 1, undefined ],
//     '1': [ NaN, NaN ],
//     '2': [ undefined, undefined ]
//   }
// }
console.log(m.delete(NaN)) // true
console.log(m)
// MyMap {
//   size: 2,
//   length: 0,
//   cacheKeys: [ 1, undefined ],
//   cacheValues: [ undefined, undefined ],
//   map: { '0': [ 1, undefined ], '1': [ undefined, undefined ] }
// }
for (let v of m) {
  console.log(v)
}
// [ 1, undefined ]
// [ undefined, undefined ]
// console.log(m.entries())