#### 基本信息
时间：2025.5.25
课程：数据分析与实践
姓名：王玉麟
实验：exp4

> 本实验调用的库为：pandas，numpy，scikit-learn，matplotlib，seaborn
### T1：对TEACHBEHA进行预测
#### S1 ：数据预处理

```python
try:
    df = pd.read_csv('subdata.csv')
    print("数据集加载成功。")
    print("数据集形状:", df.shape)
except FileNotFoundError:
    print("错误: subdata.csv 文件未找到。请确保文件在正确的目录中。")
    exit()

# 显示数据集基本信息
print("\n数据集信息:")
df.info()

print("\n数据集描述性统计:")
print(df.describe())

print(f"\n目标变量 'TEACHBEHA' 的缺失值数量: {df['TEACHBEHA'].isnull().sum()}")

# 移除 'TEACHBEHA' 为空的行
df.dropna(subset=['TEACHBEHA'], inplace=True)
print(f"'TEACHBEHA' 缺失值处理后形状: {df.shape}")

# 确定特征 (X) 和目标 (y)
y = df['TEACHBEHA']
X = df.drop('TEACHBEHA', axis=1)
```
使用`dropna()`将`TEACHBEHA`中空值移除，确定特征和目标，方便后续操作。

得到的数据特征如下：
subdata.csv中共1089列，26行。
其中“TEACHBEHA”有35缺失值，删除后形状为（1054，26）

subdata.csv的部分数据如下：
![[Pasted image 20250525181646.png]]

#### S2 ：数据集划分

```python
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# random_state表示随机种
print(f"训练集大小: {X_train.shape[0]} ({len(X_train)/len(X)*100:.2f}%)")
print(f"测试集大小: {X_test.shape[0]} ({len(X_test)/len(X)*100:.2f}%)")
```
按照”80%训练，20%测试“划分，得到**训练集大小: 843 (79.98%)，测试集大小: 211 (20.02%)**

#### S3 ：机器学习算法模型
1. **线性回归 (Linear Regression):** 一种基础的回归模型，试图找到特征和目标之间的线性关系。
2. **随机森林回归 (Random Forest Regressor):** 一种集成学习方法，通过构建多个决策树并取平均值来进行预测，通常具有较好的鲁棒性和性能。

> 鲁棒性（Robustness）：反映了系统在复杂、动态和不完美的环境中保持可靠性和稳定性的能力。

#### S4 ：特征选择与处理

```python
# 识别数值和分类特征
# 将二者分离以进一步分析
numeric_features = X.select_dtypes(include=np.number).columns.tolist()
categorical_features = X.select_dtypes(exclude=np.number).columns.tolist()


print(f"\n数值特征 ({len(numeric_features)}): {numeric_features}")

# 创建预处理管道
# 数值特征: 缺失值填充 (使用中位数) + 标准化缩放
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())])

preprocessor = ColumnTransformer(
    transformers=[('num', numeric_transformer, numeric_features)])
```
考虑实验三中得到STUBEHA和TEACHBEHA有相似的分布，故此处采用STUBEHA作为特征进行预测。创建对应的数值特征，并用中位数填充缺失值，采用标准化所用以防止数值造成的误差。

#### S5 ：主实验

```python
# 定义评估函数
def evaluate_model(name, model, X_test_processed, y_test_true):
    """评估模型并打印结果。"""
    y_pred = model.predict(X_test_processed)
    mse = mean_squared_error(y_test_true, y_pred)
    r2 = r2_score(y_test_true, y_pred)
    print(f"\n--- {name} 评估结果 ---")
    print(f"均方误差 (MSE): {mse:.4f}")
    print(f"R² 分数: {r2:.4f}")
    return mse, r2

# 创建包含预处理和模型的完整管道
# 模型 1: 线性回归
lr_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                              ('regressor', LinearRegression())])

# 模型 2: 随机森林回归
rf_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                              ('regressor', RandomForestRegressor(random_state=42))])

# 训练模型
print("\n训练线性回归模型...")
lr_pipeline.fit(X_train, y_train)
print("训练完成。")

print("\n训练随机森林回归模型...")
rf_pipeline.fit(X_train, y_train)
print("训练完成。")

# 在测试集上评估模型
lr_mse, lr_r2 = evaluate_model("线性回归", lr_pipeline, X_test, y_test)
rf_mse, rf_r2 = evaluate_model("随机森林回归", rf_pipeline, X_test, y_test)

# 可视化比较
results_df = pd.DataFrame({
    'Model': ['Linear Regression', 'Random Forest'],
    'MSE': [lr_mse, rf_mse],
    'R2': [lr_r2, rf_r2]
})

print("\n--- 结果汇总 ---")
print(results_df)
```
使用线行回归和随机森林进行机器学习，评测指标为$MSE$（均方误差）、$R^2$

二者的$MSE$和$R^2$如下表所示：

| Model             | MSE      | R2       |
| ----------------- | -------- | -------- |
| Linear Regression | 0.731264 | 0.257614 |
| Random Forest     | 0.838668 | 0.148577 |

