/**
 * @description 手写 发布订阅模式 实践
 * 
 * 距离看完曾探大佬的《js设计模式》已有好几个月了，这段时间，我发现我TM又把发布订阅模式给忘了，
 * 忘了怎么写了，擦擦擦，好像是半年前看完的发布订阅模式，当时可是好好的思考一番，
 * 也自己不看书去强行 “默写” 一遍，现在看看，我真是垃圾，果然没有理解其精髓！！！
 * 半年了，我现在要完全靠自己记忆 + 猜想去实现发布订阅模式，不然没有长进！！！
 * 
 * 这次我打算用es6写
 * 
 * on 方法用于绑定 “事件？”
 * off 方法用于卸载绑定的 “事件？”
 * 其实仔细想想，不就是addEventListener嘛，当然也是jq的 on,off 方法
 * 
 * 这里提个小插曲，我在18年7月时面试过蚂蚁，一面就是线上答题，其中有一题是手写个发布订阅模式，
 * 我当时都不知道那是啥，还有防抖函数，哈哈哈，三题全挂，贼打击人。
 * 事后我还特地百度，记得发现了Event相关的api，然后自己模拟了下，现在我又给忘了。
 * 彩笔。。。
 */

// 首先，我得思考下最终怎么来调用我的发布订阅方法？
// 以 addEventListener 为例，它调用方式如下：
// document.addEventListener(EventType, func)
// 这样来看的话，document上其实已经有了发布订阅模式有关的实现了
// 把document想象成我的Sub的话，那么我的调用应该是这样的：
// sub.on(type, func)

// 可是如何跟目标关联起来呢？
// 最终应该是 target.on(type, func)
// 这样看的话，我是不是要让 target 成为 Sub 的实例？？？
// 这肯定不行！！！我怎么能乱改人家的族谱呢！！！

// 那该如何做？
// 可不可以这样：
// const sub = new Sub(target)
// sub.on(type, func)?
// 但是这里怎么和target起到关联作用呢？？？
// 内部用 this.target 保存目标？
// 然后呢？
// 是 target 绑定，target触发？
// 我始终困扰在这里，不得其解！
// 算了，先照着这个想法写出代码来看看
class Sub {
  constructor(target) {
    this.target = target;
  }
  dispatch (type) {
    if (type === this.type) {
      this.func();
    }
  }
  on (type, func) {
    this.type = type;
    this.func = func;
  }
  off () {
    this.type = null;
    this.func = null;
  }  
}

let obj = {}
const sub = new Sub(obj)
sub.on('a', () => {
  console.log(111)
})
sub.dispatch('a') // 111
sub.off()
sub.dispatch('a') // 无内容

// 这代码是发布订阅吗？
// 确实是啊，只不过是用sub这个实例订阅了 'a'。
// 不过 target 确实没起到作用啊

// 我是不是理解错了？？？

// 我记得vue提供了on, off方法，去看看它怎么说？
// https://cn.vuejs.org/v2/api/#vm-on
// 监听当前实例上的自定义事件。事件可以由vm.$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
// 这本质上和 document.addEventListener 是同一种模式啊
// 也就是说 发布订阅调用对象 肯定是该发布订阅原型的 实例！！！
// 那么 let sub = new Sub() 实例化也没有错啊

// 我纠结点在于，我以为写个通用的发布订阅模式，任何对象都可以用它来订阅，其实这是不对的！！！
// 对象 如果不是发布订阅对象的实例，那么它又怎么去发布订阅呢？谁能给它提供api呢？

// 所有代码思路是对的，但要改下，不需要什么target了，当然，dispatch时还可以传参
class Sub2 {
  on (type, func) {
    this.type = type;
    this.func = func;
  };
  off () {
    this.type = null;
    this.func = null;
  };
  dispatch (type, ...args) {
    if (type === this.type) {
      this.func(...args)
    }
  }
}

let sub2 = new Sub2()
sub2.on('a', (...args) => console.log(...args))
sub2.dispatch('a', '+++') // '+++'
sub2.dispatch('a', '+++', '---', '===') // '+++' '---' '==='
sub2.off()
sub2.dispatch('a', 'aaaaaa') // 无反应



// 第三版，能订阅多个
class Sub3 {
  constructor () {
    this.subs = [];
  }
  add ({type, fn}) {
    this.subs.push({type, fn});
  }
  notify (type, ...args) {
    this.subs.forEach(sub => {
      if (!type) {
        sub.fn();
      }
      if (type === sub.type) {
        sub.fn(...args);
      }
    })
  }
}

let sub3 = new Sub3();
sub3.add({type: 'a', fn: () => {console.log('aaaaaa')}});
sub3.add({type: 'b', fn: (...args) => {console.log(...args)}});
sub3.notify(); // 'aaaaaa'  undefined
sub3.notify('b', 'bbbbbb'); // 'bbbbbb'