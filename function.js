/**
 * 
 * @param {*} func 
 * @param {*} object 
 * @param  {...any} args
 * @description 绑定函数 func 到对象 object 上, 也就是无论何时调用函数, 函数里的 this 都指向这个 object. 
 * 其实就是实现 bind
 */
// 我想了一个半小时，想不通过 call / apply 来实现，结果失败
// es6
// const bind = (func, object, ...args) => {
//   return () => func.call(object, ...args);
// }

// es5
// var bind = function(func, object) {
//   var restArgs = Array.prototype.slice.apply(arguments).slice(2);
//   return function() {
//     return func.apply(object, restArgs);
//   }
// }

// 调用bind后可能还会传参进来
var bind = function (func, object) {
  var slice = Array.prototype.slice;
  var restArgs = slice.apply(arguments).slice(2);
  return function () {
    var args = restArgs.concat(slice.apply(arguments));
    return func.apply(object, args);
  }
}

// var func = function(greeting, a, b){ return greeting + ': ' + this.name + ': ' + a + ',' + b };
// func = bind(func, {name: 'moe'}, 'hi', '1');
// console.log(func('b'))


/**
 * 
 * @param {*} object 
 * @param  {...any} methodNames 
 * @description 把methodNames参数指定的一些方法绑定到object上，这些方法就会在对象的上下文环境中执行
 * 绑定函数用作事件处理函数时非常便利，否则函数被调用时this一点用也没有。
 * methodNames参数是必须的。
 */
const bindAll = (object, ...methodNames) => {
  methodNames.forEach(item => bind(object[item], object));
}

// var buttonView = {
//   label  : 'underscore',
//   onClick: function(){ alert('clicked: ' + this.label); },
//   onHover: function(){ console.log('hovering: ' + this.label); }
// };
// bindAll(buttonView, 'onClick', 'onHover');



/**
 * 
 * @param {*} func 
 * @param  {...any} args 
 * @description  局部应用一个函数填充在任意个数的 arguments，不改变其动态this值
 * 和bind方法很相近。你可以传递_ 给arguments列表来指定一个不预先填充，但在调用时提供的参数。
 */
const partial = (func, ...args) => {}


/**
 * 
 * @param {*} func 
 * @param {*} hashFunc
 * @description Memoizes方法可以缓存某函数的计算结果
 * 如果传递了 hashFunc 参数，就用 hashFunc 的返回值作为key存储函数的计算结果
 * hashFunc 默认使用 func 的第一个参数作为key。
 * memoize 值的缓存可作为返回函数的cache属性。
 */
const memoize = (func, hashFunc) => {
  
}




/**
 * 
 * @param {*} func 
 * @param {*} wait 
 * @param  {...any} args
 * @description 类似setTimeout，等待wait毫秒后调用function。
 * 如果传递可选的参数arguments，当函数function执行时， arguments 会作为参数传入。 
 */
const delay = (func, wait, ...args) => {
  return setTimeout(bind(func, func, ...args), wait)
}
// console.log(delay(console.log, 1000, 'logged later'))



/**
 * 
 * @param {*} func 
 * @param  {...any} args
 * @description 延迟调用function直到当前调用栈清空为止，类似使用延时为0的setTimeout方法
 * 对于执行开销大的计算和无阻塞UI线程的HTML渲染时候非常有用。 
 * 如果传递arguments参数，当函数function执行时， arguments 会作为参数传入
 */
const defer = (func, ...args) => {
  return setTimeout(() => func.apply(null, args), 0)
}

// defer((a) => {console.log(111111, a)}, 'aaaaaaa')




/**
 * @description 节流
 */
const throttle = (func, wait) => {
  let time = null;
  return (...args) => {
    if (!time) {
      func.apply(null, args);
      time = setTimeout(() => {
        clearTimeout(time);
        time = null;
      }, wait)
    }
  }
}



/**
 * @param {*} immediate 第一次调用立即执行
 * @description 防抖
 */
