自己手动封装一些常用的业务公共方法以及模拟一些原生api的实现。

utils文件主要借鉴于<a href="https://github.com/jashkenas/underscore">underscore</a>库。

30s文件其实就是<a href="https://github.com/30-seconds/30-seconds-of-code">30-seconds-of-code</a>库的理解与手动操作实践。


## 注意

- `where`和`findwhere`第二个参数是对象，遍历时切记，数组元素必须包含目标对象所有的key-value才符合！一旦某个属性没有或属性值不同，直接跳出当前循环继续下一个数组元素对比。