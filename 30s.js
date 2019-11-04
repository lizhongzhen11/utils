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