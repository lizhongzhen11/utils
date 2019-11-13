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
 * 
 * @param {*} obj Object
 * @param {*} props Object
 * @description 比较两个对象，看obj是不是完全包容props对象内的所有自身属性以及值是否相同
 */
const match = (obj, props) => {
  let keys = Object.keys(props);
  let i = 0, len = keys.length;
  for (i; i < len; i++) {
    if (obj[keys[i]] !== props[keys[i]]) {
      return false;
    }
  }
  return true;
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
 * underscore源码复用了很多它已有的api，其本质代码应该是下面这样的。underscore通过isMatch返回true/false来判断的
 * 后来我开始参考underscore进行了改写
 */
const where = (list, props) => {
  if (type(list) !== '[object Array]' || type(props) !== '[object Object]') {
    throw new Error('第一个参数应该是一个数组，第二个参数应该是一个普通对象');
  }
  // const keys = Object.keys(props);
  let result = [], length = keys.length;
  list.forEach(item => {
    match(item, props) && result.push(item);
    // for (let i = 0; i < length; i++) {
    //   if (item[keys[i]] !== props[keys[i]]) {
    //     break;
    //   }
    //   result.push(item);
    // }
  })
  return result;
}



/**
 * 
 * @param {*} arr 
 * @param {*} prop
 * @description 类似数组的indexOf，只不过这里的数组元素是对象，查找第一个符合条件的key-value对象 
 * 难点在于必须要满足props对象内的所有key-value对。
 * 一有不符合条件就要break出来。
 * 起码编写了8分钟，还是配合控制台打印才发现错误的。
 */
const findWhere = (arr, props) => {
  if (type(arr) !== '[object Array]' || type(props) !== '[object Object]') {
    throw new Error('第一个参数应该是一个数组，第二个参数应该是一个普通对象');
  }
  // let keys = Object.keys(props);
  let i, j, length = arr.length, len = keys.length, index = -1;
  for (i = 0; i < length; i++) {
    if (match(arr[i], props)) {
      index = i;
      return index;
    }
    // for (j = 0; j < len; j++ ) {
    //   if (arr[i][keys[j]] !== props[keys[j]]) {
    //     break;
    //   }
    //   index = i;
    //   return index;
    // }
  }
  return index;
}



/**
 * 
 * @param {*} arr 
 * @param {*} fn
 * @description 得到不通过条件的数据构成的数组 
 */
const reject = (arr, fn) => {
  let i = 0, length = arr.length, result = [];
  for (i; i < length; i++) {
    !fn.call(null, arr[i]) && result.push(arr[i]);
  }
  return result;
}



/**
 * 
 * @param {*} arr 
 * @param {*} fn
 * @description 类 数组的every 
 */
const every = (arr, fn) => {
  let i = 0, len = arr.length;
  for (i; i < len; i++) {
    if (!fn.call(null, arr[i])) {
      return false;
    }
  }
  return true;
}



/**
 * 
 * @param {*} arr 
 * @param {*} fn
 * @description 类 数组的some 
 */
const some = (arr, fn) => {
  let i = 0, len = arr.length;
  for (i; i < len; i++) {
    if (fn.call(null, arrp[i])) {
      return true;
    }
  }
  return false;
}




/**
 * @description 平铺树结构；必须包含children属性
 */
const flatTree = (arr) => {
  return arr.reduce((item, next) => {
    return next.children ? item.concat(flat(next.children), next) : item.concat(next)
  }, [])
}

const city = [
  {
    value: '11',
    children: [
      {
        value: '11',
        children: [
          {
            value: '1100'
          }
        ]
      }
    ]
  },
  {
    value: '12',
    children: [
      {
        value: '120',
        children: [
          {
            value: '1200'
          }
        ]
      }
    ]
  },
  {
    value: '22',
    children: [
      {value: '220'},
      {value: '221', children: [{value: '2210'}]}
    ]
  }
]

flatTree(city); // 平铺成功



/**
 * 
 * @param {*} arr 
 * @param {*} target 
 * @param {*} start
 * @description 和some类似，但是这里可以有第三个参数，代表从指定下标开始查找 
 */
const contains = (arr, target, start = 0) => {
  if (type(arr) !== '[object Array]') {
    throw new Error('第一个参数应该是一个数组');
  }
  return arr.slice(start).includes(target);
}



/**
 * 
 * @param {*} list 集合
 * @param {*} methodName 方法名1
 * @param {*} args 其余参数
 * @description 对集合中每个元素都执行 methodName 方法，args也会作为 methodName 方法的参数调用
 */
// 只实现了传入 二维数组以及数组api功能
const invoke = (list, methodName, args) => {
  if (!list || !methodName) {
    throw new Error('请传入list和方法名');
  }
  if (type(list) === '[object Array]') {
    return list.map(item => {
      if (type(item[methodName]) === "[object Function]") {
        return item[methodName]()
      }
    })
  }
}