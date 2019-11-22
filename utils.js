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
