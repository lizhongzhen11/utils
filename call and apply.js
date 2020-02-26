/**
 * @name 实现call
 * @requires 一步一步来，先用apply，bind等已有的api来实现，最后切换到不用这些api
 * @see es6我还是继续要用的，真香
 * @author lizhongzhen11
 * 
 * @readonly 这两个比bind稍微简单点，不需要考虑new操作符情况
 */

// 利用apply实现
// 一行代码解决。。。这是犯规！
const call1 = (fn, obj, ...args) => fn.apply(obj, args)

function person(name, age, weight, height) {
  this.name = name
  this.age = age
  this.weight = weight
  this.height = height
  console.log(`Hi, i an ${name}, my age is ${age}, my weight is ${weight}, and my height is ${height}`)
}
let obj = {}
// call1(person, obj, 'lizz', 27, 127, 173) // Hi, i an lizz, my age is 27, my weight is 127, and my height is 173
// console.log(obj) // { name: 'lizz', age: 27, weight: 127, height: 173 }


// 利用bind实现
const call2 = (fn, obj, ...args) => fn.bind(obj, ...args)()
// call2(person, obj, 'czx', 30, 148, 173) // Hi, i an czx, my age is 30, my weight is 148, and my height is 173
// console.log(obj) // { name: 'czx', age: 30, weight: 148, height: 173 }


// 不用apply/bind
const call = (fn, obj, ...args) => {
  obj.fn = fn
  let result = obj.fn(...args)
  delete obj.fn
  return result
}

// call(person, obj, 'xxx', 30, 180, 180) // Hi, i an xxx, my age is 30, my weight is 180, and my height is 180
// console.log(obj) // { name: 'xxx', age: 30, weight: 180, height: 180 }




/**
 * @name 实现apply
 * @requires 一步一步来，先用call，bind等已有的api来实现，最后切换到不用这些api
 */

// 利用call
const apply1 = (fn, obj, args) => fn.call(obj, ...args)

// apply1(person, obj, ['xxx', 30, 180, 180]) // Hi, i an xxx, my age is 30, my weight is 180, and my height is 180
// console.log(obj) // { name: 'xxx', age: 30, weight: 180, height: 180 }

// 利用bind
const apply2 = (fn, obj, args) => fn.bind(obj, ...args)()

// apply2(person, obj, ['xxxxxx', 30, 180, 180]) // Hi, i an xxxxxx, my age is 30, my weight is 180, and my height is 180
// console.log(obj) // { name: 'xxxxxx', age: 30, weight: 180, height: 180 }

// 不用call/bind
const apply = (fn, obj, args) => {
  obj.fn = fn
  let result = obj.fn(...args)
  delete obj.fn
  return result
}

// apply(person, obj, ['xxxxxxxxxxxx', 0, 0, 180]) // Hi, i an xxxxxxxxxxxx, my age is 0, my weight is 0, and my height is 180
// console.log(obj) // { name: 'xxxxxxxxxxxx', age: 0, weight: 0, height: 180 }