const debounce = (func, wait, immediate) => {
  let time = null;
  // 执行
  const excute = () => {
    time = setTimeout(() => {
      func.apply(args);
    }, wait)
  }
  const debounced = (...args) => {
    if (immediate) {
      !time && func.apply(args);
    }
    if (time) {
      clearTimeout(time);
    }
    excute();
  }
  // 取消
  debounced.cancel = () => {
    clearTimeout(time);
    time = null;
  }
  return debounced;
}



/**
 * 
 * @param {*} func
 * @description 创建一个只能调用一次的函数。 
 * 重复调用该方法也没有效果，只会返回第一次执行时的结果。
 * 作为初始化函数使用时非常有用, 不用再设一个boolean值来检查是否已经初始化完成.
 */
const once = (func) => {
  return before(2, func);
}



/**
 * 
 * @param {*} count 
 * @param {*} func
 * @description 创建一个函数, 只有在运行了 count 次之后才有效果
 * 在处理同组异步请求返回结果时, 如果你要确保同组里所有异步请求完成之后才 执行这个函数, 这将非常有用。 
 * 注意点：
 * 1. 和 once 很像，只执行一次，区别在于，它只执行最后一次
 */
const after = (count, func) => {
  return (...args) => {
    if (--count < 1) {
      return func.apply(args)
    }
  }
}



/**
 * 
 * @param {*} count 
 * @param {*} func
 * @description 创建一个函数,调用不超过count 次
 * 当count已经达到时，最后一个函数调用的结果将被记住并返回。
 * 注意点：
 * 1. 需要保存每次执行后的结果 
 * 2. 内部代码用了 前置减，先减完再比较
 * 3. 这个貌似是返回第 count - 1 次结果
 */
const before = (count, func) => {
  let result;
  return (...args) => {
    if (--count > 0) {
      result = func.apply(args);
    }
    if (count <= 1) {
      func = null;
    }
    return result;
  }
}


/**
 * 
 * @param {*} func 
 * @param {*} wrapper
 * @description 将第一个函数 func 封装到函数 wrapper 里面, 并把函数 func 作为第一个参数传给 wrapper 
 */
const wrap = (func, wrapper) => {
  return () => wrapper(func);
}

var hello = function(name) { return "hello: " + name; };
hello = wrap(hello, function(func) {
  return "before, " + func("moe") + ", after";
});
// console.log(hello())


/**
 * @description 返回一个新的predicate函数的否定版本。
 */
const negate = (func) => (...args) => !func.apply(func, args);

var isFalsy = negate(Boolean);
// console.log(isFalsy(0))

/**
 * 
 * @param  {...any} funcs 
 * @description 返回函数集 funcs 组合后的复合函数, 也就是一个函数执行完之后把返回的结果再作为参数赋给下一个函数来执行.
 * 以此类推. 在数学里, 把函数 f(), g(), 和 h() 组合起来可以得到复合函数 f(g(h()))。
 * 
 * 挺复杂的，但是只要真理解了，想通了，就写出来了，注意点：
 * 1. 执行顺序应该是最后一个函数，倒数第二个，倒数第三，...，第一个，所以应该是倒序执行
 * 2. funcs是数组，倒序的话直接reduceRight，
 *    但是要注意，next应该接受prev执行后的结果，而且next执行后的结果作为下一个prev值，那么prev只能是值，不能是函数；
 *    这样的话，应该把倒数第一个函数执行结果作为初始值传入即可，同时累加的目标数组应该排除倒数第一个函数，因为它已经作为初始值执行过了
 */
const compose = (...funcs) => {
  let len = funcs.length;
  return (...args) => {
    return funcs.slice(0, len - 1).reduceRight((prev, next) => {
      return next(prev);
    }, funcs[len - 1](...args))
  }
}

var te = (n) => {return '+++' + n}
var greet    = function(name){ return "hi: " + name; };
var exclaim  = function(statement){ return statement.toUpperCase() + "!"; };
var welcome = compose(te, greet, exclaim);
// console.log(welcome('moe'))
