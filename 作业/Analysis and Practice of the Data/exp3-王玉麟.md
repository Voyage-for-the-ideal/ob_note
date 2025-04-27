#### 基本信息
时间：2025.4.16
课程：数据分析与实践
姓名：王玉麟
实验：exp3

> PS：如果不想看的话可以直接移步最后看心得体会,（调了很久页面但是导出的排版一直不正确qwq）


### T1：使用pandas进行数据读取、处理和分析
#### Q1
使用`pandas.read_csv()`读取数据生成DataFrame对象。后调用`df.shape`输出对应行列：有21903行，197列。
```python
df =pd.read_csv("data.csv",index_col=0)
#index_col=0表示将第一列作为索引

#Q1
print("前十行数据：")
print(df.head(10))
print(f"行数：{df.shape[0]}\n列数：{df.shape[1]}")
```

结果如下：（碍于篇幅未全部展示）

![[Pasted image 20250419014633.png|450]]

#### Q2

```python
#Q2
# 各列缺失值统计
missing_values = df.isnull().sum()
print("各列缺失值数量：")
print(missing_values)

# 删除最后一列
df = df.drop(df.columns[-1], axis=1)

# 更新后的缺失值统计
missing_updated = df.isnull().sum()
max_missing_col = missing_updated.idxmax()
no_missing_cols = missing_updated[missing_updated == 0].index.tolist()

print(f"缺失值最多的列：{max_missing_col}")
print(f"无缺失值的列：{no_missing_cols}")
```

> `df.isnull().sum()`查询缺失值数量。
> `df.drop(df.columns[-1], axis=1)`删除最后一列，其中`axis=1`表示删除列
> `.idxmax()`输出当前对象中最多的值的索引
> `.index`输出对应的索引；`tolist()`将对应的index索引转换成list类型，以便输出

结果如下：（碍于篇幅未全部展示）
![[Pasted image 20250419014814.png]]
#### Q3
> 唯一值：每个不同的数据点/类别被视为一个唯一值。则具有相同取值的列即为**唯一值**唯一的列。

```python
# 找出所有值相同的列
constant_cols = df.columns[df.nunique() == 1].tolist()
#df.nunique() == 1表示列中只有一个唯一值
constant_values = df[constant_cols].iloc[0].to_dict()
#iloc[0]表示取第一行数据(即索引)
  
print(f"常量列及其取值：{constant_values}")
df = df.drop(constant_cols, axis=1)
```
常量列及其取值：{'CYC': '07MS', 'ADMINMODE': 2}
###### 'CYC': '07MS' 
> 表示**PISA Assessment Cycle**.其中**07**表示这是第七次评估（PISA从2000开始每三年评估一次）；**MS**代表"**Mathematics and Science**"。
###### 'ADMINMODE': 2
> 表示**Mode of Respondent**，即问卷的填写方式；2表示用**Computer填写**。

#### Q4
```python
df['PRIVATESCH'] = (
    df['PRIVATESCH'].str.lower()
    .replace("invalid","missing")
    .replace("","missing")
    )
  
# 重新统计取值
value_counts = df['PRIVATESCH'].value_counts()
print("合并后的PRIVATESCH取值：")
print(value_counts)
```
使用`.replace(A,B)`将所有的空字符/invalid替换为`missing`；使用`.str.lower()`将`PRIVATESCH`替换成小写，之后再统计取值即可. 输出结果如下：

![[Pasted image 20250419014902.png|300]]

#### Q5
```python
# 选择特征并计算统计描述
selected = df[['STUBEHA', 'TEACHBEHA', 'EDUSHORT', 'STAFFSHORT']]
desc_stats = selected.describe().T
desc_stats=desc_stats.drop(columns=["count"])
correlation = selected.corr()
  
print("统计描述：")
print(desc_stats)
print("相关系数矩阵：")
print(correlation)
```
单独提取出四列元素后使用`describe()`函数得到**统计特征**，并使用`.drop()`删去求和一列；使用`corr()`得到相关系数矩阵（即，**pearson系数矩阵**）。最后输出即可。

![[Pasted image 20250419014945.png]]

#### Q6
##### STUBEHA与TEACHBEHA
> STUBEHA：Student behaviour hindering learning
> TEACHBEHA：Teacher behaviour hindering learning

**学生的行为表现往往受到教师行为的直接影响**。例如，如果教师能够有效地管理课堂秩序、积极引导学生参与，学生的行为表现通常会更好（如更专注、更守纪律）。反之，如果教师的课堂管理能力较弱，学生可能会出现更多的不良行为。

**教师的行为也可能会受到学生行为的反馈**。例如，当学生表现出较高的参与度和积极性时，教师可能会更有动力采用更互动的教学方法；而当学生行为不佳时，教师可能需要花费更多精力进行课堂管理，从而影响教学方法的实施。

