/**
 * 
 * @param {*} fn 
 * @param {*} n
 * @description 将数组或者类数组对象转换为数组并截取前n个参数传给fn调用执行。传args时必须用扩展运算符！
 * => 
 * const ary = (fn, n) => {
 *   return (...args) => {
 *     return fn(...args.slice(0, n));
 *   }
 * } 
 * 
 */
const ary = (fn, n) => (...args) => fn(...args.slice(0, n));

// 比较前两个数大小
const firstTwoMax = ary(Math.max, 2);
firstTwoMax(...[1, 2, 3]); // 2  必须用扩展预算符！！！



/**
 * 
 * @param {*} key 
 * @param  {...any} args
 * @description 其实就是把函数放到对象的属性中，根据对象的属性名传参调用对应的函数
 * 简直就是为策略模式量身打造的！！！ 
 */
const call = (key, ...args) => context => context[key](...args);

const callObj = {
  test(...args) {
    console.log(...args);
  }
}
const callTest = call('test', ...[1, 2, 3]);
callTest(callObj); // 1,2,3


/**
 * 
 * @param {*} fn
 * @description 这个其实就是简单封装成闭包。
 * 参数值得注意！应该传入数组或类数组对象 
 * 这个封装不知道用在何处。
 */
const collectInto = fn => (...args) => fn(args);

const collectIntoTest = collectInto((args) => {
  console.log(args.map(item => item * 2))
})
collectIntoTest(...[1,2,3]) // [2, 4, 6]


/**
 * 
 * @param {*} fn
 * @description 其实就是把传入的第一个参数，执行时作为最后一个参数 
 * 需要保证除第一个参数外的其他参数是个数组或类数组对象
 * 坑点：扩展运算符。fn的参数rest不能带扩展运算符！！！
 *      传入的rest参数必须是数组或类数组对象，也不能使用扩展运算符。
 */
const flip = fn => (first, ...rest) => fn(...rest, first);

const flipTest = flip((rest, first) => {
  console.log(...rest, first)
})
flipTest(1, [2, 3, 4]) // 2, 3, 4, 1



/**
 * 
 * @param  {...any} fns 
 * @description 其实就是把一堆函数传入封装，然后给它们相同的参数去调用
 * const over = (...fns) => {
 *   return (...args) => {
 *     return fns.map(fn => {
 *       return fn.apply(null, args) 
 *     }) 
 *   }
 * }
 */
const over = (...fns) => (...args) => fns.map(fn => fn.apply(null, args));

const overTest = over(...[
  (args) => {console.log(args)},
  (args) => {console.log(args.length)}
])
overTest([1, 2, 3])
// [1, 2, 3]
// 3
// [undefined, undefined]



/**
 * 
 * @param {*} fn 
 * @param {*} transforms 得是个数组，并且元素是函数，长度至少要和args相同
 * @description 挺复杂的
 * const overArgs = (fn, transforms) => {
 *   return (...args) => {
 *     return fn(...args.map((val, i) => {
 *       return transforms[i](val);
 *     }))
 *   }
 * } 
 * 
 * 注意点：主要是扩展运算符的难点！
 * (...args)本质上是对arguments的扩展。
 * 如果这样传：fn([1, 2, 3])则[1, 2, 3]只是arguments中的某 “一个” 参数，不是三个！
 * 如果这样传：fn(...[1, 2, 3])则会先扩展成3个参数，代表arguments也会有这 “三个” 参数！！！
 */
const overArgs = (fn, transforms) => (...args) => fn(...args.map((val, i) => transforms[i](val)));

const overArgsTest = overArgs((...args) => {
  console.log(...args);
}, [
  (val) => {
    console.log('......' + val);
    return '......' + val;
  },
  (val) => {
    console.log(',,,,,,' + val);
    return ',,,,,,' + val;
  },
  (val) => {
    console.log('------' + val);
    return '------' + val
  }
])

overArgsTest(...[1, 2, 3]);