#### S6 ：随机森林调参

```python
# 定义参数网格
param_grid = {
    'regressor__n_estimators': [50, 100, 200],  # 尝试不同数量的树
    'regressor__max_depth': [None, 10, 20]      # 尝试不同最大深度
}

# 创建包含预处理和随机森林的管道
rf_grid_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                  ('regressor', RandomForestRegressor(random_state=42))])

# 使用 3 折交叉验证进行网格搜索
grid_search = GridSearchCV(rf_grid_pipeline, param_grid, cv=3,
                           scoring='neg_mean_squared_error', # 使用负 MSE 作为评分
                           verbose=1, n_jobs=-1) # 使用所有可用的 CPU 核心

# 执行网格搜索
grid_search.fit(X_train, y_train)

# 获取最佳参数和最佳模型
print("\n最佳参数:", grid_search.best_params_)
best_rf_model = grid_search.best_estimator_

# 使用最佳模型进行评估
best_rf_mse, best_rf_r2 = evaluate_model("随机森林 (调优后)", best_rf_model, X_test, y_test)

print(f"\n调优前 MSE: {rf_mse:.4f}, R2: {rf_r2:.4f}")
print(f"调优后 MSE: {best_rf_mse:.4f}, R2: {best_rf_r2:.4f}")
```
在调参过程中，代码使用了**不同数量的树以及不同的最大深度**进行交叉验证。并以MSE作为评分标准进行参数优化，最终得到的最佳参数为：`{'regressor__max_depth': 10, 'regressor__n_estimators': 200}`

调优前后结果对比：

|     | MSE      | R2       |
| --- | -------- | -------- |
| 调优前 | 0.838668 | 0.148577 |
| 调优后 | 0.800434 | 0.187393 |

#### S7 ：结论分析：对使⽤⽅法的合理性和所得结论依据进⾏解释说明。
| Model              | MSE      | R2       |
| ------------------ | -------- | -------- |
| Linear Regression  | 0.731264 | 0.257614 |
| Random Forest（调优前） | 0.838668 | 0.148577 |
| Random Forest（调优后） | 0.800434 | 0.187393 |
可以发现线性回归的结果优于随机森林，这可能是因为选用特征集为“STUBEHA”，而从实验三可知，其与“TEACHBEHA”分布大致相同。**线性回归模型专门用于捕捉这种线性趋势，因此在这种情况下表现出色**。

### T2：deepseek API调用
#### Q2（a）

```python
from openai import OpenAI
from key.py import API_KEY

client = OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-reasoner",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "已知给定pandas.DataFrame实例df，请编写一段Python代码，分别求特征STUBEHA与TEACHBA、EDUSHORT与STAFFSHORT的相关系数。请逐步思考输出答案"},
    ],
    stream=False
)

print(response.choices[0].message.content)
```

得到输出如下：（输出得到的代码可以正常执行）
![[Pasted image 20250525231058.png]]

#### Q2（b）

```python
{"role": "assistant", 
 "content": "以下是一个类似的示例代码，用于计算相关系数并绘制热力图："
 "\n\n```python"
 "\nimport pandas as pd"
 "\nimport numpy as np"
 "\nimport matplotlib.pyplot as plt"
 "\n\n# 假设df是你的DataFrame"
 "\n# 计算相关系数"
 "\ncorrelation = df[['STUBEHA', 'TEACHBA', 'EDUSHORT', 'STAFFSHORT']].corr()"
 "\n\n# 将相关系数矩阵转换为numpy数组"
 "\ncor_npy = correlation.to_numpy()"
 "\n\n# 绘制热力图"
 "\nplt.clf()"
 "\nplt.title('Correlation of selected features')"
 "\nplt.xticks(ticks=[0, 1, 2, 3], labels=correlation.columns, rotation=45, rotation_mode='anchor', ha='right')"
 "\nplt.yticks(ticks=[0, 1, 2, 3], labels=correlation.columns)"
 "\nfor i in range(4):"
 "\n    for j in range(4):"
 "\n        plt.text(j, i, f'{cor_npy[i, j]:.3f}', va='center', ha='center')"
 "\nplt.imshow(correlation, vmin=-1, vmax=1)"
 "\nplt.colorbar()"
 "\nplt.show()"
 "\n```\n请根据你的需求调整上述代码。"},
```
在`messages`中添加了实例，实例取自lab3中计算相关系数的代码部分，功能为**计算相关系数并绘制热力图**。(输出对比分析见下文)

输出结果如下：
![[Pasted image 20250525233705.png|500]]

**对比分析**：
有示例的输出内容，相较于直接输出的内容，多了对原来代码的分析以及优化，并且输出格式也和输出示例更相像。


### 心得体会
AI得了MVP！！！

感觉和之前的几次实验跳跃性很大，但是借助AI没有特别困难，看的出来是想让我们学东西但又不想设计的太难的，感谢感谢。

为了回答S4所以舍弃了分类预测，但是代码文件中仅注释掉了这部分。