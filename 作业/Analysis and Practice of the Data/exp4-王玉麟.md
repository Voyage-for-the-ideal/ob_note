#### 基本信息
时间：2025.5.4
课程：数据分析与实践
姓名：王玉麟
实验：exp4

### T1：数据预处理
#### Q1
```python
import pandas as pd
import numpy as np

df =pd.read_csv("data.csv",index_col=0)

#Q1
cloumn_mapping= {
    'SC155Q01HA': 'DeviceCount',
    'SC155Q02HA': 'Bandwidth',
    'SC155Q03HA': 'InstructionDevices',
    'SC155Q04HA': 'ComputingPower',
    'SC155Q05HA': 'Software'
}
df.rename(columns=cloumn_mapping,inplace=True)
#inplace=True表示直接在原数据上修改
df=df[list(cloumn_mapping.values())].dropna()
#删除缺失值所在的行
```
使用`.rename()`替换表中的数据，再用`dropna()`删除缺失行

从SCHOOL QUESTIONNAIRE PISA 2018.pdf中可以得到，五个数据范围均为 (1,2,3,4) 代表含义分别为：
###### SC155Q01HA
> The number of digital devices connected to the Internet is sufficient
###### SC155Q02HA
> The school’s Internet bandwidth or speed is sufficient
###### SC155Q03HA
> The number of digital devices for instruction is sufficient
###### SC155Q04HA
> Digital devices at the school are sufficiently powerful in terms of computing capacity
###### SC155Q05HA
> The availability of adequate software is sufficient

#### Q2
```python
#构建索引
ind2val = {}
val2ind={}
index = 0
simplified_names = ['DeviceCount', 'Bandwidth', 'InstructionDevices', 'ComputingPower', 'Software']
int_size=0

for column in simplified_names:
    unique_values = df[column].unique()
    for value in unique_values:
        ind2val[index] = f"{column}={value}"
        val2ind[f"{column}={value}"] = index
        index += 1
        int_size+=1

#替换特征值为索引
df=df.apply(lambda x:x.map(lambda v:val2ind[f"{x.name}={v}"]))
```
首先构建`ind2val`,形成 数字-{column}={value} 的映射，随后使用匿名函数将对应数字映射到df的数据集中。

### T2：Apriori算法-频繁项集挖掘
### Q1:Apriori算法
```python
def count(dt, item):#计算item在dt中的出现次数
    cnt = 0
    for line in dt:
        if set(item) & set(line) == set(item):
            cnt += 1
    return cnt

def apriori(df,min_support,int_size):
    dt=df.to_numpy()
    N=len(dt)
    frequent_itemsets={1:[]}
    for i in range(int_size+1):
        cnt=count(dt,[i])
        if cnt>=min_support*N:
            frequent_itemsets[1].append(([i],cnt))
    #求每个数字的出现次数并筛选，即1阶频繁项集的候选集
    k=2
    while True:
        candidates=[]
        frequent_new=[]
        #此处如果不用frequent_new,而直接用frequent_itemsets[k]，则会结果中会出现空集
        for i in range(len(frequent_itemsets[k-1])-1):
        #len(frequent_itemsets[k-2])表示1，2，3.。。阶频繁项集的长度
        #-1以防止超出索引
            for j in range(i+1,len(frequent_itemsets[k-1])):
                if frequent_itemsets[k-1][i][0][:-1]==
	                frequent_itemsets[k-1][j][0][:-1]:
                    candidates.append(
                    sorted(
                    set(frequent_itemsets[k-1][i][0]) | 
                    set(frequent_itemsets[k-1][j][0])
	                    ))
                    #set()去重，|求并集，sorted()排序
                    #得到k阶频繁项集的候选集
        # candidates=pd.DataFrame(candidates)
        for candidate in candidates:
            cnt=count(dt,candidate)
            #candidates.iloc[i,:]表示第i行的所有元素，是一个列表
            if cnt>=min_support*N:
                frequent_new.append((candidate,cnt))
                #将k阶频繁项集的候选集加入到k阶频繁项集中
        if len(frequent_new)==0:
            break
        else:
            frequent_itemsets[k]=frequent_new
        k+=1
    return frequent_itemsets

fre_half=apriori(df,0.5,int_size)
fre_quarter=apriori(df,0.25,int_size)

print(f"fre_half={fre_half}")
print(f"fre_quarter={fre_quarter}")
```
首先统计1阶频繁项集，然后用`set(A) | set(B)`不断求k阶候选集，并在候选集中计算每个候选集的出现次数，以得到k阶频繁集；直到出现某个频繁集为空集为止。
> `count(dt,item)`: 计算`item`在`dt`中的出现次数

最终得到的`frequent_itemsets`结构如下：
```
frquent_itemsets
└─1阶频繁项集
	├─([0],5546)
    ├─([5], 8662)
    ├─([1],8243)
    └─...
└─2阶频繁项集
	├─([1,5],5383)
    ├─([1,10], 5675)
    ├─([1,14],5415)
    └─...
└─...
```
最⼩⽀持度阈值为 0.5时，该分类标准下，无频繁项集

