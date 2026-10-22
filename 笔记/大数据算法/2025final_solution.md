# 大数据算法试卷参考解答

> 说明：下文默认所有对数均可取以 2 为底；改变底数只影响常数。  
> 第 3 题题面中的成本应为 $c_{ij}=\lVert x_i-y_j\rVert$，而不是 $\lVert x_i-x_j\rVert$。

---

## Problem 1

证明：如果 $S_1$ 是 $S_2$ 的 $(k,\epsilon)$-coreset，$S_2$ 是 $S_3$ 的 $(k,\delta)$-coreset，那么 $S_1$ 是 $S_3$ 的

$$
\bigl(k,(1+\epsilon)(1+\delta)-1\bigr)\text{-coreset}.
$$

### 解

记任意一个大小不超过 $k$ 的候选解为 $C$，并用 $\operatorname{cost}(S,C)$ 表示数据集 $S$ 在解 $C$ 下的代价。

由于 $S_1$ 是 $S_2$ 的 $(k,\epsilon)$-coreset，对任意 $C$ 都有

$$
(1-\epsilon)\operatorname{cost}(S_2,C)
\le
\operatorname{cost}(S_1,C)
\le
(1+\epsilon)\operatorname{cost}(S_2,C).
$$

又因为 $S_2$ 是 $S_3$ 的 $(k,\delta)$-coreset，所以

$$
(1-\delta)\operatorname{cost}(S_3,C)
\le
\operatorname{cost}(S_2,C)
\le
(1+\delta)\operatorname{cost}(S_3,C).
$$

将两个不等式复合，上界为

$$
\operatorname{cost}(S_1,C)
\le
(1+\epsilon)(1+\delta)\operatorname{cost}(S_3,C).
$$

令

$$
\gamma=(1+\epsilon)(1+\delta)-1
=\epsilon+\delta+\epsilon\delta,
$$

则

$$
\operatorname{cost}(S_1,C)
\le
(1+\gamma)\operatorname{cost}(S_3,C).
$$

另一方面，

$$
\operatorname{cost}(S_1,C)
\ge
(1-\epsilon)(1-\delta)\operatorname{cost}(S_3,C).
$$

而

$$
(1-\epsilon)(1-\delta)
=1-\epsilon-\delta+\epsilon\delta
\ge
1-\epsilon-\delta-\epsilon\delta
=1-\gamma.
$$

因此

$$
\operatorname{cost}(S_1,C)
\ge
(1-\gamma)\operatorname{cost}(S_3,C).
$$

综上，

$$
(1-\gamma)\operatorname{cost}(S_3,C)
\le
\operatorname{cost}(S_1,C)
\le
(1+\gamma)\operatorname{cost}(S_3,C),
$$

其中

$$
\gamma=(1+\epsilon)(1+\delta)-1.
$$

所以

$$
\boxed{S_1\text{ 是 }S_3\text{ 的 }\bigl(k,(1+\epsilon)(1+\delta)-1\bigr)\text{-coreset}.}
$$

---

## Problem 2

JL 变换将 $x\in\mathbb R^d$ 映射为 $Ax\in\mathbb R^k$。两种常见构造如下。

### 构造一：高斯随机矩阵

令矩阵元素独立，并满足

$$
A_{ij}\sim\mathcal N\!\left(0,\frac1k\right).
$$

等价地，

$$
A=\frac1{\sqrt{k}}G,
\qquad G_{ij}\sim\mathcal N(0,1).
$$

### 构造二：随机符号矩阵

令

$$
A_{ij}
=
\begin{cases}
\dfrac1{\sqrt{k}},&\text{概率 }1/2,\\[6pt]
-\dfrac1{\sqrt{k}},&\text{概率 }1/2,
\end{cases}
$$

且各元素相互独立。

通常取

$$
k=O\!\left(\frac{\log n}{\epsilon^2}\right),
$$

