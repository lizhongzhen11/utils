const isArrayLike = (obj) => {
  const isKeyNumber = Object.keys(obj).every(item => (item.trim() && Number(item) >= 0) || item === 'length');
  return isKeyNumber && 
            type(obj.length) === '[object Number]' && 
                obj.length >= 0 && 
                    obj.length <= Number.MAX_SAFE_INTEGER;
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
 * @param {*} list
 * @description 将类数组对象转为数组 
 */
const toArray = (list) => {
  if (!isArrayLike(list)) {
    throw '请传入数组或类数组对象';
  }
  return [].slice.apply(list);
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
 * @param {*} list 
 * @param {*} cb
 * @description 模拟的是数组map方法，只不过对象也可以。核心代码与each一样 
 */
const map = (list, cb) => {
  if (type(cb) !== '[object Function]') {
    throw '请传入处理函数';
  }
  const keys = !isArrayLike(list) && Object.keys(list);
  const len = (list || keys).length;
  let result = Array(len);
  for (let i = 0; i < len; i++) {
    const currentKey = keys ? keys[i] : i;
    result[i] = cb(list[currentKey]);
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
    return next.children ? item.concat(flatTree(next.children), next) : item.concat(next)
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
// const invoke = (list, methodName, args) => {
//   if (!list || !methodName) {
//     throw new Error('请传入list和方法名');
//   }
//   if (type(list) === '[object Array]') {
//     return list.map(item => {
//       if (type(item[methodName]) === "[object Function]" && type(item) === '[object Array]')) {
//         return item[methodName]()
//       }
//     })
//   }
// }

// 实现传入 二维数组和数组api；普通数组和普通方法以及其余参数 两种方式
// method 可以是方法名也可以是方法。
// 如果list是二维数组的话，那么可以是数组的api名；不是二维数组的话，则只能是普通函数了。
// const invoke = (list, method, args) => {
//   if (!list || !method) {
//     throw new Error('请传入list和方法');
//   }
//   if (!isArrayLike(list)) {
//     throw new Error('list必须是类数组对象');
//   }
//   return list.map(item => {
//     if (type(item) === '[object Array]' && type(item[method]) === "[object Function]") {
//       return item[method]();
//     }
//     if (type(method) === "[object Function]") {
//       return method.apply(null, [item, ...args]);
//     }
//   })
// }


// list 可能是数组，也可能是类数组对象
// 先考虑 list 是二维数组情况，methodName 是数组已存在的api名
// args 根据传入的 methodName 来决定是函数数组还是其它
// const invoke = (list, methodName, args) => {
//   return map(list, (context) => {
//     const method = context[methodName];
//     return method.apply(context, args);
//   })
// }

// 现在考虑 list 是一维数组情况
// 如果是 一维数组，那么 context 就是普通元素了
// method可能是函数也可能是数组的api方法名
const invoke = (list, method, args) => {
  let func;
  if (type(method) === '[object Function]') {
    func = method;
  } 
  return map(list, (context) => {
    // 二维数组且method是string，默认调用数组的api
    if (!Array.isArray(context) && typeof method === 'string') {
      throw '一维数组，method应传入目标函数'
    }
    let tempMethod = Array.isArray(context) && typeof method === 'string' ? context[method] : func;
    return tempMethod.apply(context, args); 
  })
}




/**
 * 
 * @param {*} list 
 * @param {*} property
 * @description 从list中提取目标属性的值，返回值组成的数组 
 */
const pluck = (list, propertyName) => {
  return map(list, (item) => {
    if (item.hasOwnProperty(propertyName)) {
      return item[propertyName]
    }
  })
}




/**
 * 
 * @param {*} list 
 * @param {*} cb 
 * @description 返回list中的最大值。
 *              空list直接返回 -Infinity。
 *              忽略非数值 值
 *              我这个要求数组或类数组
 */
const max = (list, cb) => {
  const arr = toArray(list);
  if (!arr.length) {
    return -Infinity;
  }
  return arr.reduce((prev, next) => {
    return cb.call(null, prev) > cb.call(null, next) ? prev : next;
  })
}



/**
 * 
 * @param {*} list 
 * @param {*} cb 
 * @description 返回list中的最小值。
 *              空list直接返回 -Infinity。
 *              忽略非数值 值
 *              我这个要求数组或类数组
 */
const mix = (list, cb) => {
  const arr = toArray(list);
  if (!arr.length) {
    return Infinity;
  }
  return arr.reduce((prev, next) => {
    return cb.call(null, prev) > cb.call(null, next) ? next : prev;
  })
}


/**
 * 
 * @param {*} list 
 * @param {*} methodName 方法名
 * @param {*} cb 处理函数
 * @description underscore的sortBy第二个参数既可以是string也可以是函数，
 *              这样不好，我认为应该将两种参数类型区分开
 */
const sortBy = (list, methodName, cb) => {
  let index = 0;
  if (type(list[methodName]) === '[object Function]') {
    return list[methodName]();
  }
  return map(list, (item) => {
    return {
      value: item,
      index: index++,
      cbVal: cb ? cb(item) : item
    }
  }).sort((left, right) => {
    const l = left.cbVal;
    const r = right.cbVal;
    if (l !== r) {
      if (l > r || l == undefined) {
        return 1;
      }
      if (l < r || r == undefined) {
        return -1;
      }
    }
    return l.index - r.index;
  }).map(item => item.value)
}


/**
 * 
 * @param {*} list 
 * @param {*} iteratee 
 * @param {*} type
 * @param {*} result
 * @description 将 groupBy, indexBy, countBy 公共部分抽出来
 * 第一版
 */
// const group = ({ list, iteratee, type, result }) => {
//   map(list, (item) => {
//     let key;
//     switch (type) {
//       case 'index':
//         key = item[iteratee];
//         result[key] = item;
//         break;
//       case 'count':
//         key = iteratee(item);
//         result[key] = result[key] ? ++result[key] : 1;
//         break;
//       default:
//         key = item[iteratee] || iteratee(item)
//         result[key] = result[key] ? [...result[key], item] : [item];
//         break;
//     }
//   })
// }

// 第二版
// 由于groupBy, indexBy, countBy 只在最后存值时不同，
// 这里核心思想把最后存值操作控制权交由外部相应的方法
const group = (cb, isPartition) => {
  let result = isPartition ? [[], []] : {};
  return (list, iteratee) => {
    map(list, item => {
      const key = item[iteratee] || iteratee(item);
      cb(result, key, item);
    })
    return result;
  }
}

/**
 * 
 * @param {*} list 
 * @param {*} iteratee
 * @description 把一个集合分组为多个集合，通过 iterator 返回的结果进行分组.
 * 如果 iterator 是一个字符串而不是函数, 那么将使用 iterator 作为各元素的属性名来对比进行分组.
 */
// const groupBy = (list, iteratee) => {
//   // let result = {};
//   // low 逼版
//   // if (type(iteratee) === '[object String]') {
//   //   map(list, (item) => {
//   //     if (result.hasOwnProperty(item[iteratee])) {
//   //       result[item[iteratee]].push(item);
//   //       return;
//   //     }
//   //     result[item[iteratee]] = [item];
//   //   })
//   // }
//   // if (type(iteratee) === '[object Function]') {
//   //   map(list, (item) => {
//   //     const key = iteratee(item);
//   //     if (result.hasOwnProperty(key )) {
//   //       result[key].push(item);
//   //       return;
//   //     }
//   //     result[key] = [item];
//   //   })
//   // }
//   // return result;

//   // 优化融合版
//   // const isFunc = type(iteratee) === '[object Function]';
//   // map(list, (item) => {
//   //   const key = isFunc ? iteratee(item) : item[iteratee];
//   //   if (result.hasOwnProperty(key)) {
//   //     result[key].push(item);
//   //     return;
//   //   }
//   //   result[key] = [item];
//   // })
//   // return result;


//   // 使用group第一版
//   group({list, iteratee, type: 'group', result})
//   return result;
// }


/**
 * @description 使用第二版group，闭包方式
 */
const groupBy = group((result, key, item) => {
  if (result[key]) {
    result[key].push(item);
    return
  }
  result[key] = [item];
})

// console.log(groupBy(['one', 'two', 'three'], 'length'))
// console.log(groupBy(['one', 'two', 'three'], 'codePointAt'))
// console.log(groupBy([1.3, 2.1, 2.4], function (num) { return Math.floor(num); } ))
// console.log(groupBy([{ name: 'moe', age: 40 }, { name: 'larry', age: 50 }, { name: 'curly', age: 60 }], 'age'))


/**
 * 
 * @param {*} list 
 * @param {*} uniqueKey
 * @description 返回一个每一项索引的对象。
 * 和 groupBy 非常像，但是当你知道你的键是唯一的时候可以使用indexBy。
 */
// const indexBy = (list, uniqueKey) => {
//   if (type(uniqueKey) !== '[object String]') {
//     throw '请传入唯一key';
//   }
//   let result = {};
//   // map(list, (item) => {
//   //   const key = item[uniqueKey];
//   //   if (!result.hasOwnProperty(key)) {
//   //     result[key] = item;
//   //   }
//   // })
//   // return result;

//   // 使用group第一版
//   group({ list, iteratee: uniqueKey, type: 'index', result })
//   return result;
// }


// 使用第二版group
const indexBy = group((result, key, item) => {
  result[key] = item
})
// console.log(indexBy([{ name: 'moe', age: 40 }, { name: 'larry', age: 50 }, { name: 'curly', age: 60 }], 'age'))

/**
 * 
 * @param {*} list 
 * @param {*} iteratee
 * @description 排序一个列表组成多个组，并且返回各组中的对象的数量的计数。
 * 类似groupBy，但是不是返回列表的值，而是返回在该组中值的数量。
 */
// const countBy = (list, iteratee) => {
//   if (type(iteratee) !== '[object Function]') {
//     throw '请传入处理函数';
//   }
//   let result = {};
//   // map(list, (item) => {
//   //   const val = iteratee(item)
//   //   if (result.hasOwnProperty(val)) {
//   //     result[val] += 1;
//   //     return;
//   //   }
//   //   result[val] = 1;
//   // })
//   // return result;


//   // 使用group第一版
//   group({ list, iteratee, type: 'count', result })
//   return result;
// }


// 使用第二版group
const countBy = group((result, key) => {
  result[key] = result[key] ? ++result[key] : 1;
})

// console.log(
//   countBy([1, 2, 3, 4, 5], function (num) {
//     return num % 2 == 0 ? 'even' : 'odd';
//   })
// )


/**
 * 
 * @param {*} list 
 * @param {*} predicate
 * @description 拆分一个数组（ array） 为两个数组： 
 * 第一个数组其元素都满足predicate迭代函数， 
 * 而第二个的所有元素均不能满足predicate迭代函数。
 */
// const partition = (list, predicate) => {
//   let result = [[], []];
//   map(list, (item) => {
//     predicate(item) ? result[0].push(item) : result[1].push(item);
//   })
//   return result;
// }

// 第二版，使用group
const partition = group((result, isPass, item) => {
  isPass ? result[0].push(item) : result[1].push(item);
}, true)

// console.log(partition([0, 1, 2, 3, 4, 5], (item) => item % 2 === 0))


/**
 * 
 * @param {*} list 
 * @param {*} n
 * @description 从 list中产生一个随机样本。
 * 传递一个数字表示从list中返回n个随机元素。否则将返回一个单一的随机项。
 * 实测，普通对象和类数组对象没用
 */
// const sample = (list, n) => {
//   if (!Array.isArray(list)) {
//     throw '请传入数组';
//   }
//   let len = list.length;
//   let result = Array(len);
//   Math.floor(Math.random(0, len));
// }

// console.log( Math.random() * 10) 


/**
 * @default
 * @default
 * @description Array api
 * @default
 * @default
 */


/**
 * @description 返回array（ 数组） 的第一个元素
 * 传递 n 参数将返回数组中从第一个元素开始的n个元素
 * 
 * 根据实际测试，有以下注意点：
 * 1.不传 n ,默认返回第一个元素；正常
 * 2.传 0,返回 []；也能理解
 * 3.传 1,返回 [第一个元素]，这个。。。居然返回数组了。。。
 * 4.传 null,和不传一样，即null和undefined效果一样
 * 5.传 Infinity 或 大于数组长度的数值 返回原数组
 * 6.传 -Infinity 或 小于数组长度的数值 返回空数组 []
 * 7.传 NaN, 返回空数组 []
 */
// const first = (arr, n) => {
//   if (!isArrayLike(arr)) {
//     throw '请传入数组或类数组对象';
//   }
//   // null / undefined
//   if (n == void 0) {
//     return arr[0];
//   }
//   let result = [];
//   let len = arr.length;
//   if (n >= len) {
//     return arr;
//   }
//   if (n < len && n > 0) {
//     for (let i = 0; i < n; i++) {
//       result.push(arr[i]);
//     }
//   }
//   return result;
// }

// console.log(first([1, 2, 3, 4, 5])) // 1
// console.log(first([1, 2, 3, 4, 5], null)) // 1
// console.log(first([1, 2, 3, 4, 5], 0)) // []
// console.log(first([1, 2, 3, 4, 5], NaN)) // []
// console.log(first([1, 2, 3, 4, 5], 1)) // [1]
// console.log(first([1, 2, 3, 4, 5], Infinity)) // [1, 2, 3, 4, 5]
// console.log(first([1, 2, 3, 4, 5], -Infinity)) // []
// console.log(first([1, 2, 3, 4, 5], -0)) // []
// console.log(first([1, 2, 3, 4, 5], -1)) // []
// console.log(first([1, 2, 3, 4, 5], 3)) // [1, 2, 3]


/**
 * 
 * @param {*} arr 
 * @param {*} n
 * @description 返回数组中除了最后一个元素外的其他全部元素。数组
 * 传递 n 参数将从结果中排除从最后一个开始的n个元素（ 注：排除数组后面的 n 个元素）
 * 
 * 根据实际测试，注意点：
 * 1.返回值都是数组，不像first又是数组又是元素的，返回类型单一
 * 2.不传 n, 默认返回排除最后一个元素的数组
 * 3.n传null, 和不传n一致，即 null / undefined 效果一致
 * 4.n传NaN, 返回空数组 []
 * 5.n传大于数组长度的数值,包括Infinity, 返回空数组
 * 6.n传小于0的数值,包括-Infinity, 返回原数组
 * 7.n传0, 返回原数组
 */
// const initial = (arr, n) => {
//   if (!isArrayLike(arr)) {
//     throw '请传入数组或类数组对象';
//   }
//   let len = arr.length;
//   let result = [];
//   if (n == void 0) {
//     return arr.slice(0, len - 1)
//   }
//   if (n < len && n > 0) {
//     for (let i = 0; i < n - 1; i++) {
//       result.push(arr[i]);
//     }
//   }
//   if (n <= 0) {
//     return arr;
//   }
//   return result;
// }

// console.log(initial([1, 2, 3, 4, 5])) // [1, 2, 3, 4]
// console.log(initial([1, 2, 3, 4, 5], null)) // [1, 2, 3, 4]
// console.log(initial([1, 2, 3, 4, 5], NaN)) // []
// console.log(initial([1, 2, 3, 4, 5], 0)) // [1, 2, 3, 4, 5]
// console.log(initial([1, 2, 3, 4, 5], Infinity)) // []
// console.log(initial([1, 2, 3, 4, 5], -Infinity)) // [1, 2, 3, 4, 5]
// console.log(initial([1, 2, 3, 4, 5], 5)) // []
// console.log(initial([1, 2, 3, 4, 5], 3)) // [1, 2]


/**
 * @description 以上模拟first和initial时，忽略一个问题，即返回的应该是数组的副本才对！
 * 还有一个问题，如何将这两个方法抽出公共的方法共用？如何去优化合并？
 * 没有思路，所以去看了源码，发现源码中initial用的是数组原生的slice方法。
 * 也挺好玩的，一方面不信任原生api，自己模拟了一些，一方面又不得不使用，
 * 毕竟结合原生api写出来的代码更优美点，更易懂。
 * 使用slice去重写以上两个方法
 */

const initial = (arr, n) => {
  if (!isArrayLike(arr)) {
    throw '请传入数组或类数组对象';
  }
  let len = arr.length;
  // 三元判断太多了
  // return Array.from(arr).slice(0, n == void 0 ? len - 1 : n <= 0 ? len : n >= len ? 0 : n - 1);
  // 继续优化。主要是null/undefined情况表现有点不同
  // 直接用 减法，配合slice，真的简便好多！！！
  return Array.from(arr).slice(0, len - (n == null ? 1 : n));
}

// console.log(initial([1, 2, 3, 4, 5])) // [1, 2, 3, 4]
// console.log(initial([1, 2, 3, 4, 5], null)) // [1, 2, 3, 4]
// console.log(initial([1, 2, 3, 4, 5], NaN)) // []
// console.log(initial([1, 2, 3, 4, 5], 0)) // [1, 2, 3, 4, 5]
// console.log(initial([1, 2, 3, 4, 5], Infinity)) // []
// console.log(initial([1, 2, 3, 4, 5], -Infinity)) // [1, 2, 3, 4, 5]
// console.log(initial([1, 2, 3, 4, 5], 5)) // []
// console.log(initial([1, 2, 3, 4, 5], 3)) // [1, 2]

const first = (arr, n) => {
  if (!isArrayLike(arr)) {
    throw '请传入数组或类数组对象';
  }
  if (n == null) {
    return arr[0];
  }
  // 稍微有点绕人
  // 需要明白当 0 < n < arr.length时,调initial内部会 arr.length - n 即 arr.length - (arr.length - n) = n
  // 这样就保证了 slice(0, n)
  return initial(arr, n <= 0 ? arr.length : n >= arr.length ? 0 : arr.length - n);
}

// console.log(first([1, 2, 3, 4, 5])) // 1
// console.log(first([1, 2, 3, 4, 5], null)) // 1
// console.log(first([1, 2, 3, 4, 5], 0)) // []
// console.log(first([1, 2, 3, 4, 5], NaN)) // []
// console.log(first([1, 2, 3, 4, 5], 1)) // [1]
// console.log(first([1, 2, 3, 4, 5], Infinity)) // [1, 2, 3, 4, 5]
// console.log(first([1, 2, 3, 4, 5], -Infinity)) // []
// console.log(first([1, 2, 3, 4, 5], -0)) // []
// console.log(first([1, 2, 3, 4, 5], -1)) // []
// console.log(first([1, 2, 3, 4, 5], 3)) // [1, 2, 3]
// console.log(first([])) // undefined




/**
 * 
 * @param {*} arr 
 * @param {*} n
 * @description 返回数组中最后一个元素。
 * 传递 n 参数将返回数组中从最后一个元素开始的n个元素 (注：返回数组里的后面的n个元素)
 * 
 * 根据实际测试， 注意点：
 * 1.不传或传null, 返回最后一个元素
 * 2.传NaN, 返回原数组副本
 * 3.传0, 返回空数组[]
 * 4.传-Infinity, 返回空数组[]
 * 5.传Infinity, 返回原数组副本
 * 6.传0 < n < arr.length, 返回 数组后面n个元素组成的新数组
 */
const last = (arr, n) => {
  if (!isArrayLike(arr)) {
    throw '请传入数组或类数组对象';
  }
  let len = arr.length;
  if (n == null) {
    return arr[len - 1];
  }
  return Array.from(arr).slice(n >= len ? 0 : len - n, len);
}

// console.log(last([])) // undefined
// console.log(last([1, 2, 3, 4, 5])) // 5
// console.log(last([1, 2, 3, 4, 5], null)) // 5
// console.log(last([1, 2, 3, 4, 5], NaN)) // [1, 2, 3, 4, 5]
// console.log(last([1, 2, 3, 4, 5], 0)) // []
// console.log(last([1, 2, 3, 4, 5], -Infinity)) // []
// console.log(last([1, 2, 3, 4, 5], Infinity)) // [1, 2, 3, 4, 5]
// console.log(last([1, 2, 3, 4, 5], 2)) // [4, 5]



/**
 * 
 * @param {*} arr 
 * @param {*} index
 * @description 返回数组中除了第一个元素外的其他全部元素。
 * 传递 index 参数将返回从index开始的剩余所有元素 
 * 
 * 根据实际测试， 注意点：
 * 1. 不传 index 或传 null, 返回除第一个元素外 其它所有元素组成的新数组
 * 2. 传NaN, 返回原数组副本
 * 3. 传false, 返回原数组副本
 * 4. 传true, 效果和不传一样
 * 5. 传0, 效果和不传一样
 * 6. 传Infinity, 返回 []
 * 7. 传-Infinity, 和不传一样
 * 8. 传'', 和不传一样
 * 9. 传 Symbol, 报错
 * 10. 传对象, 和不传一样
 */
const rest = (arr, index) => {
  if (!isArrayLike(arr)) {
    throw '请传入数组或类数组对象';
  }
  return Array.from(arr).slice(index == null ? 1 : index);
}

// console.log(rest([1, 2, 3, 4, 5])) // [2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], NaN)) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], false)) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], true)) // [2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], 0)) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], Infinity)) // []
// console.log(rest([1, 2, 3, 4, 5], -Infinity)) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], '')) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], {})) // [1, 2, 3, 4, 5]
// console.log(rest([1, 2, 3, 4, 5], Symbol(1))) // 报错
// console.log(rest([1, 2, 3, 4, 5], 2)) // [3, 4, 5]



/**
 * 
 * @param {*} arr 
 * @description 返回一个除去了所有false值的 array副本。
 * 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
 * 有点 filter 的意思
 */
const compact = (arr) => {
  if (!Array.isArray(arr)) {
    throw '请传入数组';
  }
  // 使用原生数组api
  return arr.filter(item => !!item);
}

// console.log(compact([0, 1, false, 2, '', 3]))


/**
 * @description 闭包封装下给flatten用，主要为了解决shallow为true只减少一维嵌套的需求
 */
const flat = () => {
  let level = 0;
  const func =  (arr, shallow) => {
    if (!Array.isArray(arr)) {
      throw '请传入数组';
    }
    level++;
    return arr.reduce((prev, next) => {
      return Array.isArray(next) && (!shallow || level === 1) ? prev.concat(func(next, shallow)) : prev.concat(next);
    }, [])
  }
  return func;
}

/**
 * @description 将一个嵌套多层的数组 array（数组） (嵌套可以是任何层数)转换为只有一层的数组。
 * 如果你传递 shallow参数，数组将只减少一维的嵌套。
 * 
 * 经过实测发现，只要 shallow 为true，只减少一维嵌套；false的话全部平铺
 */

const flatten = flat();

// console.log(flatten([1, [2], [3, [[4]]]])) // [1, 2, 3, 4]
// console.log(flatten([1, [2], [3, [[4]]]], 0)) // [1, 2, 3, 4]
// console.log(flatten([1, [2], [3, [[4]]]], NaN)) // [1, 2, 3, 4]
// console.log(flatten([1, [2], [3, [[4]]]], 1)) // [1, 2, 3, [[4]]]



/**
 * 
 * @param {*} arr 
 * @param {*} values
 * @description 返回一个删除所有values值后的 arr 副本 
 */
const without = (arr, ...values) => {
  if (!Array.isArray(arr)) {
    throw '请传入数组';
  }
  return arr.filter(item => !values.includes(item));
}

// console.log(without([1, 2, 3], 1, 2)) // [3]



/**
 * 
 * @param  {...any} arrays 
 * @description 返回传入的 arrays（数组）并集
 * 按顺序返回，返回数组的元素是唯一的，可以传入一个或多个 arrays （数组）
 * 
 * 合并 + 去重
 * 我用了es6的api，不用的话需要不少代码
 */
// const union = (...arrays) => {
//   if (!Array.isArray(arrays)) {
//     throw '请传入数组';
//   }
//   return arrays.reduce((prev, next) => {
//     if (!Array.isArray(next)) {
//       throw '请传入数组';
//     }
//     return Array.from(new Set(prev.concat(next)));
//   }, [])
// }

// 利用flatten，卧槽，代码更少了！
const union = (...arrays) => {
  return Array.from(new Set(flatten(arrays, true)));
}

// console.log(union([1], [1], [1, 2, 3], [[11]])) // [1, 2, 3, [11]]



/**
 * 
 * @param  {...any} arrays 
 * @description 返回传入 arrays（数组）交集。
 * 结果中的每个值是存在于传入的每个arrays（数组）里。
 */
// 初始版本
// const intersection = (...arrays) => {
//   if (!Array.isArray(arrays)) {
//     throw '请传入数组';
//   }
//   let firstArr = arrays[0];
//   let result = [];
//   for (let i = 0; i < firstArr.length; i++) {
//     let isExist = true;
//     for (let j = 1; j < arrays.length; j++) {
//       if (!arrays[j].includes(firstArr[i])) {
//         isExist = false;
//         break;
//       }
//     }
//     isExist && result.push(firstArr[i]);
//   }
//   return result;
// }

// 利用数组原生api优化版本
const intersection = (...arrays) => {
  arrays.forEach(item => {
    if (!Array.isArray(item)) {
      throw '所有参数都应该是数组';
    }
  })
  return arrays[0].filter(item => arrays.every(arr => arr.includes(item)))
}

// console.log(intersection([1, 2, 3], [101, 2, 1, 10], [2, 1])) // [1, 2]



/**
 * 
 * @param {*} arr 
 * @param  {...any} others
 * @description 类似于without，但返回的值来自array参数数组，并且不存在于 other 数组。
 * 即 返回的值 只属于 arr 
 * 与 without 区别在于，difference 所有的参数都是数组
 */
// 初始版本
// const difference = (arr, ...others) => {
//   if (!Array.isArray(arr)) {
//     throw '请传入数组';
//   }
//   let result = [];
//   for (let i = 0; i < arr.length; i++) {
//     let isExist = false;
//     for (let j = 0; j < others.length; j++) {
//       if (others[j].includes(arr[i])) {
//         isExist = true;
//         break
//       }
//     }
//     !isExist && result.push(arr[i]);
//   }
//   return result;
// }

// 利用数组原生api优化
// const difference = (arr, ...others) => {
//   if (!Array.isArray(arr)) {
//     throw '所有参数都应该是数组';
//   }
//   others.forEach(item => {
//     if (!Array.isArray(item)) {
//       throw '所有参数都应该是数组';
//     }
//   })
//   return arr.filter(item => !others.some(other => other.includes(item)))
// }


// 再度优化，看了源码才意识到，可以把剩余所有的参数平铺到一个数组中在进行比较
// 其实该方法就是为了拿到 第一个参数数组 与 剩下所有参数 的不相交数据，
// 至于剩下所有参数完全可以合并到一个数组里面啊！这样即使遍历也可以分开了，不用继续嵌套
const difference = (arr, ...others) => {
  const rest = flatten(others);
  return arr.filter(item => !rest.includes(item));
}

// console.log(difference([1, 2, 3, 4, 5], [5, 2, 10])) // [1, 3, 4]




/**
 * 
 * @param {*} arr 
 * @param {*} isSorted 
 * @param {*} iteratee 
 * @description 返回 arr 去重后的副本, 使用 === 做相等测试.
 * 如果您确定 arr 已经排序, 那么给 isSorted 参数传递 true值, 此函数将运行的更快的算法. 
 * 如果要处理对象元素, 传递 iteratee 函数来获取要对比的属性.
 */
// 先不考虑 isSorted 和 iteratee，最简单版本
// const uniq = (arr, isSorted, iteratee) => {
//   return Array.from(new Set(arr));
// }

// 处理对象元素，根据某个属性值去重，需要传iteratee函数
const uniq = (arr, iteratee) => {
  if (!iteratee) {
    return Array.from(new Set(arr));
  }
  if (type(iteratee) !== '[object Function]') {
    throw 'iteratee应为函数';
  }
  // 嵌套 for 循环实现
  // let result = [];
  // let len = arr.length;
  // for (let i = 0; i < len; i++) {
  //   let isExist = false;
  //   for (let j = 0; j < result.length; j++) {
  //     if (iteratee(result[j]) === iteratee(arr[i])) {
  //       isExist = true;
  //     }
  //   }
  //   !isExist && result.push(arr[i]);
  // }
  // return result;

  // 使用数组原生api实现，简洁很多
  return arr.reduce((prev, next) => {
    return prev.some(item => iteratee(item) === iteratee(next)) ? prev : prev.concat(next);
  }, [])
}

// console.log(uniq([1, 1, 1, 2, 3, 2, 2])) // [1, 2, 3]

var users = [
  {'id': 1, 'name': 'Bob', 'last': 'Brown'},
  {'id': 2, 'name': 'Ted', 'last': 'White'},
  {'id': 3, 'name': 'Frank', 'last': 'James'},
  {'id': 4, 'name': 'Ted', 'last': 'Jones'},
  {'id': 1, 'name': 'a', 'last': 'a'},
  {'id': 3, 'name': 'b', 'last': 'b'},
];
// console.log(uniq(users, (item) => {return item.id}))

/**
 * 
 * @param  {...any} arrays 
 * @description 将 每个arrays中相应位置的值合并在一起。
 * 相同下标对应的元素，组成新数组
 * ['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false] => [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
 * 
 * 看了源码，发现underscore其实也是for循环嵌套，只不过利用了已经实现的一些方法，用到了max, map, pluck等方法
 * 源码思想跟我 普通for循环 版本类似，先确定长度，然后每个位置 赋值 (源码是直接赋值)
 */

// 普通for循环 
// const zip = (...arrays) => {
//   let len = arrays.length;
//   let newLen = 0;
//   for (let i = 0; i < len; i++) {
//     newLen = Math.max(newLen, arrays[i].length);
//   }
//   let result = Array(newLen);
//   for (let i = 0; i < newLen; i++) {
//     result[i] = [];
//     for (let j = 0; j < len; j++) {
//       result[i].push(arrays[j][i]);
//     }
//   }
//   return result;
// }

// 使用数组forEach嵌套
// const zip = (...arrays) => {
//   let result = [];
//   arrays.forEach(arr => {
//     arr.forEach((item, index) => {
//       if (!Array.isArray(result[index])) {
//         result[index] = arr.length > arrays.length ? Array(arr.length - arrays.length).fill() : [];
//       }
//       result[index].push(item);
//     })
//   })
//   return result;
// }

// 使用数组reduce+forEach
const zip = (...arrays) => {
  let len = arrays.length;
  return arrays.reduce((prev, next) => {
    let nextLen = next.length;
    next.forEach((item, index) => {
      Array.isArray(prev[index]) ? prev[index].push(item) : nextLen > len ? prev.push([...Array(nextLen - len).fill() , item]) : prev.push([item]);
    });
    return prev;
  }, []);
}

// console.log(zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false])) // [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
// console.log(zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false, false, true]))
// [["moe", 30, true], ["larry", 40, false], ["curly", 50, false], [undefined, undefined, false], [undefined, undefined, true]]



/**
 * 
 * @param arrays 
 * @description 与zip功能相反的函数，给定若干arrays，返回一串联的新数组。
 * 其第一元素个包含所有的输入数组的第一元素，其第二包含了所有的第二元素，依此类推。
 * [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]] =>
 * [['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]]
 */
const unzip = (arrays) => {
  let len = arrays.length;
  let resultLen = arrays[0].length;
  let result = Array(resultLen);
  for (let i = 0; i < resultLen; i++) {
    if (!Array.isArray(result[i])) {
      result[i] = [];
    }
    for (let j = 0; j < len; j++) {
      arrays[j][i] !== undefined && result[i].push(arrays[j][i]);
    }
  }
  return result;
}

// console.log(unzip([["moe", 30, true], ["larry", 40, false], ["curly", 50, false]])) 
// [['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]]
// console.log(unzip([["moe", 30, true], ["larry", 40, false], ["curly", 50, false], [undefined, undefined, false]]))
// [['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false, false]]



// zip和unzip共用该方法
const unzip2 = (arrays, type) => {
  let len = arrays.length;
  let resultLen = 0;
  for (let i = 0; i < len; i++) {
    resultLen = Math.max(resultLen, arrays[i].length);
  }
  let result = Array(resultLen);
  for (let i = 0; i < resultLen; i++) {
    result[i] = [];
    for (let j = 0; j < len; j++) {
      (arrays[j][i] !== undefined || type === 'zip') && result[i].push(arrays[j][i]);
    }
  }
  return result;
}

const zip2 = (...arrays) => unzip2(arrays, 'zip');

// console.log(zip2(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false, false]))
// console.log(unzip2([["moe", 30, true], ["larry", 40, false], ["curly", 50, false], [,,false]]))




/**
 * 
 * @param {*} list 
 * @param {*} values
 * @description 将数组转换为对象
 * 传递任何一个单独[key, value]对的列表，或者一个键的列表和一个值得列表。 如果存在重复键，最后一个值将被返回。
 * ['moe', 'larry', 'curly'], [30, 40, 50] =>
 * {moe: 30, larry: 40, curly: 50} 
 */
const object = (list, values) => {
  let result = {};
  // if (!values) {
  //   list.forEach(item => {
  //     result[item[0]] = item[1];
  //   })
  // } else {
  //   list.forEach((item, index) => {
  //     result[item] = values[index];
  //   })
  // }

  list.forEach((item, index) => {
    const key = values ? item : item[0];
    result[key] = values ? values[index] : item[1];
  })

  return result;
}

// console.log(object(['moe', 'larry', 'curly'], [30, 40, 50])) // {moe: 30, larry: 40, curly: 50}
// console.log(object(['moe', 'larry', 'curly'])) // { m: 'o', l: 'a', c: 'u' }
// console.log(object([['moe', 30, '1'], ['larry', 40, '2'], ['curly', 50, '3']])) // {moe: 30, larry: 40, curly: 50}


/**
 * 
 * @param {*} arr 
 * @param {*} val 
 * @param {*} isSorted 
 */
// 使用数组原生api
// const indexOf = (arr, val, isSorted) => {
//   return arr.findIndex(item => item === val);
// }

// 使用普通for循环
const indexOf = (arr, val, isSorted) => {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    if (arr[i] === val) {
      return i;
    }
  }
  return -1;
}


/**
 * 
 * @param {*} array 
 * @param {*} value 
 * @param {*} param2 
 */

// 使用原生lastIndexOf
// const lastIndexOf = (array, value, fromIndex) => {
//   return array.lastIndexOf((item) => item === val);
// }

// 使用for循环
const lastIndexOf = (array, value, fromIndex) => {
  let len = array.length;
  let min = Math.min(Number(fromIndex) >=0 ? Number(fromIndex) : len - 1, len - 1);
  for (let i = min; i >= 0; i--) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

// console.log(lastIndexOf([3, 2, 1, 2], 2, 0)) // -1



/**
 * 
 * @param {*} list 
 * @param {*} value 
 * @param {*} iteratee 
 * @param {*} context 
 * @description 使用二分查找确定value在list中的位置序号，value按此序号插入能保持list原有的排序。
 * 如果提供iterator函数，iterator将作为list排序的依据，包括你传递的value 。
 * iterator也可以是字符串的属性名用来排序(比如length)。
 * [10, 20, 30, 40, 50], 35 => 3
 * sortedIndex([{name: 'moe', age: 40}, {name: 'curly', age: 60}], {name: 'larry', age: 50}, 'age') => 1
 */

// 最普通的for循环 
// const sortedIndex = (list, value, iteratee, context) => {
//   let len = list.length;
//   for (let i = 0; i < len - 1; i++) {
//     if (type(iteratee) === '[object String]') {
//       if (list[i][iteratee] < value[iteratee] && list[i + 1][iteratee] > value[iteratee]) {
//         return i + 1;
//       }
//     }
//     if (type(iteratee) === '[object Function]') {
//       if (iteratee(list[i]) < iteratee(value) && iteratee(list[i + 1]) > iteratee(value)) {
//         return i + 1;
//       }
//     }
//     if (list[i] < value && list[i + 1] > value) {
//       return i + 1;
//     }
//   }
//   return 0;
// }


// 二分查找
const sortedIndex = (list, value, iteratee, context) => {
  let temp = list;
  const cb = type(iteratee) === '[object String]' ? (item) => item[iteratee] : type(iteratee) === '[object Function]' ? iteratee : (item) => item;
  let mid = temp.length - 2;
  while(temp.length > 1) {
    mid = Math.max( Math.ceil(temp.length / 2) - 1, 0);
    if (cb(temp[mid]) < cb(value) && cb(temp[mid + 1]) > cb(value) ) {
      return mid + 1;
    }
    if (cb(value) > cb(temp[mid])) {
      temp = temp.slice(mid);
    } else {
      temp = temp.slice(0, mid);
    }
  }
  return mid;
}

// console.log(sortedIndex([10, 20, 30, 40, 50], 35)) // 3
// console.log(sortedIndex([{name: 'moe', age: 40}, {name: 'curly', age: 60}], {name: 'larry', age: 50})) // 0
// console.log(sortedIndex([{name: 'moe', age: 40}, {name: 'curly', age: 60}], {name: 'larry', age: 50}, 'age')) // 1
// console.log(sortedIndex([{name: 'moe', age: 40}, {name: 'curly', age: 60}], {name: 'larry', age: 50}, (item) => item.age)) // 1
// console.log(sortedIndex([{name: 'moe', age: 40}, {name: 'curly', age: 60}], {name: 'larry', age: 50}, (item) => item.name)) // 0



/**
 * 
 * @param {*} array 
 * @param {*} predicate 
 * @param {*} context 
 * @description 其实就是数组api findIndex，只不过参数可以不是函数
 * 经过测试，underscore里面的findIndex有bug，不传或传null居然返回0
 */
// 数组api
// const findIndex = (array, predicate, context) => {
//   if (type(predicate) === '[object Function]') {
//     return array.findIndex(predicate);
//   }
//   if (type(predicate) === '[object Object]') {
//     const keys = Object.keys(predicate);
//     return array.findIndex((item) => keys.every(key => item[key] === predicate[key]))
//   }
//   return -1;
// }

// for循环模拟
const findIndex = (array, predicate) => {
  const len = array.length;
  if (type(predicate) === '[object Function]') {
    for (let i = 0; i < len; i++) {
      if (predicate(array[i])) {
        return i;
      }
    }
  }
  if (type(predicate) === '[object Object]') {
    const keys = Object.keys(predicate);
    let isEqual = true;
    for (let i = 0; i < len; i++) {
      isEqual = true;
      for (let j = 0; j < keys.length; j++) {
        if (predicate[keys[j]] !== array[i][keys[j]]) {
          isEqual = false;
          break;
        }
      }
      if (isEqual) {
        return i;
      }
    }
  }
  return -1;
}

var users = [
  {'id': 1, 'name': 'Bob', 'last': 'Brown'},
  {'id': 2, 'name': 'Ted', 'last': 'White'},
  {'id': 3, 'name': 'Frank', 'last': 'James'},
  {'id': 4, 'name': 'Ted', 'last': 'Jones'}
];
// console.log(findIndex(users, (item) => item.id === 3)) // 2
// console.log(findIndex([99, 9, 1, 2])) // -1
// console.log(findIndex([1, 2, 3], 2)) // -1
// console.log(findIndex([1, 2, 3], {'2': 1})) // -1
// console.log(findIndex(users, {id: 3})) // 2




const findLastIndex = (array, predicate) => {}


/**
 * 
 * @param {*} start 
 * @param {*} stop 
 * @param {*} step 
 * @description 一个用来创建整数灵活编号的列表的函数，便于each 和 map循环。
 * 如果省略start则默认为 0；step 默认为 1
 * 返回一个从start 到stop的整数的列表，用step来增加 （或减少）独占。
 * 值得注意的是，如果stop值在start前面（也就是stop值小于start值），那么值域会被认为是零长度，而不是负增长。
 * 如果你要一个负数的值域 ，请使用负数step.
 */
const range = (start = 0, stop, step = 1) => {
  let result = [];
  step = stop > start ? step : step < 0 ? step : -1;
  // if (stop < start) {
  //   for (; stop < start; start = start + step) {
  //     result.push(start);
  //   }
  // } else {
  //   for (; start < stop; start = start + step) {
  //     result.push(start);
  //   }
  // }

  let len = Math.ceil((stop - start) / step) || 0;
  for (let i = 0; i < len; i++, start = start + step) {
    result.push(start);
  }

  return result;
}

// console.log(range(undefined, 10)) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// console.log(range(1, 11)) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// console.log(range(0, 30, 5)) // [ 0, 5, 10, 15, 20, 25 ]
// console.log(range(0, -10, -1)) // [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
// console.log(range(0)) // []
// console.log(range(0, -10))
// console.log(range(-1, 10))