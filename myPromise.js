/**
 * @name 模拟实现Promise
 * @host https://github.com/lizhongzhen11/lizz-blog/issues/7
 * 
 * @description
 * 一年多前，实现过一次，再度回顾夯实基础，竟然发现以前写的是错的！！！
 * then 里面应该是异步执行！！！
 * 
 * 目前看来，我所谓的理解其实就是api会调用了，让我写个出来，日，问题重重，TMD压根没理解。
 * 检验是否 “真的理解” 技术的唯一真理就是完全靠自己把该技术模拟出来！
 * 
 * @readonly 我写的第一版是错的，都是屎。之所以留下来只是证明我思考过
 * 
 * @readonly 第二版功能算是实现了，但是 then 方法其实不对，因为我只能接收一个参数
 * 
 * @readonly 放开注释，直接node运行就可以测试
 * 
 * @example 经典面试题
 * new Promise(resolve => resolve(1)).then(res => console.log(res))
 * console.log(2)
 * 执行结果顺序为：
 * 2
 * 1
 * 
 * @see 注意点
 * 1. 使用new实例化后，调用resolve或reject出现this丢失问题，需要bind(this)
 * 2. resolve或reject只能使用一次，那么最好不要放在原型链上
 * 3. 不管是new实例化还是resolve或reject或then或catch等执行后都应该返回该 Promise 对象
 * 4. 箭头函数不能用 bind 绑定this，所以只能用 function 关键字声明
 * 5. all 方法如何写？all 和 race 最终也应该返回 Promise 对象！！！
 * 
 * @todo 需要实现的功能
 * 1. 实例化
 * 2. resolve 和 reject
 * 3. then
 * 4. catch
 * 5. all
 * 6. race
 */

// 三个互斥状态 https://tc39.es/ecma262/#sec-promise-objects
const state = {
  fulfilled: 'fulfilled',
  rejected: 'rejected',
  pending: 'pending'
}

// 第一版，then内部用setTimeout实现
// 实现了 resolve, reject, then, catch 方法
// 说实话，setTimeout 还是看的文章才意识到的。。。
// all 没实现，想不出来。。。
// catch 也没实现成功。。。
function resolve(val) {
  this.state = state.fulfilled;
  this.val = val;
  return this;
}

function reject(val) {
  this.state = state.rejected;
  this.val = val;
  return this;
}

class MyPromise1 {
  constructor (fn) {
    try {
      this.state = state.pending;
      fn(resolve.bind(this), reject.bind(this));
    } catch (err) {
      this.state = state.fulfilled;
      this.err = err;
    }
    return this;
  }
  then (fn) {
    try {
      setTimeout(() => {
        this.val = fn(this.val);
      }, 0)
    } catch (err) {
      this.err = err;
    }
    return this;
  }
  catch (fn) {
    try {
      this.val = fn(this.err);
    } catch (err) {
      this.err = err;
    }
    return this;
  }
}


// new MyPromise1((res) => {
//   res(1)
// }).then(res => {
//   console.log(res)
//   return 3
// }).then(res => {
//   console.log(res)
// })
// console.log(2)

// new MyPromise1((res) => {
//   res(1)
// }).then(res => {
//   throw ''
// }).catch(err => {
//   console.log(err)
// })





/**
 * @description 第二版，看了点文章
 * 
 * 困难点：
 * 
 * 1. catch，捕获报错失败，而且无法得到err值！
 *    测试发现，then 中内部出现报错，try-catch 并没有捕获到
 *    如果把then中代码全部放到setTimeout中的确能捕获到了，
 *    但是，无法确保执行顺序，无法保证catch在then之后执行，
 *    如果先执行 catch ，那么会报 TypeError: Cannot read property 'catch' of undefined
 * 
 * 2. 如果 then 内部 return this 不写在 setTimeout 内，虽然catch能执行
 *    但是catch方法内无法得到 err 数据，而且catch在then之前执行了
 * 
 * 3. 如果 catch 内部也用 setTimeout 包裹，但是 return this 不写在 setTimeout 内部
 *    不会报错，也能拿到err数据
 * 
 * 4. 我差点失败放弃，但是，发呆划水将近6小时后，我意识到，要下班了
 *    我需要好好研究了，不然今天就浪费了！！！
 *    然后，突然意识到在实例化时就进行异步操作会有如何表现？
 *    一股不好的感觉涌上心头，啊，果然我写错了啊~~~~~~
 *    此时只想进行 MMP 问候！
 * 
 * 5. 啊，来到了第二天早上 9：27分，回顾我遇到的问题：
 *    
 *    实例化时，内部如果是异步操作，我无法保证 new MyPromise 内部的异步操作执行完之后再去执行 then 方法
 *    不等异步操作完成直接返回 this 肯定不行的，因为直接返回 this，接下来就可以直接执行 then 方法了（我当时的认知），
 *    可是 new MyPromise 内的异步操作还没完成的话，就拿不到异步操作后的 resolve 值。
 * 
 *    经过我不断思考 + 在浏览器控制台打印输出，
 *   （PS：node 只会打印我 console 的内容，但是浏览器会帮我把Promise当前的状态等信息都打印出来）
 *    我发现，如果实例化时就有异步操作，那么立即打印的 Promise 其状态是 pending，
 *   （
 *    这里其实说明，即使你内部有异步操作，我也是立即返回Promise对象的，只是状态还是 pending，
 *    仔细想想这是必须的，不然怎么链式调用 then 呢？
 *    ）
 *    直到异步操作完成且 resolve/reject 后，Promise 状态才改变；
 *    但是 then 方法的确是在 resolve/reject 后才执行的！！！
 *    那么，这个问题的关键点，就是如何保证 then 在 resolve/reject 之后才执行？？？
 *    我灵机一动，在 then 内部加了个判断，只要 this.state 依然是 pending，
 *    那么继续执行 then，当然，下面的代码不能执行
 *    if (this.state === state.pending) {
 *      this.then(fn);
 *      return;
 *    }
 *    然后测试了下，完美！！！
 * 
 * 6. 第一版我不知道怎么写all，我一开始在class内部写个all方法，
 *    但是这样直接打印 MyPromise1.all 为 undefined ！！！
 *    看了文章才知道，需要 MyPromise.all = function() {} 定义才行！！！
 * 
 * 7. all方法，我从早上 9:30 想到下午2点，期间划水时间累计1小时左右，可见困扰我多长时间！！！
 *    经过我不断尝试，又是 forEach 又是 reduce 的用气来，都不行！
 *    困扰我的始终是 我不知道该通过 什么方法 来保证所有Promise完成后再执行then方法得到最终数组
 *    
 *    7.1. 一开始我用 forEach，里面每个 then 一下，在 then 中赋值，然后再 forEach 外面resolve
 *        但是这样不行，明显没法确定所有Promise都执行完成。
 *    7.2. 然后我尝试用 reduce，但是reduce最终返回的是嵌套的 Promise 对象（val值为下一个Promise对象）
 *    7.3. 最终，突然灵机一动，我只要在 forEach 的 Promise.then 里面去确定是不是所有的 state 都不是 pending 状态，成立的话就代表都完成了，
 *         然后 resolve/reject 不就Ok了？？？
 *         然后，我试了下，果然成功了！！！
 */
