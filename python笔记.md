#### 字符串
左闭右开
#### 列表
广义字符串
#### 元组
和列表类似，但是其元素不能修改
**所谓元组的不可变指的是元组所指向的内存中的内容不可变。**

tuple(iterable)：将可迭代系列转换为元组
eg：将列表变成元组
```python
 list1= ['Google', 'Taobao', 'Runoob', 'Baidu']
 tuple1=tuple(list1)
 tuple1
('Google', 'Taobao', 'Runoob', 'Baidu')
```

#### 字典
dictionary{}
字面意思：一个键对应一个值
不允许同一个键出现两次。创建时如果同一个键被赋值两次，后一个值会被记住

#### 集合
set()：创建空的集合
```python
parame = {value01,value02,...}
或者
set(value)
```
创建一个空集合必须用 set() 而不是 { }，因为 { } 是用来创建一个空字典。

is 与 == 区别：

is 用于判断两个变量引用对象是否为同一个， == 用于判断引用变量的值是否相等。

### with
用于异常处理=`try…except…finally`
[Python with 关键字 | 菜鸟教程 (runoob.com)](https://www.runoob.com/python3/python-with.html)
```python
with open('./test_runoob.txt', 'w') as file:  
    file.write('hello world !')
```
`as file`：将打开的文件对象绑定到变量`file`，在`with`语句块中可以通过`file`来操作文件。

### open
`open(file_path, "w", encoding="utf-8")`

### numpy
#### zeros_like
`zeros_like()` 是 NumPy 中用于生成与给定数组形状和数据类型相同的全零数组的函数
### 可迭代对象与列表的区别
可迭代对象：只能从头到尾遍历，不能直接按位置读取（比如`a[0]`会报错）
列表：可以反复使用，按位置随意读取元素，修改内容
```python
a = map(int, input().split())  # 输入 "1 2 3"
for num in a:
    print(num)  # 第一次循环：输出 1, 2, 3
for num in a:
    print(num)  # 第二次循环：不会有任何输出！（因为已经扫完了）
```

```python
a = list(map(int, input().split()))  # 现在 a = [1, 2, 3]
print(a[0])  # 直接取第一个元素：1
```

# CS61A

#### =
先计算右边的所有等式，再赋给左边的元素
```python
a=1
b=2
b,a=a+b,b
#最终b=3，a=2
```

#### def语句中的参数
`def f(a,b=10)`：使用此函数时可以只传入a参数，b会默认作为10进行操作