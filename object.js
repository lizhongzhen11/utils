let Ctor = function () {}

/**
 * 
 * @param {*} obj
 * @description 判断是不是对象 
 */
const isObject = (obj) => {
  const type = typeof obj;
  return type === 'object' || type === 'function' && !!obj;
}

/**
 * 
 * @param {*} func
 * @description 判断是不是函数 
 */
const isFunc = (func) => {
  return typeof func === 'function';
}

/**
 * @description 没啥好说的
 */
const isNull = (obj) => {
  return obj === null;
}

/**
 * 
 * @param {*} obj
 * @description 怕 undefined 被人为赋值 
 */
const isUndefined = (obj) => {
  return obj === void 0;
}

const isNaN = (n) => {
  if (Number.isNaN) {
    return Number.isNaN(n);
  }
  return typeof n === 'number' && !(n === n);
}

/**
 * 
 * @param {*} obj
 * @description 通过内置对象来判断的 
 */
const isError = (obj) => {
  return Object.prototype.toString.call(date) === '[object Error]';
}

const isRegExp = (reg) => {
  return Object.prototype.toString.call(date) === '[object RegExp]';
}

const isDate = (date) => {
  return Object.prototype.toString.call(date) === '[object Date]';
}

const isBoolean = (boolean) => {
  return Object.prototype.toString.call(boolean) === '[object Boolean]';
}

const isFinite = (n) => {
  return n === Infinity || n === -Infinity;
}

const isNumber = (n) => {
  return Object.prototype.toString.call(n) === '[object Number]';
}

const isString = (str) => {
  return Object.prototype.toString.call(str) === '[object String]';
}

/**
 * 
 * @param {*} obj
 * @description 如果object是一个参数对象，返回true
 * 这个我也不会，我也刚知道 callee 可以区分是不是 arguments
 * 
 *  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments/callee
 * 根据MDN所说，callee 是 arguments 对象的一个属性。
 */
const isArguments = (obj) => {
  return has(obj, 'callee');
}

