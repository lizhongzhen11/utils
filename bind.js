/**
 * @name bind
 * @author lizhongzhen11
 * @description 模拟bind
 * @link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * 之前模拟 underscore 源码时写过，
 * 不过在群里看到有人面试时遇到要求手写，且不能使用 call 和 apply，
 * 这下我就来了兴趣了，因为我记得以前模拟时想了好久都无法做到不用call或apply实现，
 * 而且underscore源码也用的apply，我当时甚至以为只能用call和apply实现，
 * 面试题让我明白了，可以不用call和apply也能实现bind！！！
 * 让我探索下！
 * 
 * @readonly 写bind最重要的就是记住 它应该返回一个 函数！！！
 * @readonly 还有，bind可以接受多个参数，返回的函数也能接受多个参数
 */

// 第一版，使用 call 来实现
const bind1 = (fn, obj, ...args) => {
  return (...argss) => {
    let arr = [...args, ...argss]
    return fn.call(obj, ...arr)
  }
}

bind1(function (...args) {
  console.log(this, ...args)
}, {a: 1}, 'a')('b', 'c')
// {a: 1} 'a' 'b' 'c'

// 第二版，使用apply
const bind2 = (fn, obj, ...args) => {
  return (...argss) => {
    let arr = [...args, ...argss]
    return fn.apply(obj, arr)
  }
}
bind2(function (...args) {
  console.log(this, ...args)
}, {a: 1}, 'a')('b', 'c')
// {a: 1} 'a' 'b' 'c'



/**
 * 
 * @param {*} fn 
 * @param {*} obj 
 * @param  {...any} args 
 * @var 第三版，不使用call/apply，中途改了obj对象
 * @description 想了半天，不知道怎么搞，然后百度下怎么改this
 *              看到一些经典的面试题，就是 对象内的属性值是函数，函数调用this指向问题，
 *              一开始没在意，然后猛然意识到，给obj加个属性fn，其值为调用的函数，
 *              然后用 obj.fn 调用不就保证this是obj了吗？？？
 *              我真TM的机智，但是这种做法肯定是不对的，我居然改了obj。。。
 *              面试时这样写估计会被喷，而且还想了这么久！！！
 *              得到结果后删除 obj.fn 如何？？？
 *              尝试了下，如果在fn内部用到obj，那么obj.fn是存在的，
 *              只有当bind返回的函数执行完成后，obj.fn才会删除。
 * 
 * @readonly 我模拟的还有个问题，无法使用 new 操作符！！！如果需要用new操作符的话，就不能用箭头函数了
 * 
 * @readonly 但是如果用new操作时，表现与原生的bind会有区别。看bind4测试结果与原生bind效果的差异。
 * 
 * @readonly 使用new操作时，会无视已经被 bind 的 this 值的！！！
 * 
 * @readonly 使用new操作时，通过 原型继承 来达到获取被绑定函数属性的功能！！！
 */
const bind3 = (fn, obj, ...args) => {
  return (...argss) => {
    let arr = [...args, ...argss]
    obj.fn = fn
    let result = obj.fn(...arr)
    delete obj.fn
    return result
  }
}

// let obj = {a: 'a'}
// let fn = bind3(function (...args) {
//   console.log(this, ...args, obj) // { a: 'a', fn: [Function] } 1 2 3 { a: 'a', fn: [Function] }
// }, obj, 1)
// fn(2, 3)
// console.log(obj) // { a: 'a' }

const bind4 = (fn, obj, ...args) => {
  return function(...argss) {
    let arr = [...args, ...argss]
    obj.fn = fn
    let result = obj.fn(...arr)
    delete obj.fn
    return result
  }
}

// bind4效果
function animal(name) {
  this.name = name
}
let obj = {}
// let cat = bind4(animal, obj)
// cat('lily')
// console.log(obj.name) // lily
// let tom = new cat('tom')
// console.log(obj.name) // tom
// console.log(tom.name) // undefined

// 原生bind效果
// cat = animal.bind(obj)
// cat('lily')
// console.log(obj.name)
// tom = new cat('tom')
// console.log(obj.name) // lily
// console.log(tom.name) // tom




// 第5版，解决new操作符问题
// 需要知道，使用new操作符时，this 指向 fBind
// 难点在于如何将 fBind 与 fn 建立连接，
// 这个想通了，难点就通了
// 原型链！！！
// 直接 fBind.prototype = new fn，这样this自然会去fn上查找需要的属性！！！
const bind5 = (fn, obj, ...args) => {
  function fBind(...argss) {
    let arr = [...args, ...argss]
    return this instanceof fBind ? fn.apply(this, arr) : fn.apply(obj, arr)
  }
  fBind.prototype = new fn
  return fBind
}

// cat = bind5(animal, obj)
// cat('lily')
// console.log(obj.name) // lily
// tom = new cat('tom')
// console.log(obj.name) // lily
// console.log(tom.name) // tom


// 最终版（第6版），不用call/apply，完美
const bind = (fn, obj, ...args) => {
  function fBind(...argss) {
    let arr = [...args, ...argss]
    let result,
        bindThis = this instanceof fBind ? this : obj
    bindThis.fn = fn
    result = bindThis.fn(...arr)
    delete bindThis.fn
    return result
  }
  fBind.prototype = new fn
  return fBind
}

cat = bind(animal, obj)
cat('lily')
console.log(obj.name) // lily
tom = new cat('tom')
console.log(obj.name) // lily
console.log(tom.name) // tom