/**
 * @description 判断是不是类数组对象。参考underscore，根据鸭子类型来判断。需要长度在 0 和 Number的最大安全值之间。
 */
const isArrayLike = (obj) => {
  return typeof obj.length === 'number' && obj.length >= 0 && obj.length <= Number.MAX_SAFE_INTEGER;
}

/**
 * 
 * @param {*} arg
 * @description 确定类型 
 */
const type = (arg) => {
  return Object.prototype.toString.call(arg);
}

/**
 * @description 返回callback函数
 */
const optimizeCb = () => {}

/**
 * 
 * @param {*} wait 
 * @param {*} func
 * @description 节流函数
 *              一定时间内只执行一次 
 */
const throttle = (func, wait) => {
  let timeout;
  return (...args) => {
    if (!timeout) {
      func(...args);
      timeout = setTimeout(() => {
        timeout = null;
      }, wait)
    }
  }
}

/**
 * 
 * @param {*} obj 
 * @param {*} cb 
 * @param {*} context 
 * @description 遍历数组，类数组和对象
 */
const each = (obj, cb, context) => {
  let i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      cb.call(context, obj[i]);
    }
  } else {
    // 可能是普通对象
    let keys = Object.keys(obj);
    length = keys.length;
    for (i = 0; i < length; i++) {
      cb.call(context, obj[keys[i]])
    }
  }
}


/**
 * 
 * @param {*} obj 
 * @param {*} cb
 * @description 模拟的是数组map方法，只不过对象也可以。核心代码与each一样 
 */
const map = (obj, cb) => {
  let i, length, result = [];
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      result.push(cb.call(obj, obj[i]));
    }
  } else {
    let keys = Object.keys(obj);
    length = keys.length;
    for (i = 0; i < length; i++) {
      result.push(cb.call(obj, obj[keys[i]]));
    }
  }
  return result;
}


/**
 * 
 * @param {*} obj 
 * @param {*} cb 
 * @param {*} initial 
 * @description 难点在于不论 typeof NaN 还是 type(NaN) 都无法区分它是不是 number。需要用Number.isNaN()来判断
 */
const reduce = (obj, cb, initial = 0) => {
  let i, length, result = initial, curr;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      curr = cb.call(obj, obj[i])
      if (type(curr) !== '[object Number]' || Number.isNaN(curr)) {
        return undefined
      }
      result += curr;
    }
  }
  return result;
}

/**
 * 
 * @param {*} arr 
 * @param {*} cb
 * @description 模拟数组find 
 */
const find = (arr, cb) => {
  if (type(arr) !== '[object Array]') {
    throw new Error('请传递一个数组');
  }
  let i, length = arr.length, isPass;
  for (i = 0; i < length; i++) {
    isPass = cb.call(arr, arr[i]);
    if (isPass) {
      return arr[i];
    }
  }
  return undefined;
}


/**
 * @description 模拟数组filter。记住最终返回所有符合元素构成的数组。cb必须返回true或false。
 */
const filter = (arr, cb) => {
  if (type(arr) !== '[object Array]') {
    throw new Error('请传递一个数组');
  }
  let i, length = arr.length, result = [];
  for (i = 0; i < length; i++) {
    !!cb.call(arr, arr[i]) && result.push(arr[i]);
  }
  return result;
}


/**
 * 
 * @param {*} list 
 * @param {*} props
 * @description 在数组对象里面根据给定的对象key-value值找对应符合条件的所有对象，并返回一个数组 
 * underscore源码复用了很多它已有的api，其本质代码应该是下面这样的
 */
const where = (list, props) => {
  if (type(list) !== '[object Array]' || type(props) !== '[object Object]') {
    throw new Error('第一个参数应该是一个数组，第二个参数应该是一个普通对象');
  }
  const keys = Object.keys(props);
  let result = [], length = keys.length;
  list.forEach(item => {
    for (let i = 0; i < length; i++) {
      item[keys[i]] === props[keys[i]] && result.push(item);
    }
  })
  return result;
}