##### STAFFSHORT与EDUSHORT

**教育资源的短缺往往与人员短缺密切相关**。例如，如果一个学校没有足够的资金或资源来招聘足够的教师（导致 **STAFFSHORT**），那么它也很可能无法提供足够的教学设施（导致 **EDUSHORT**）

#### Q7
```python
df1 = df[['PRIVATESCH', 'EDUSHORT', 'STAFFSHORT']]

# 以PRIVATESCH为组，对数值列用均值填补
df1['EDUSHORT'] = df1.groupby('PRIVATESCH')['EDUSHORT'].transform(
    lambda x: x.fillna(x.mean()))
df1['STAFFSHORT'] = df1.groupby('PRIVATESCH')['STAFFSHORT'].transform(
    lambda x: x.fillna(x.mean()))
```
题目要求先对`PRIVATESCH`分组，再在每组中求取`EDUSHORT`和`STAFFSHORT`均值，并将对应列中的空白替换为每组求得的均值。

> `.fillna()`为缺失值处理函数
> `x.mean()`为对应组中的均值。

### T2：使用numpy，matplotlib进行可视化分析
#### Q1
```python
import numpy as np
import matplotlib.pyplot as plt

# 选择特征（示例）
plt.scatter(df['EDUSHORT'], df['STAFFSHORT']
            , s=10, alpha=0.5,
            )
plt.xlabel('STUBEHA')
plt.ylabel('TEACHBEHA')
plt.title('The scatter plot of STUBEHA and TEACHBEHA (Colored by EDUSHORT)')
plt.show()
```
选取`EDUSHORT`和`STAFFSHORT`作为分析对象，所用函数解释如下：
> `.scatter()`：创建散点图，其中`s=10`为散点大小，`alpha=0.5`为散点透明度
> `.xlabel()`/.`ylabel()`：命名x/y轴

![[Pasted image 20250419005607.png|500]]

#### Q2
```python
#PRIVATESCH的分布
labels = df['PRIVATESCH'].value_counts().index
sizes = df['PRIVATESCH'].value_counts().values
  
plt.figure(figsize=(8, 8))
plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=180)
plt.title('Distribution of PRIVATESCH')
plt.show()
```
选择`PRIVATESCH`作为分析对象，绘制饼图，所用函数解释如下：
> `.value_counts()`：获取所有取值和对应的出现次数（在T1Q4中已做处理）
> `.figure`：设置图片大小
> `.pie`：绘制饼图。其中`autopct='%1.1f%%'`表示显示百分比；`startangle=140`表示起始角度为180°（占比最大的居图片下方，如此较为美观）

![[Pasted image 20250419005557.png|500]]

#### Q3
```python
cor_npy = correlation.to_numpy()
#correlation为DataFrame类型，to_numpy()将其转换为numpy数组
#DataFrame索引方式与Numpy数组不同
plt.clf()
plt.title("Correlation of four selected features")
plt.xticks(ticks=[0,1,2,3],labels=selected.columns,rotation=45, rotation_mode="anchor", ha="right")
plt.yticks(ticks=[0,1,2,3],labels=selected.columns)
for i in range(4):
    for j in range(4):
        plt.text(j, i, f"{cor_npy[i,j]:.3f}", va="center", ha="center")
plt.imshow(correlation, vmin=-1, vmax=1)
plt.colorbar()
plt.show()
```
绘制T1Q5中四个统计量的**pearson热力统计图**。
> `plt.text()`为每个格子添加相关系数
> `plt.imshow(correlation, vmin=-1, vmax=1)`绘制相关系数矩阵，并且最大/小值为1/-1.

![[Pasted image 20250419005530.png|500]]

### T3：对STUBEHA、TEACHBEHA进行分布校验
#### Q1
```python
df2 = df[['STUBEHA', 'TEACHBEHA']].dropna()
#.dropna()表示删除缺失值
data_stu=df2["STUBEHA"].to_numpy()
data_tea=df2["TEACHBEHA"].to_numpy()
  
plt.clf()
  
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.hist(df2['STUBEHA'], bins=10, edgecolor='black')
plt.title('STUBEHA Distribution')
plt.xlabel('Value')
plt.ylabel('Frequency')
  
plt.subplot(1, 2, 2)
plt.hist(df2['TEACHBEHA'], bins=10, edgecolor='black')
plt.title('TEACHBEHA Distribution')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.tight_layout()
plt.show()
```
使用`plt.hist()`绘制直方图，需要注意在绘制前应将df中提取的`STUBEHA`和`TEACHBEHA`转换为numpy数组。
> `.subplot()`：使两个统计量的直方图平行显示
> `.tight_layout()`对两张图自动排版

