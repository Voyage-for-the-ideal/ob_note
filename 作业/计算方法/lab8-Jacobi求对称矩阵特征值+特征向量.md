Jacobi方法使用一系列正交矩阵将对称矩阵逐渐对角化。

### 步骤
1. 每次选择绝对值最大的两个非对角元素
2. 计算旋转角度 $\theta$ ,使得旋转后该元素对应位置为0
3. 构造正交矩阵，并计算新的矩阵: $$ A^{(k+1)}=P^T_{ij}(\theta)A^{(k)}P_{ij} $$
4. 检查收敛（一般是判断非对角元素是否足够小）
如此重复即可。

### 为什么非对角元素会不断变小？
在旋转过程中，矩阵的Frobenius范数保持不变，Frobenius范数是矩阵所有元素的平方和的平方根。而对角元素不断增大

也可以认为非对角线上的分量在旋转过程中不断变小。