const isArray = (arr) => {
  if (Array.isArray) {
    return Array.isArray(arr);
  }
  return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
 * 
 * @param {*} ele
 * @description 这个真不会，原来 nodeType === 1 就是dom对象啊
 */
const isElement = (ele) => {
  return !!(ele && ele.nodeType === 1);
}

/**
 * 
 * @param {*} obj 
 * @description 类数组
 */
const isArrayLike = (obj) => {
  if (!isObject(obj) || isFunc(obj) || !obj.length) {
    return false;
  }
  const keysIsNumber = keys(obj).every(item => isNumber(item) || item === 'length');
  const len = obj.length;
  return keysIsNumber && len >= 0 && len <= Number.MAX_SAFE_INTEGER && isNumber(len);
}

/**
 * 
 * @param {*} obj
 * @description 如果 object 不包含任何值(没有可枚举的属性)，返回true 
 * 对于字符串和类数组（array-like）对象，如果length属性为0，那么isEmpty检查返回true
 */
const isEmpty = (obj) => {
  if (obj == null) {
    return true;
  }
  if (isObject(obj)) {
    return keys(obj).length === 0;
  }
  if (isString(obj) || isArrayLike(obj)) {
    return obj.length === 0;
  }
  return false;
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



/**
 * 
 * @param {*} obj 
 * @description 返回一个对象里所有的方法名, 
 * 而且是已经排序的 — 也就是说, 对象里每个方法(属性值是一个函数)的名称.
 */
const functions = (obj) => {
  // 自己实现，忘了排序，用到了keys，相当于用了两次循环
  // if (!obj) {
  //   return [];
  // }
  // let results = [];
  // let ks = keys(obj);
  // let len = ks.length;
  // for (let i = 0; i < len; i++) {
  //   isFunc(obj[ks[i]]) && results.push(ks[i]);
  // }
  // return results;

  // 源码，只用了一次for循环，但是会拿到继承过来的属性
  let results = [];
  for (let key in obj) {
    isFunc(obj[key]) && results.push(key);
  }
  return results.sort();
}

// let f = {
//   'a': 'a',
//   'f': () => {},
//   'fun': () => {}
// }

// console.log(functions(f)) // ['f', 'fun']


/**
 * 
 * @param {*} obj 
 * @param {*} predicate 
 * @param {*} context 
 * @description 与 findIndex 类似，不过是在 obj 上找到key
 * 返回 predicate 结果为真的 key 或者 undefined
 */
const findKey = (obj, predicate, context) => {
  // for...in 的顺序问题，以及会拿到继承过来的属性
  // 源码用到了keys
  // for (let key in obj) {
  //   if (predicate(obj[key])) {
  //     return key;
  //   }
  // }

  const ks = keys(obj);
  const len = ks.length;
  for (let i = 0; i < len; i++) {
    if (predicate(obj[ks[i]])) {
      return ks[i];
    }
  }
}

// let fk = {
//   'a': 1,
//   'b': 3,
//   'c': ''
// }
// console.log(findKey(fk, (item) => item == 0)) // c


/**
 * 
 * @param {*} destination 
 * @param  {...any} sources
 * @description 复制source对象中的所有属性覆盖到destination对象上，并且返回 destination 对象.
 * 复制是按顺序的, 所以后面的对象属性会把前面的对象属性覆盖掉(如果有重复). 
 * 
 * 注意点：
 * 1. destination 对象会被改变
 * 2. 同时继承 源对象原型上的属性
 * 3. 我犯了大错，我错误的以为目标对象已存在的属性不用覆盖，大错特错
 */
const extend = (destination, ...sources) => {
  // 没有考虑到 for...in 会得到继承过来的属性问题
  // 但是源码用到的 allKeys 的确是 for...in
  const len = sources.length;
  for (let i = 0; i < len; i++) {
    for (let k in sources[i]) {
      destination[k] = sources[i][k];
    }
  }
  return obj;
}

// const t = {
//   'a': 1
// }
// const s1 = {
//   'a': 2,
//   'b': 2
// }
// const s2 = {
//   'b': 3,
//   'c': NaN
// }
// extend(t, s1, s2)
// console.log(t, s1, s2) // { a: 2, b: 3, c: NaN } { a: 2, b: 2 } { b: 3, c: NaN }



/**
 * 
 * @param {*} destination 
 * @param  {...any} sources 
 * @description 类似于 extend, 但只复制自己的属性覆盖到目标对象。
 * （注：不包括继承过来的属性）
 */
const extendOwn = (destination, ...sources) => {
  const len = sources.length;
  for (let i = 0; i < len; i++) {
    let ks = keys(sources[i]);
    for (let j = 0; j < ks.length; j++) {
      destination[ks[j]] = sources[i][ks[j]];
    }
  }
  return obj;
}

// let p = {'a': 1, 'b': 2}
// let pp = create(p, {'a': 2});
// let ppp = create(p, {c: 3})
// extendOwn(pp, ppp)
// console.log(pp, ppp) // { a: 2, c: 3 } { c: 3 }

/**
 * 
 * @param {*} obj 
 * @param  {...any} defaults 
 * @description 用defaults对象填充 obj 中的undefined属性。
 * 并且返回这个obj。
 * 一旦这个属性被填充，再使用defaults方法将不会有任何效果。
 * 
 * 有点像 extendOwn, 只不过不能覆盖已存在的属性
 * 
 * 源码确实将其与extend和extendOwn用的同一个核心方法
 */
const defaults = (obj, ...defaults) => {
  // 粗糙版
  let len = defaults.length;
  for (let i = 0; i < len; i++) {
    let s = defaults[i];
    const sKs = keys(s);
    let sLen = sKs.length;
    for (let j = 0; j < sLen; j++) {
      let key = sKs[j];
      if (obj[key] === undefined) {
        obj[key] = s[key];
      }
    }
  }
  return obj;
}

// let d1 = {'a': '1'}
// let d2 = {'a': 2, 'b': 1}
// let d3 = {'b': 2, 'c': ''}
// defaults(d1, d2, d3)
// console.log(d1, d2, d3) // { a: '1', b: 1, c: '' } { a: 2, b: 1 } { b: 2, c: '' }

// 源码将 extend 和 extendOwn 还有 defaults 三个合在一起实现的，通过闭包传入keys或allKeys来实现
const createAssigner = (func, isDefault) => {
  return (description, ...sources) => {
    const len = sources.length;
    for (let i = 0; i < len; i++) {
      let ks = func(sources[i]);
      let sLen = ks.length;
      let s = sources[i];
      for (let j = 0; j < sLen; j++) {
        let key = ks[j];
        if (!isDefault || description[key] === undefined) {
          description[key] = s[key];
        }
      }
    }
    return description;
  }
}

const extend2 = createAssigner(allKeys);
const extendOwn2 = createAssigner(keys);
const defaults2 = createAssigner(keys, true);

// const t = {
//   'a': 1
// }
// const s1 = {
//   'a': 2,
//   'b': 2
// }
// const s2 = {
//   'b': 3,
//   'c': NaN
// }
// extend(t, s1, s2)
// console.log(t, s1, s2) // { a: 2, b: 3, c: NaN } { a: 2, b: 2 } { b: 3, c: NaN }
// let p = {'a': 1, 'b': 2}
// let pp = create(p, {'a': 2});
// let ppp = create(p, {c: 3})
// extendOwn(pp, ppp)
// console.log(pp, ppp) // { a: 2, c: 3 } { c: 3 }

// let d1 = {'a': '1'}
// let d2 = {'a': 2, 'b': 1}
// let d3 = {'b': 2, 'c': ''}
// defaults2(d1, d2, d3)
// console.log(d1, d2, d3) // { a: '1', b: 1, c: '' } { a: 2, b: 1 } { b: 2, c: '' }




/**
 * 
 * @param {*} obj 
 * @param  {...any} keys
 * @description 返回一个object副本，只过滤出keys(有效的键组成的数组)参数指定的属性值。 
 * 或者接受一个判断函数，指定挑选哪个key。
 * 
 * 注意点：
 * 1. 第二个参数可能是函数，个人不是很喜欢这种类型不确定传参
 */
const pick = (obj, ...keys) => {
  let result = {};
  if (isFunc(keys[0])) {
    const testFunc = keys[0];
    for (let k in obj) {
      if (testFunc(obj[k], k, obj)) {
        result[k] = obj[k];
      }
    }
  } else {
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      result[keys[i]] = obj[keys[i]];
    }
  }
  return result;
}

// console.log(pick({name: 'moe', age: 50, userid: 'moe1'}, 'name', 'age')) // { name: 'moe', age: 50 }
// console.log(pick({name: 'moe', age: 50, userid: 'moe1'}, function(value, key, object) {
//   return value === 50;
// })) // { age: 50 }



/**
 * 
 * @param {*} obj 
 * @param  {...any} keys 
 * @description 返回一个object副本，
 * 只过滤出除去keys(有效的键组成的数组)参数指定的属性值。 
 * 或者接受一个判断函数，指定忽略哪个key。
 * 
 * 和 pick 很像，只是在核心判断处不同
 */
const omit = (obj, ...keys) => {
  // 粗糙版
  let result = {};
  if (isFunc(keys[0])) {
    const testFunc = keys[0];
    for (let k in obj) {
      if (!testFunc(obj[k], k, obj)) {
        result[k] = obj[k];
      }
    }
  } else {
    for (let k in obj) {
      if (!keys.includes(k)) {
        result[k] = obj[k];
      }
    }
  }
  return result;
}

// console.log(omit({name: 'moe', age: 50, userid: 'moe1'}, 'name', 'age')) // { userid: 'moe1' }
// console.log(omit({name: 'moe', age: 50, userid: 'moe1'}, function(value, key, object) {
//   return value === 50;
// })) // { name: 'moe', userid: 'moe1' }



/**
 * @description 创建 一个浅复制（浅拷贝）的克隆object。
 * 任何嵌套的对象或数组都通过引用拷贝，不会复制。
 * 
 * 注意点：
 * 1. 需要区分是数组对象，还是普通对象
 * 2. 数组对象的 slice 就是浅拷贝
 * 
 * 源码很好的复用了之前的extend方法，一开始我都没想到
 */
const clone = (obj) => {
  return Array.isArray(obj) ? obj.slice() : extend2({}, obj);
}

// let clone1 = {'a': ''}
// let clone2 = clone(clone1)
// clone1.a = 2
// console.log(clone1, clone2)


/**
 * 
 * @param {*} obj 
 * @param {*} interceptor 
 * @description 用 obj 作为参数来调用函数interceptor，然后返回 obj
 * 这种方法的主要意图是作为函数链式调用 的一环, 为了对此对象执行操作并返回对象本身。
 */
const tap = (obj, interceptor) => {
  interceptor(obj);
  return obj;
}



/**
 * @description 对象是否包含给定的键
 * 等同于object.hasOwnProperty(key)，但是使用 hasOwnProperty 函数的一个安全引用，以防意外覆盖
 * 
 * 操，想了一个多小时，愣是不会模拟 object.hasOwnProperty
 * 看了源码，发现他就是引用 object.hasOwnProperty，根本没有自己实现！
 * 当然，要注意排除 null
 */
const has = (obj, key) => {
  return obj != null && obj.hasOwnProperty(key);
}



/**
 * 
 * @param {*} key
 * @description 返回一个函数，这个函数返回任何传入的对象的key属性。 
 */
const property = (key) => {
  return (obj) => {
    return obj[key];
  }
}

// var stooge = {name: 'moe'};
// console.log('moe' === property('name')(stooge)) // true

/**
 * 
 * @param {*} obj 
 * @description 和property相反
 * 需要一个对象，并返回一个函数,这个函数将返回一个提供的属性的值。
 */
const propertyOf = (obj) => {
  return (key) => {
    return obj[key];
  }
}

// var stooge = {name: 'moe'};
// console.log(propertyOf(stooge)('name'))


/**
 * @description 返回一个断言函数，这个函数会给你一个断言可以用来辨别给定的对象是否匹配attrs指定键/值属性。
 */
const matcher = (attrs) => {
  return () => {

  }
}


/**
 * 
 * @param {*} obj 
 * @param {*} props
 * @description 告诉你 props 中的键和值是否包含在 obj 中 
 */
const isMatch = (obj, props) => {
  let ks = keys(props);
  let len = ks.length;
  for (let i = 0; i < len; i++) {
    let key = ks[i];
    if (!has(obj, key) || obj[key] !== props[key]) {
      return false;
    }
  }
  return true;
}

// var stooge = {name: 'moe', age: 32};
// console.log(isMatch(stooge, {age: 32}))

/**
 * 
 * @param {0} obj 
 * @param {*} other
 * @description 两个对象之间的优化深度比较，确定他们是否应被视为相等 
 */
const isEqual = (obj, other) => {}