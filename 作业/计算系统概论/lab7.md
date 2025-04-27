# 基础信息
#### lab7
#### 姓名：王玉麟
#### 日期：2025.1.17
# Purpose
> 用c++语言实现lab1，2，3，4
# Principles
## lab1
A XOR B=(A AND (NOT B) ) OR (A AND B)
## lab2
额外设立一个函数`iseven`判断奇偶性即可
```c++
int isEven(int num) {//用于lab2
    if(num == 0) return 1;  // 0是偶数
    if(num == 1) return 0;  // 1是奇数

    // 对负数进行处理
    if(num < 0) num = -num;

    // 不断减去2，直到num为0或1
    while(num > 1){
        num = num - 2;
    }
    return num == 0;
    }
```
## lab3
`for`循环比较`s1[i]`与`s1[n-1-i]`即可
## lab4
直接用助教在群里发的函数就可以了
# Procedure
无
# Results
![[Pasted image 20250117220935.png]]
> 我宣布这确实是最快捷的一次实验。
 