便能以高概率对 $n$ 个点同时保持两两距离：

$$
(1-\epsilon)\lVert x-y\rVert_2^2
\le
\lVert A(x-y)\rVert_2^2
\le
(1+\epsilon)\lVert x-y\rVert_2^2.
$$

---

## Problem 3

题面成本矩阵应写为

$$
C=(c_{ij})_{n\times n},
\qquad
c_{ij}=\lVert x_i-y_j\rVert.
$$

Sinkhorn 算法求解熵正则化最优传输问题

$$
\min_{P\ge 0}
\left\{
\langle P,C\rangle
+
\lambda\sum_{i,j}P_{ij}(\log P_{ij}-1)
\right\}
$$

满足

$$
P\mathbf 1=\mu,
\qquad
P^\mathsf T\mathbf 1=\nu,
$$

其中 $\lambda>0$ 为熵正则化参数。

### 步骤 1：构造 Gibbs 核

逐元素定义

$$
K_{ij}
=
\exp\!\left(-\frac{c_{ij}}{\lambda}\right).
$$

即

$$
K=\exp(-C/\lambda).
$$

### 步骤 2：初始化

例如令

$$
v^{(0)}=\mathbf 1.
$$

### 步骤 3：交替缩放

对 $t=0,1,2,\ldots$ 重复

$$
u^{(t+1)}
=
\mu\oslash\bigl(Kv^{(t)}\bigr),
$$

$$
v^{(t+1)}
=
\nu\oslash\bigl(K^\mathsf Tu^{(t+1)}\bigr),
$$

其中 $\oslash$ 表示逐元素除法。

### 步骤 4：检查收敛

令

$$
P^{(t)}
=
\operatorname{diag}(u^{(t)})
K
\operatorname{diag}(v^{(t)}).
$$

当

$$
\lVert P^{(t)}\mathbf 1-\mu\rVert_1
+
\lVert (P^{(t)})^\mathsf T\mathbf 1-\nu\rVert_1
\le \tau
$$

时停止。

### 步骤 5：输出

输出

$$
\boxed{
P^\star
=
\operatorname{diag}(u^\star)
K
\operatorname{diag}(v^\star)
}.
$$

其满足

$$
P^\star\mathbf 1=\mu,
\qquad
(P^\star)^\mathsf T\mathbf 1=\nu.
$$

对应传输成本为

$$
\boxed{
\langle P^\star,C\rangle
=
\sum_{i,j}P^\star_{ij}c_{ij}
}.
$$

每轮主要包含两次矩阵—向量乘法，时间复杂度为 $O(n^2)$。

---

## Problem 4

记

$$
D=\operatorname{diam}(X),
\qquad
\rho=\min_{x\ne y}d(x,y).
$$

于是

$$
\Delta=\frac D\rho.
$$

根据倍增维数定义，一个直径至多为 $D$ 的集合可以由至多 $2^m$ 个直径至多为 $D/2$ 的集合覆盖。

递归使用这一性质。递归 $t$ 次后，$X$ 可以被至多

$$
2^{mt}
$$

个直径至多为

$$
\frac D{2^t}
$$

的集合覆盖。

取

$$
t=\left\lceil\log_2(2\Delta)\right\rceil.
$$

则

$$
\frac D{2^t}
\le
\frac\rho2
<\rho.
$$

因为 $\rho$ 是 $X$ 中不同点之间的最小距离，所以每个直径小于 $\rho$ 的覆盖集合至多包含 $X$ 中的一个点。因此

$$
|X|\le 2^{mt}.
$$

又因为

$$
t\le\log_2(2\Delta)+1,
$$

所以

$$
\begin{aligned}
|X|
&\le
2^{m(\log_2(2\Delta)+1)}\\
&=2^m(2\Delta)^m\\
&=(4\Delta)^m.
\end{aligned}
$$

故

$$
\boxed{|X|\le (4\Delta)^m=\Delta^{O(m)}.}
$$

