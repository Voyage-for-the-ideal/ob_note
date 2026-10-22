# 大数据算法期末考试

> [!note] 转写说明
> 以下内容按原试卷转写，并将数学表达式整理为 Obsidian 兼容的 Markdown/LaTeX 格式。原卷第 3 题的代价矩阵写作 $c_{ij}=\lVert x_i-x_j\rVert$，此处保留原文。

## Problem 1

证明：如果 $S_1$ 是 $S_2$ 的 $(k,\epsilon)$-coreset，$S_2$ 是 $S_3$ 的 $(k,\delta)$-coreset，那么 $S_1$ 是 $S_3$ 的

$$
\bigl(k,(1+\epsilon)(1+\delta)-1\bigr)\text{-coreset}.
$$

## Problem 2

JL 变换是一种应用广泛的降维方法，请给出两种 JL 变换矩阵

$$
A\in\mathbb{R}^{k\times d}
$$

的构造方法。

## Problem 3

输入分布，支撑集分别为

$$
\{x_i\}_{1\le i\le n},\qquad \{y_j\}_{1\le j\le n}\subset\mathbb{R}^n,
$$

对应的权重向量分别为

$$
\mu,\nu\in\Delta^n,
$$

即概率单纯形。令 cost 矩阵为

$$
C=(c_{ij})_{n\times n},\qquad c_{ij}=\lVert x_i-x_j\rVert.
$$

写出 Sinkhorn 算法的步骤。

## Problem 4

回忆度量空间 $(X,d)$（$d$ 为距离）的倍增维数 $m$ 的定义：最小的 $k$，使得对于任意子集 $S\subset X$，都可以被 $2^k$ 个直径至多为 $S$ 直径一半的集合包含（直径指最远两点之间的距离）。

Aspect ratio 定义为

$$
\Delta:=\frac{\operatorname{diam}(X)}{\min_{x\ne y,\,x,y\in X}d(x,y)}.
$$

证明：

$$
|X|\le \Delta^{O(m)}.
$$

## Problem 5

设 $X\subset\mathbb{R}^d$ 是 $d$ 维空间中的数据集，$|X|=n$。我们将 $X$ 划分为两个不相交的子集 $X_1$ 和 $X_2$，满足

$$
X=X_1\cup X_2,\qquad X_1\cap X_2=\varnothing.
$$

试证明：$X,X_1,X_2$ 的重心在同一条直线上。

## Problem 6

回忆 $(r,R)$-近似近邻查询的定义：给定集合 $P\subset\mathbb{R}^d$ 和点 $q\in\mathbb{R}^d$，记

$$
\operatorname{dist}(q,P)=\min_{p\in P}\lVert q-p\rVert.
$$

$(r,R)$-近似近邻查询要求：

1. 如果 $\operatorname{dist}(q,P)\le r$，本次查询返回 $u\in P$，使得
   $$
   \lVert q-u\rVert\le R.
   $$
2. 如果 $\operatorname{dist}(q,P)>R$，本次查询返回“$\operatorname{dist}(q,P)>r$”。
3. 如果
   $$
   r<\operatorname{dist}(q,P)\le R,
   $$
   本次查询返回上面两者中任意一种。

在课堂上，我们使用了 $(r,R,\alpha,\beta)$-Sensitive Hash Family 来构造这样的 $(r,R)$-近似近邻查询器。试回答下列问题：

1. 请写出哈希函数族 $F$ 是 $(r,R,\alpha,\beta)$-Sensitive 的含义。
2. 现在我们要完成一个 $(1+\epsilon)$-近似最近邻查询，即找到一个离查询点 $q$ 近似最近的点 $u\in P$，使得点 $u$ 满足
   $$
   \lVert q-u\rVert\le(1+\epsilon)\cdot\operatorname{dist}(q,P).
   $$
   我们已知距离 $\operatorname{dist}(q,P)$ 的可能范围是 $[a,b]$。请简述一个算法，调用 $(r,R)$-近似近邻查询器不超过
   $$
   O\!\left(\log\frac{b}{a}\right)
   $$
   次，完成上述的 $(1+\epsilon)$-近似最近邻查询。

## Problem 7

回忆一下上课讲过的数据流版本的概率计数问题：在 $1,2,3,\ldots$ 时刻，一台机器在每一个时刻源源不断地产生一个事件，要求在任意给定时刻，输出机器产生的事件的数量（$0$ 时刻事件数为 $0$），并且使用尽可能少的空间。

解决这个问题的一个算法是 Morris 算法：

1. 在时刻 $0$，初始化
   $$
   X_0=0.
   $$
2. 用 $X_i$ 表示 $i$ 时刻 $X$ 的值，在 $i+1$ 时刻
   $$
   X_{i+1}=
   \begin{cases}
   X_i+1, & \text{依概率 }\dfrac{1}{2^{X_i}},\\[6pt]
   X_i, & \text{依概率 }1-\dfrac{1}{2^{X_i}}.
   \end{cases}
   $$
3. 在时刻 $n$ 查询时，输出
   $$
   \hat n=2^{X_n}-1.
   $$

回答：

1. 试着分析 Morris 算法的性能（证明至少有
   $$
   1-\frac{1}{2\epsilon^2}
   $$
   的概率，算法输出的 $\hat n$ 与 $n$ 的误差在 $\epsilon n$ 之内）。

   提示：计算输出的 $\hat n$ 的期望和方差，然后使用切比雪夫不等式。

2. 证明至少有 $1-\delta$ 的概率，算法需要的存储空间不超过
   $$
   \log\log\frac{n}{\delta}.
   $$

## Problem 8

VC Dimension（Vapnik-Chervonenkis Dimension）是衡量一个模型假设类（hypothesis class）表达能力和复杂度的重要工具。

1. 三维空间的轴平行立方体
   $$
   D=\left\{
   [a,b]\times[c,d]\times[e,f]:
   -\infty\le a\le b\le\infty,
   -\infty\le c\le d\le\infty,
   -\infty\le e\le f\le\infty
   \right\}
   $$
   的 VC Dimension 是多少？请给出证明。

2. 假定 $X$ 表示二维平面，即 $X=\mathbb{R}^2$，
   $$
   R_1=\{r\mid r\text{ 是 }X\text{ 的一个三角形}\},
   $$
   $$
   R_2=\{r\mid r\text{ 是 }X\text{ 的一个圆}\}.
   $$
   已知 Range Space
   $$
   \Sigma_1=(X,R_1)
   $$
   的 VC Dimension 是 $7$，
   $$
   \Sigma_2=(X,R_2)
   $$
   的 VC Dimension 是 $3$。那么从 VC Dimension 的角度，二维空间里，圆的分散数据的能力更强，还是三角形分散数据的能力更强？