![[Pasted image 20250419005512.png]]
基于直方图结果，可以认为**STUBEHA**近似正态，**TEACHBEHA**右偏，不满足正态分布。

#### Q2
```python
import statsmodels.api as sm
  
fig, axs = plt.subplots(1, 2, figsize=(12, 5))
  
plt.subplot(1, 2, 1)
sm.qqplot(df2['STUBEHA'], line='45',markersize=3,ax=axs[0])
plt.title('Q-Q Plot of STUBEHA')
  
plt.subplot(1, 2, 2)
sm.qqplot(df2['TEACHBEHA'], line='45',markersize=3,ax=axs[1])
plt.title('Q-Q Plot of TEACHBEHA')
  
plt.tight_layout()
plt.show()
```
使用`statsmodels`库中的`sm.qqplot()`绘制QQ图，得到结果如下：

![[Pasted image 20250419010452.png]]

可以看见两个统计量的QQ图**在中段较为满足正态分布，在两端偏移较明显**。

**感想**：图是非常直观的表现形式，但是仅凭图判断出错的可能较大，需要用多种手段验证结论的正确性。

#### Q3
```python
# 计算分位点
stube_quants = df2['STUBEHA'].sort_values().values
teach_quants = df2['TEACHBEHA'].sort_values().values
  
plt.scatter(stube_quants, teach_quants, alpha=0.5)

plt.plot([-3, 4],
         [-3, 4], 'r--')
#手动绘制y=x
plt.xlabel('STUBEHA Quantiles')
plt.ylabel('TEACHBEHA Quantiles')
plt.title('Comparative Q-Q Plot')
plt.show()
```
得到的结果如下：
![[Pasted image 20250419010950.png|500]]

如果两个统计量的分布大致相同，那么得到的QQ图应当大致与y=x契合，而由图可知，两分布形态基本相似，但**TEACHBEHA**的尾部更重，且**STUBEHA**的分布范围更广。

### T4：基于正态假设，对STUBEHA、TEACHBEHA总体分布进行估计
#### Q1
```python
#计算STUBEHA和TEACHBEHA的均值和方差
mean_stube = df2['STUBEHA'].mean()
mean_tea = df2['TEACHBEHA'].mean()
var_stube = df2['STUBEHA'].var(ddof=0)
var_tea = df2['TEACHBEHA'].var(ddof=0)
print(f"STUBEHA均值：{mean_stube:f}，方差：{var_stube:f}")
print(f"TEACHBEHA均值：{mean_tea:f}，方差：{var_tea:f}")
```
极大似然估计下均值即为$s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2$，方差为$\hat{\sigma}^2_{MLE} = \frac{1}{n}\sum_{i=1}^n (x_i - \bar{x})^2$。使用`.mean()`和`.var(ddof=0)`（ddof=0表示计算总体方差）分别计算两个统计量特征。

其中，极大似然估计下**均值具有无偏性**，总体均值和样本均值相等；而**方差是有偏**的，因为使用上述公式对应求得的方差期望为$\frac{n-1}{n} \sigma ^2$，不符合无偏估计定义。

#### Q2
```python
y = df2['STUBEHA'].values
aMLS = np.mean(y)  # 最小二乘解等于均值
print(f"MLS估计值: {aMLS:.4f}")
```
常数估计中最小二乘解即为样本均值。并且最小二乘解和极大似然估计下的期望都是无偏估计，故结果相等。

### T5：使用scipy.stats，对STUBEHA、TEACHBEHA均值差异进行检验
#### Q1
应使用**成对检验**，每个STUBEHA都对应一个TEACHBEHA。因为在问卷调查中每个学校的STUBEHA和TEACHBEHA都是成对的

> 单侧检验原假设H0: E(STUBEHA) <= E(TEACHBEHA)
> 备择假设H1: E(STUBEHA) > E(TEACHBEHA)

#### Q2
```python
import scipy.stats as stats

stu_group=df2["STUBEHA"]
tea_group=df2["TEACHBEHA"]

t,p=stats.ttest_rel(stu_group, tea_group)
print(f"t值：{t:f}，p值：{p:f}")
```

### Q3+Q4
结论：Q2中得到的p值极小，可以认为$E( STUBEHA ) \leq E( TEACHBEHA )$

可能犯第一类错误，即可能拒绝了实际正确的假设H1，概率为显著性水平alpha=0.05

### 心得体会
这次实验看上去很难，实际上有**AI+往年作业**（AI实在是太强大了）就不难完成，因为所有的计算过程全部由引入库函数代劳了，剩下的只需要根据要求组织不同的库函数就可以了。当然，如果没有AI，那么我可能需要不断的查询pandas库函数中的各种功能，会耗费更多的时间。

唯一有疑惑的是最后一问，$E(TEACH)$明显大于$E(STU)$，这真的需要进行p检验吗qwq
