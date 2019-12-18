自己手动封装一些常用的业务公共方法以及模拟一些原生api的实现。

utils文件主要借鉴于<a href="https://github.com/jashkenas/underscore">underscore</a>库。

30s文件其实就是<a href="https://github.com/30-seconds/30-seconds-of-code">30-seconds-of-code</a>库的理解与手动操作实践。

function.js 主要实现 underscore 库中关于函数的api

object.js 主要实现 underscore 库中关于object的api

on.js 主要实现发布订阅模式

deepClone.js 主要实现深拷贝，可以拷贝函数


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
4. `Function`对象深拷贝，只需要通过`bind`改变`this`指向即可！！！