---

## Problem 5

假设 $X_1,X_2$ 均非空。记

$$
n_1=|X_1|,
\qquad
n_2=|X_2|,
\qquad
n=n_1+n_2.
$$

分别记 $X,X_1,X_2$ 的重心为

$$
\mu=\frac1n\sum_{x\in X}x,
$$

$$
\mu_1=\frac1{n_1}\sum_{x\in X_1}x,
\qquad
\mu_2=\frac1{n_2}\sum_{x\in X_2}x.
$$

由于 $X_1,X_2$ 是 $X$ 的不交划分，

$$
\begin{aligned}
\mu
&=\frac1n\left(\sum_{x\in X_1}x+\sum_{x\in X_2}x\right)\\
&=\frac{n_1}{n}\mu_1+\frac{n_2}{n}\mu_2.
\end{aligned}
$$

于是

$$
\mu-\mu_1
=
\frac{n_2}{n}(\mu_2-\mu_1).
$$

所以 $\mu-\mu_1$ 是 $\mu_2-\mu_1$ 的数乘，故三个重心共线。

而且 $\mu$ 位于 $\mu_1$ 与 $\mu_2$ 的线段上，并满足

$$
\boxed{
\lVert\mu-\mu_1\rVert:
\lVert\mu_2-\mu\rVert
=n_2:n_1
}.
$$

---

## Problem 6

### 1. $(r,R,\alpha,\beta)$-Sensitive 的含义

哈希函数族 $F$ 称为 $(r,R,\alpha,\beta)$-Sensitive，如果从 $F$ 中随机选取 $h$ 后，对任意 $x,y$：

当

$$
d(x,y)\le r
$$

时，

$$
\Pr_{h\sim F}[h(x)=h(y)]\ge\alpha;
$$

当

$$
d(x,y)>R
$$

时，

$$
\Pr_{h\sim F}[h(x)=h(y)]\le\beta.
$$

通常要求

$$
\boxed{\alpha>\beta}.
$$

也就是说，近点碰撞概率高，远点碰撞概率低。

### 2. 构造 $(1+\epsilon)$-近似最近邻查询

记

$$
d^\star=\operatorname{dist}(q,P),
\qquad
a\le d^\star\le b.
$$

取

$$
\eta=\frac\epsilon3,
$$

并使用参数为

$$
(r,(1+\eta)r)
$$

的近似近邻查询器。

#### 初始化

以 $r=b$ 调用一次查询器。由于 $d^\star\le b$，一定会返回某个点 $u$，并满足

$$
\lVert q-u\rVert\le(1+\eta)b.
$$

令

$$
L=a,
\qquad
U=\lVert q-u\rVert,
$$

并保存当前点 $u$。始终保持

$$
L\le d^\star\le U,
$$

且 $U$ 是一个已找到点到 $q$ 的实际距离。

#### 迭代

如果

$$
U\le(1+\epsilon)L,
$$

则返回当前点。

否则令

$$
r=\sqrt{\frac{LU}{1+\eta}},
\qquad
R=(1+\eta)r,
$$

并调用 $(r,R)$ 查询器。

- 若返回“$d^\star>r$”，则更新
  $$
  L\leftarrow r.
  $$

- 若返回点 $z$，则
  $$
  \lVert q-z\rVert\le(1+\eta)r,
  $$
  更新
  $$
  U\leftarrow\min\{U,\lVert q-z\rVert\},
  $$
  并保存达到新上界的点。

#### 正确性

停止时

$$
U\le(1+\epsilon)L.
$$

又因为 $L\le d^\star$，所以返回点满足

$$
\lVert q-u\rVert
=U
\le(1+\epsilon)L
\le(1+\epsilon)d^\star.
$$

即

$$
\boxed{
\lVert q-u\rVert
\le
(1+\epsilon)\operatorname{dist}(q,P)
}.
$$

