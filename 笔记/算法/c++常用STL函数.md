```c++
cin //从键盘读入
cout //从屏幕输出
//>> 和 << 数据的流动方向
//:: 作用域 比如std::cout<<"请输入个数：";
//以下是示例
#include <iostream>    // 包含 cin / cout 的头文件
#include <vector>
using namespace std;   // 打开标准工具包，后面直接用 cin / cout / vector

int main() {
    int n;
    cout << "请输入个数：";   // cout << 往屏幕送文字
    cin >> n;                // cin >> 从键盘读个数

    vector<int> v(n);        // 定义一个 vector
    for (int i = 0; i < n; i++) {
        cin >> v[i];         // 循环读入每个数字
    }

    cout << "你输入了：";
    for (int num : v) {
        cout << num << " ";  // 循环输出每个数字
    }
    cout << endl;            // endl 是换行
    return 0;
}
```

### vector 动态数组
```c++
#include <vector>
vector<int> v;
vector<int> v(10,0);
v.push_back(1);
v.pop_back();
v.size();//返回无符号整型，最好int n=v.size();
v.clear();
v[2];//不检查越界
v.front();
v.back();
v.empty()//判空

vector<vector<int>> dp(m,vector<int> (n));//命名一个二维数组dp，共有mn个元素
```

### string 字符串
```c++
#include <string>
string s="hello";
s +=" world";
s.length();s.size();
s.substr(pos,len);//len可省略
s.find("lo");//返回首个字符的下标（无符号整型）,找不到返回string::npos
s.find("l");
s.push_back("!");
s.pop_back();
s.c_str();//转为c风格字符串
s[i];取单个字符
```

### stack/queue 栈/队列
```c++
#include <stack>
stack <int> stk;
stk.push(1);
stk.pop();
stk.top();
stk.size();
stk.empty();


#include <queue>
queue<int> q;
q.push(1);
q.front();
q.pop();
q.back();
q.empty();
q.size();

priority_queue<int> q;//优先队列，默认大根堆
//不支持迭代遍历（因为没有begin(),end()方法）使用for(int a:q)会报错
priority_queue<int,vector<int>,greater<int>>;//使用greater改为小根堆.第二项表示内部的存放形式(即本质是用动态数组存放的)

```

### map/unordered_map 映射
```c++
#include <map>
#include<unordered_map>

map<string,int> mp;//基于红黑树构建，键有序
unordered_map<string,int> ump;//基于哈希构建，键无序
mp["ab"]=1;
if(mp.count("ab"))...//判断键是否存在
mp.erase("abc")//去除
for(auto& p:mp)//auto自动判断类型进行遍历(此时mp中元素类型是<键,值>的类型，写全比较麻烦)

```

### set/unordered_set 集合
```c++
#include<set>
set<int> s;//有序,元素唯一
s.insert(3);//插入3
s.erase(3);
if(s.count(2))//判断2是否存在
unordered_set <int> a;//哈希实现，无序
```

关于创建数组
```c++
vector<int> v{5};//创建一个数组，其中有元素5
vector<int> v(5);//创建一个数组，其中有五个元素，都是0，且容量可变
vector<int> v[5];//创建一个数组，五个元素，每个都是vector<int>
int v[5];//数组，其中有五个元素，都是0，且容量不可变

{1,2,3};//动态数组
{{1}.{2}};//二维动态数组

list<string> l={"hello","world"};//双向链表list
deque<double> d={1.1,1.2,1.3};//队列
```
总之，如果直接创建的话，用{}可以满足大部分要求
其他情况用 vector<类型> x(y) 会比较好