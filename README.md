自己手动封装一些常用的业务公共方法以及模拟一些原生api的实现。

- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">utils</a> 文件主要借鉴于<a href="https://github.com/jashkenas/underscore">underscore</a>库。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">30s</a> 文件其实就是 <a href="https://github.com/30-seconds/30-seconds-of-code">30-seconds-of-code</a> 库的理解与手动操作实践。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">function.js</a> 主要实现 underscore 库中关于函数的api。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">object.js</a> 主要实现 underscore 库中关于object的api。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">on.js</a> 主要实现发布订阅模式。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/deepClone.js">deepClone.js</a> 主要实现深拷贝。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/myPromise.js">myPromise.js</a>模拟 `Promise`。对应的博客（其实博客里没啥内容，全在js里面，过程也在注释里面）：https://github.com/lizhongzhen11/lizz-blog/issues/7
- <a href="https://github.com/lizhongzhen11/utils/blob/master/myPromise.js">new.js</a>模拟 `new` 操作符。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/bind.js">bind.js</a>模拟 `bind` 方法。（不用call/apply的话就用`obj.fn`形式调用）
- <a href="https://github.com/lizhongzhen11/utils/blob/master/call and apply.js">call and apply.js</a>模拟 `call` 和 `apply` 方法。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/Set.js">Set.js</a>模拟 `Set` 数据结构。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/new.js">Map.js</a>模拟 `Map` 数据结构。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/observe.js">observe.js</a>实现对象数据监听。
- <a href="https://github.com/lizhongzhen11/utils/blob/master/instanceof.js">instanceof.js</a>模拟 `instanceof`。


## 注意

- `where`和`findwhere`第二个参数是对象，遍历时切记，数组元素必须包含目标对象所有的key-value才符合！一旦某个属性没有或属性值不同，直接跳出当前循环继续下一个数组元素对比。
- `[].concat([1])` // [1]; 有点扩展运算符的意思
- `sortedIndex` 使用二分查找算法的话，有点坑，我算法这块不行，写+测试了好久才通过。主要是判断条件问题，遇到只传递对象却没有传iteratee时，默认是`'[object Object]'`与`'[object Object]'`比较，会陷入死循环，所以去掉等号
- `compose`方法有点饶人，我是利用`reduceRight`来实现的
- 根据`nodeType === 1`来判断是不是dom节点，第一次知道
- 根据`callee`来判断是不是`arguments`对象，第一次知道


## 模拟深拷贝注意
1. `Array`这种特殊的对象需要考虑！！！
2. 对象间的循环引用问题，加第二个参数`fathers`（数组），将所有已出现过的父级对象全缓存进去，根据目标对象在不在`fathers`中就能判断
3. `Date`对象深拷贝，只需要`new Date(Date对象)`即可！！！
4. `Function`对象应该不存在深拷贝一说，也不应该有这种业务需求。
    - 可以通过 `bind` 改变 `this` 得到一个新函数，但这不是深拷贝，因为旧函数上绑定的属性新函数却没有。
    - 当然，可以遍历函数自身属性，并缓存下来，函数主体部分用 `bind` 去生成新函数，然后把旧函数的属性深拷贝下添加到新函数上，但是没意义

## 模拟Promise的注意点
1. 我写的第一版是错的，都是屎。之所以留下来只是证明我思考过
2. 第二版功能算是实现了，但是 then 方法其实不对，因为我只能接收一个参数
3. 放开注释，直接node运行就可以测试
4. 使用new实例化后，调用resolve或reject出现this丢失问题，需要`bind(this)`
5. resolve或reject只能使用一次，那么最好不要放在原型链上
6. 箭头函数不能用 `bind` 绑定 `this`，所以只能用 `function` 关键字声明
7. 不管是new实例化还是resolve或reject或then或catch等执行后都应该返回该 Promise 对象
8. all 方法如何写？all 和 race 最终也应该返回 Promise 对象！！！
9. `all`方法，要在每个循环内的 `then` 方法内部去判断当前是不是所有的 MyPromise 状态都不为 `'pending'`，是的话 `all` 完成，可以 `resolve/reject`
10. `race`方法，需要保证有一个 MyPromise 完成就直接 `resolve/reject`，后面完成的不允许 `resolve/reject`，否则会影响最后输出值

## 模拟new的注意点
1. 原型指向问题。`Object.create(constructor.prototype)`
2. 如果构造函数返回对象，那么该对象会替换使用new内部生成的对象
3. 内部用`call/apply`来改变`this`
4. 箭头函数不能用作构造器，通过箭头函数没有原型这个特点来排除它

## 模拟bind注意点
1. 返回函数
2. 不用call/apply的话就用`obj.fn`形式调用

## 模拟Set和Map注意点
1. `NaN`算相等，通过数组 `includes` 可以规避；`indexOf`无法规避`NaN`，它认为不相等
2. `delete`操作后需要将后面的元素对应的key前移
3. `Symbol.iterator`需要掌握

## 模拟observe注意点
1. `Proxy` 和 `Object.defineProperty` 都有 `set` 和 `get`，但是它们两接受参数和实际使用是不同的，需牢记
2. 使用`Object.defineProperty`监听数组时有点复杂，需要魔改下那些能改变数组自身的方法，这里我记得vue源码是这样做的，但是我自己却没想起来怎么改，还是看了人家三年前的代码才知道怎么去实际改的
3. 还是使用`Object.defineProperty`监听数组，如果使用`push`等改变数组自身的方法，其数组长度也会变化，需要对新增的数组下标属性进行监听，但是超出数组长度的下标，无法监听