#### 查询次数

设当前上下界之比为

$$
\rho=\frac UL.
$$

无论查询成功还是失败，更新后都有

$$
\rho_{\mathrm{new}}
\le
\sqrt{(1+\eta)\rho}.
$$

因此区间在对数尺度上每轮近似减半。查询次数为

$$
O\!\left(\log\log\frac ba+\log\frac1\epsilon\right),
$$

固定 $\epsilon$ 时不超过题目要求的

$$
\boxed{O\!\left(\log\frac ba\right)}.
$$

课堂上的简化写法也可以使用几何网格

$$
a,\,a(1+\Theta(\epsilon)),\,a(1+\Theta(\epsilon))^2,\ldots,b,
$$

从小到大查询。其次数为

$$
O\!\left(\frac1\epsilon\log\frac ba\right),
$$

当 $\epsilon$ 视为常数时，同样记为 $O(\log(b/a))$。

---

## Problem 7

令

$$
Y_i=2^{X_i}.
$$

则

$$
\hat n=Y_n-1.
$$

### 1. 期望、方差与误差概率

给定 $Y_i$ 后：

- 以概率 $1/Y_i$，$Y_{i+1}=2Y_i$；
- 以概率 $1-1/Y_i$，$Y_{i+1}=Y_i$。

因此

$$
\begin{aligned}
\mathbb E[Y_{i+1}\mid Y_i]
&=\frac1{Y_i}\cdot2Y_i+
\left(1-\frac1{Y_i}\right)Y_i\\
&=Y_i+1.
\end{aligned}
$$

两边取期望：

$$
\mathbb E[Y_{i+1}]=\mathbb E[Y_i]+1.
$$

由于 $Y_0=1$，所以

$$
\boxed{\mathbb E[Y_n]=n+1}.
$$

从而

$$
\boxed{\mathbb E[\hat n]=n},
$$

即估计量无偏。

再计算二阶矩：

$$
\begin{aligned}
\mathbb E[Y_{i+1}^2\mid Y_i]
&=\frac1{Y_i}(2Y_i)^2+
\left(1-\frac1{Y_i}\right)Y_i^2\\
&=Y_i^2+3Y_i.
\end{aligned}
$$

因此

$$
\mathbb E[Y_{i+1}^2]
=
\mathbb E[Y_i^2]+3\mathbb E[Y_i]
=
\mathbb E[Y_i^2]+3(i+1).
$$

由 $Y_0^2=1$，累加得到

$$
\mathbb E[Y_n^2]
=1+3\sum_{i=0}^{n-1}(i+1)
=1+\frac{3n(n+1)}2.
$$

所以

$$
\begin{aligned}
\operatorname{Var}(Y_n)
&=\mathbb E[Y_n^2]-\mathbb E[Y_n]^2\\
&=1+\frac{3n(n+1)}2-(n+1)^2\\
&=\frac{n(n-1)}2.
\end{aligned}
$$

由于 $\hat n=Y_n-1$，

$$
\boxed{
\operatorname{Var}(\hat n)
=\frac{n(n-1)}2
}.
$$

由切比雪夫不等式，

$$
\begin{aligned}
\Pr(|\hat n-n|\ge\epsilon n)
&\le
\frac{\operatorname{Var}(\hat n)}{\epsilon^2n^2}\\
&=
\frac{n-1}{2\epsilon^2n}\\
&\le
\frac1{2\epsilon^2}.
\end{aligned}
$$

所以

$$
\boxed{
\Pr(|\hat n-n|\le\epsilon n)
\ge
1-\frac1{2\epsilon^2}
}.
$$

### 2. 存储空间

由

$$
\mathbb E[2^{X_n}]=n+1,
$$

使用 Markov 不等式：

$$
\begin{aligned}
\Pr\!\left(
2^{X_n}\ge\frac{n+1}{\delta}
\right)
&\le
\frac{\mathbb E[2^{X_n}]}{(n+1)/\delta}\\
&=\delta.
\end{aligned}
$$

