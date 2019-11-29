let Ctor = function () {}

const isObject = (obj) => {
  const type = typeof obj;
  return type === 'object' || type === 'function' && !!obj;
}

/**
 * @description 检索object拥有的所有可枚举属性的名称
 * 看了下源码，如果是对象，调用原生的 Object.keys
 * 源码假设如果不存在 Object.keys，则去模拟实现，但是调用了Object.hasOwnProperty
 */
const keys = (obj) => {
  if (!obj) {
    return [];
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  let results = [];
  for (let key in obj) {
    obj.hasOwnProperty(key) && results.push(key);
  }
  return results;
}

var o = {'a': 'a'}
var oo = Object.create(o)
oo.b = 'b'
// console.log(keys(oo)) // ['b']


/**
 * 
 * @param {*} obj
 * @description 检索object拥有的和继承的所有属性的名称
 * 这个直接就是 for...in 
 */
const allKeys = (obj) => {
  if (!obj) {
    return [];
  }
  let results = [];
  for (let key in obj) {
    results.push(key);
  }
  return results;
}


/**
 * 
 * @param {*} obj
 * @description 返回object对象所有的属性值 
 * 其实就是Object.values
 */
const values = (obj) => {
  let ks = keys(obj);
  let len = ks.length;
  let results = [];
  for (let i = 0; i < len; i++) {
    results.push(obj[ks[i]]);
  }
  return results;
}


/**
 * @description 转换每个属性的值
 */
const mapObject = (object, iteratee, context) => {
  const ks = keys(object);
  const len = ks.length;
  let result = {};
  for (let i = 0; i < len; i++) {
    result[ks[i]] = iteratee(object[ks[i]]);
  }
  return result;
}

// console.log(mapObject({start: 5, end: 12}, function(val, key) {
//   return val + 5;
// }))


/**
 * 
 * @param {*} obj 
 * @description 把一个对象转变为一个[key, value]形式的数组
 * 哈哈哈哈哈，除了变量名不一样，代码一模一样，套路啊
 */
const pairs = (obj) => {
  const ks = keys(obj);
  let len = ks.length;
  let results = Array(len);
  for (let i = 0; i < len; i++) {
    results[i] = [ks[i], obj[ks[i]]];
  }
  return results;
}

// console.log(pairs({one: 1, two: 2, three: 3}))


/**
 * 
 * @param {*} obj 
 * @description 返回一个object副本，使其键（keys）和值（values）对换。
 * 对于这个操作，必须确保object里所有的值都是唯一的且可以序列号成字符串
 */
const invert = (obj) => {
  const ks = keys(obj);
  let len = ks.length;
  let result = {};
  for (let i = 0; i < len; i++) {
    result[ obj[ks[i]] ] = ks[i];
  }
  return result;
}

// console.log(invert({Moe: "Moses", Larry: "Louis", Curly: "Jerome"}))


/**
 * 
 * @param {*} prototype
 * @description 简单的根据原型对象创建新对象方法 
 */
const baseCreate = (prototype) => {
  if (!isObject(prototype)) {
    return {};
  }
  let result;
  if (Object.create) {
    result = Object.create(prototype);
  } else {
    Ctor.prototype = prototype;
    result = new Ctor;
    Ctor.prototype = null;
  }
  return result;
}


/**
 * 
 * @param {*} prototype 
 * @param {*} props
 * @description 创建具有给定原型的新对象， 可选附加 props 作为 own 的属性。 
 * 基本上，和Object.create一样， 但是没有所有的属性描述符。
 * 源码还是先判断Object.create存不存在，存在用Object.create
 * 不存在的话，先用new去实例化
 */
const create = (prototype, props) => {
  // 使用 Object.setPrototypeOf
  // let result = {};
  // Object.setPrototypeOf(result, prototype);
  // const ks = keys(props);
  // const len = ks.length;
  // for (let i = 0; i < len; i++) {
  //   result[ks[i]] = props[ks[i]];
  // }
  // return result;

  // 源码
  let result = baseCreate(prototype);
  const ks = keys(props); 
  const len = ks.length;
  for (let i = 0; i < len; i++) {
    result[ks[i]] = props[ks[i]];
  }
  return result;
}


// function a () {}
// a.prototype.call = () => {
//   console.log(111)
// }

// var b = create(a.prototype, {'a': 'a'})
// b.call()
// console.log(b)




const functions = () => {
  
}