class MyPromise2 {
  constructor (fn) {
    try {
      this.state = state.pending;
      fn(resolve.bind(this), reject.bind(this));
    } catch (error) {
      this.state = state.rejected;
      this.err = error;
    }
    return this;
  }
  then (fn) {
    setTimeout(() => {
      if (this.state === state.pending) {
        this.then(fn);
        return;
      }
      try {
        this.val = fn(this.val);
      } catch (error) {
        this.state = state.rejected;
        this.err = error;
      }
      console.log('then...', this)
    }, 0)
    return this;
  }
  catch (fn) {
    setTimeout(() => {
      this.state = state.fulfilled;
      try {
        this.val = fn(this.err);
      } catch (error) {
        this.err = error;
      }
      console.log('catch...', this)
    }, 0)
    return this;
  }
}

MyPromise2.all = function (arr) {
  let valArr = [];
  let stateArr = Array(arr.length).fill(state.pending);
  return new MyPromise2((resolve, reject) => {
    arr.forEach((promise, index) => {
      promise.then(val => {
        valArr[index] = val;
        stateArr[index] = promise.state;
        if (!stateArr.includes(state.pending)) { // 在每个 then 里面判断是不是所有的 Promise 都完成，是的话就可以结束了
          stateArr.every(s => s === state.rejected) ? reject(valArr) : resolve(valArr);
        }
      })
    })
  })
}

// 比all简单点，只需明确有一个完成就立即结束，需要明确结束的标志
MyPromise2.race = function (arr) {
  let isComplete = false;
  return new MyPromise2((resolve, reject) => {
    arr.forEach(promise => {
      promise.then(val => {
        if (!isComplete) {
          isComplete = true;
          promise.state === state.fulfilled ? resolve(val) : reject(val);
        }
      })
    })
  })
}

// new MyPromise2((res, rej) => {
//   res(1)
// }).then(res => {
//   console.log(res)
//   return 2
// }).then(res => {
//   console.log(res)
//   return 3
// })
// console.log(4)

// new MyPromise2((res, rej) => {
//   throw ''
// })

// new MyPromise2((res, rej) => {
//   res(1)
// }).then(res => {
//   throw ''
// })

// new MyPromise2((res, rej) => {
//   res(1)
// }).then(res => {
//   throw ''
// }).catch(err => {
//   console.log(111, err)
// })

// const pp = new MyPromise2(res => setTimeout(() => res(1), 3000)).then(res => {console.log(res); return 2})
// console.log(pp)

// const p = MyPromise2.all([
//   new MyPromise2((res, rej) => setTimeout(() => res(1), 1000)), 
//   new MyPromise2((res, rej) => rej(2)),
//   new MyPromise2((res, rej) => setTimeout(() => rej(3), 3000)),
//   new MyPromise2((res, rej) => setTimeout(() => rej(4), 0)),
//   new MyPromise2((res, rej) => setTimeout(() => res(5), 5000))
// ]).then(v => console.log('all......', v)) // [1, 2, 3, 4, 5]

MyPromise2.race([
  // new MyPromise2((res, rej) => setTimeout(() => res(1), 1000)),
  new MyPromise2((res, rej) => rej(2)),
  // new MyPromise2((res, rej) => setTimeout(() => rej(3), 3000)),
  new MyPromise2((res, rej) => setTimeout(() => rej(4), 0))
]).then(val => console.log('race.......', val))




/**
 * @description 我的模拟其实并不完全符合规范，
 * 规范中 then 是可以接受 onFulfilled 和 onRejected 两个参数的
 * 但我实现的只支持一个，而且我的代码全是自己花费大量时间慢慢思考所得，
 * 和网上的还有较大区别，这里给出网上其他人的实现：
 * https://juejin.im/post/5b2f02cd5188252b937548ab
 */