最⼩⽀持度阈值为 0.25，频繁项集如下：
1: [0], [1], [5], [8], [10], [13], [14], [17], [18]
2: [1, 5], [1, 10], [1, 14], [1, 18], [5, 14], [5, 18], [10, 14], [10, 18], [14, 18]

#### Q2：修改分类标准
将T1Q2代码替换为如下代码：
```python
#重新构建索引
ind2val = {}
val2ind={}
index = 0
int_size=0

#先将原始取值简化
for column in simplified_names:
    unique_values = sorted(df[column].unique())
    #添加sorted()防止出现将替换后的1替换成0的错误
    for value in unique_values:

        if value==1 or value==2:
            df[column]=df[column].replace(value,0)
        elif value==3 or value==4:
            df[column]=df[column].replace(value,1)
        #将1和2替换为0，3和4替换为1

for column in simplified_names:
    unique_values = df[column].unique()
    for value in unique_values:
        ind2val[index] = f"{column}={value}"
        val2ind[f"{column}={value}"] = index
        index += 1
        int_size+=1

#替换特征值为索引
df=df.apply(lambda x:x.map(lambda v:val2ind[f"{x.name}={v}"]))
```
只需要在执行映射前先将将1和2替换为0，3和4替换为1即可。

挖掘最⼩⽀持度阈值为 0.5得到的频繁项集如下：
1: ([1], 12930), ([3], 12873), ([5], 11323), ([7], 12341), ([9], 13080)
2: ([1, 3], 10637), ([1, 5], 10506), ([1, 7], 10357), ([1, 9], 10596), ([7, 9], 10705)

频繁项集会因为分类标准不同而得到不同结果，原来的分类标准比较严格，故得到的频繁项集比较少，但可能出现的种类较多；修改后的分类标准更加宽松，总数量会变多，但可能出现的种类减少，并且每个项集的支持度可能会更高。

### T3：关联规则提取
#### Q1：{X}->{1}的关联规则
```python
def get_support_count(freq_dict, itemset):
    k = len(itemset)
    if k not in freq_dict:
        return 0
    sorted_itemset = sorted(itemset)
    for (items, cnt) in freq_dict[k]:
        if items == sorted_itemset:
            return cnt
    return 0

def extract_rules(freq_itemsets, Y, min_conf, N):
    Y = [1]
    rules = []
    # 获取Y的支持数
    y_support = get_support_count(freq_itemsets, Y)
    if y_support == 0:
        return rules
  
    # 遍历所有k≥2的频繁项集
    for k in list(freq_itemsets.keys()):
        if k < 2:
            continue
        for (itemset, support_XY) in freq_itemsets[k]:
            if 1 in itemset:
                X = sorted([item for item in itemset if item != 1])
                if not X:
                    continue
                # 检查X是否为频繁项集
                x_support = get_support_count(freq_itemsets, X)
                if x_support == 0:
                    continue
                # 计算置信度
                confidence = support_XY / x_support
                if confidence >= min_conf:
                    # 计算提升度
                    lift = (support_XY * N) / (x_support * y_support)
                    rules.append((X, confidence, lift))
    return rules

dt=df.to_numpy()
# 假设N为数据集总行数
N = len(dt)  # dt是df转换后的numpy数组

# 从支持度0.25的频繁项集中提取规则
rules = extract_rules(fre_half, Y=[1], min_conf=0.8, N=N)

# 输出结果
print("关联规则 X -> {1}（置信度≥0.8）:")
for (X, conf, lift) in rules:
    print(f"规则 {X} → {{1}}: 置信度={conf:.2f}, 提升度={lift:.2f}")
```
对所有T2Q2中得到的频繁项集中，包含{1}的频繁项集进行检测：去除其中的1之后检测其是否为频繁项集，如果是，则计算对应的置信度和提升度，并将其存入数组。

得到结果为：
	规则 [3] → {1}: 置信度=0.83, 提升度=1.32
	规则 [5] → {1}: 置信度=0.93, 提升度=1.48
	规则 [7] → {1}: 置信度=0.84, 提升度=1.34
	规则 [9] → {1}: 置信度=0.81, 提升度=1.30

#### Q2
'DeviceCount=0.0': 0, 'DeviceCount=1.0': 1
'Bandwidth=0.0': 2, 'Bandwidth=1.0': 3
'InstructionDevices=0.0': 4, 'InstructionDevices=1.0': 5
'ComputingPower=0.0': 6, 'ComputingPower=1.0': 7
'Software=0.0': 8, 'Software=1.0': 9

项集1代表计算机数量（DeviceCount）较多。从关联规则中可以看出，网络带宽（Bandwidth）、建设设备（InstructionDevices）、算力（ComputingPower）、软件（Software）和计算机数量相关较大，**若学校的对应设施较强，往往也意味着该学校的计算机设施数量也更多**


> 先帝创业未半而中道崩殂