因此至少以 $1-\delta$ 的概率，

$$
X_n<\log_2\frac{n+1}{\delta}.
$$

存储整数 $X_n$ 需要约

$$
\log_2(X_n+1)
$$

比特，故至少以 $1-\delta$ 的概率，

$$
\text{space}
\le
\log_2\log_2\frac{n+1}{\delta}+O(1).
$$

所以

$$
\boxed{
\text{space}
=O\!\left(\log\log\frac n\delta\right)
}.
$$

忽略取整和加法常数时，写作

$$
\boxed{
\log\log\frac n\delta
}.
$$

---

## Problem 8

### 1. 三维轴平行长方体的 VC Dimension

题面定义的

$$
[a,b]\times[c,d]\times[e,f]
$$

各边长度不必相等，严格地说是轴平行长方体。其 VC Dimension 为

$$
\boxed{6}.
$$

#### 下界：$\operatorname{VC}(D)\ge6$

取六个点

$$
p_1^+=(1,0,0),\quad p_1^-=(-1,0,0),
$$

$$
p_2^+=(0,1,0),\quad p_2^-=(0,-1,0),
$$

$$
p_3^+=(0,0,1),\quad p_3^-=(0,0,-1).
$$

对每个坐标轴 $j\in\{1,2,3\}$，根据希望是否包含 $p_j^+$ 与 $p_j^-$，选择区间：

| 希望包含的点 | 区间 |
|---|---|
| 两点都包含 | $[-1,1]$ |
| 只包含 $p_j^+$ | $[-1/2,1]$ |
| 只包含 $p_j^-$ | $[-1,1/2]$ |
| 两点都不包含 | $[-1/2,1/2]$ |

所有这些区间都包含 $0$。设三个坐标轴选出的区间为 $I_1,I_2,I_3$，构造

$$
B=I_1\times I_2\times I_3.
$$

对于 $p_j^\pm$，另外两个坐标都是 $0$，因此它是否属于 $B$ 完全由第 $j$ 个区间是否包含其 $\pm1$ 坐标决定。

所以这六个点的任意子集都可以由某个轴平行长方体恰好选出，故

$$
\operatorname{VC}(D)\ge6.
$$

#### 上界：$\operatorname{VC}(D)\le6$

任取七个点组成集合 $S$。分别选择：

- $x$ 坐标最小和最大的点；
- $y$ 坐标最小和最大的点；
- $z$ 坐标最小和最大的点。

至多选出六个点，因此至少有一个点 $p$ 没有被选中。

点 $p$ 的每个坐标，都位于其余点相应坐标的最小值和最大值之间。因此 $p$ 位于其余六个点的轴平行包围盒中。

现在把其余六个点标为正例，把 $p$ 标为负例。任何包含其余六个点的轴平行长方体，都必然包含它们的轴平行包围盒，因此也必然包含 $p$。

所以七个点不可能被打散，故

$$
\operatorname{VC}(D)\le6.
$$

结合上下界，

$$
\boxed{\operatorname{VC}(D)=6}.
$$

一般地，$\mathbb R^d$ 中轴平行长方体的 VC Dimension 为 $2d$。

### 2. 三角形与圆的分散能力

已知

$$
\operatorname{VC}(\Sigma_1)=7,
\qquad
\operatorname{VC}(\Sigma_2)=3.
$$

VC Dimension 越大，说明该 Range 类能够打散的最大点集越大，表达能力越强。

因为

$$
7>3,
$$

所以从 VC Dimension 的角度，

$$
\boxed{\text{三角形分散数据点的能力比圆更强。}}
$$

更准确地说，存在某个七点集合可以被三角形打散，而圆不可能打散任意四点集合。这里比较的是假设类的最大表达能力，并不表示对每一种具体点集，三角形都一定优于圆。
