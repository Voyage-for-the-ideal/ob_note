PB23151808 王玉麟

> `dijkstra_solver.py`为算法实现主程序；
> `benchmark_dijkstra.py`为实现随机生成ER图，比较LP与dijkstra算法的程序
## 1. 概述

本实验旨在实现 Dijkstra 最短路径算法，并通过与线性规划建模方法的对比。实验内容包括：
1. 基于优先队列（堆）优化实现 Dijkstra 算法。
2. 实现图的强连通性检查与负权重检查。
3. 随机生成强连通图进行基准测试。
4. 对比 Dijkstra 算法与单纯形法在最短路问题上的运行效率。

## 2. 算法实现细节

### 2.1 Dijkstra 算法 

采用 Python 标准库 `heapq` 实现最小堆，以 $O(1)$ 获取当前距离最小的节点。

- **数据结构**：
    - 邻接表 `adj_list` 存储图结构：`{u: {v1: w1, v2: w2}}`。
    - 最小堆 `pq` 存储 `(distance, node)` 元组。
    - 集合 `processed` 记录已确定最短路径的节点（闭集）。
- **流程**：
    1. 初始化起点距离为 0，其余为无穷大。
    2. 循环从堆中弹出距离最小节点 uu。
    3. 若 uu 已处理则跳过；否则将其加入 `processed`。
    4. 遍历 $u$ 的邻居 $v$，若发现更短路径 $d[u]+w<d[v]$，则更新 $d[v]$ 并将 $(d[v],v)$ 入堆。

```python
# 初始化距离表，起点为0，其余无穷大
d = {node: float('inf') for node in self.graph}
d[start_node] = 0

# 优先队列 (cost, node)，初始放入起点
pq = [(0, start_node)]
processed = set()

while pq:
    # 弹出当前最短距离点
    dist, u = heapq.heappop(pq)
    
    if u in processed: continue
    processed.add(u)
    
    # 遍历邻居并进行松弛操作
    for v, weight in self.graph[u].items():
        if d[u] + weight < d[v]:
            d[v] = d[u] + weight
            heapq.heappush(pq, (d[v], v))
```

### 2.2 图的有效性检查
> 检查是否存在负权边，是否强连通

1. **负权重检查**：Dijkstra 无法处理负权边，若检测到 $w<0$ 则抛出异常。
2. **强连通性检查**：对于有向图，需保证任意节点间可达。程序采用**双向 BFS 法**：
    - **正向**：从起点 BFS，确认能到达所有节点。
    - **反向**：构建转置图（所有边反向），从同一起点 BFS，确认能到达所有节点（即原图中所有节点能到达起点）。
    - 若两次 BFS 计数均等于总节点数，则图是强连通的。

```python
def check_validity(self):
    # 1. 负权重检查
    for u in self.graph:
        for v, w in self.graph[u].items():
            if w < 0: raise ValueError("Negative weight detected")

    # 2. 强连通检查
    # 2.1 正向 BFS
    start_node = self.nodes[0]
    if self._bfs_count(self.graph, start_node) != self.num_nodes:
         raise ValueError("Cannot reach all nodes from start.")

    # 2.2 反向 BFS (转置图)
    transpose_graph = {node: {} for node in self.nodes}
    for u in self.graph:
        for v in self.graph[u]:
            transpose_graph[v][u] = 1 
    
    if self._bfs_count(transpose_graph, start_node) != self.num_nodes:
         raise ValueError("Cannot reach start from all nodes.")
```

## 3. 线性规划建模

最短路问题可建模为最小费用流问题（Minimum Cost Flow）的一个特例：
$$
\begin{aligned}
\min \quad & \sum_{(i,j)\in E} c_{ij} x_{ij} \\
\text{s.t.} \quad
& \sum_{j} x_{sj} - \sum_{j} x_{js} =  1 && \text{(起点流出净值)} \\
& \sum_{j} x_{tj} - \sum_{j} x_{jt} = -1 && \text{(终点流入净值)} \\
& \sum_{j} x_{kj} - \sum_{i} x_{ik} =  0 && \forall k\ne s,t\ \text{(中间点流量守恒)}
\end{aligned}
$$

代码中使用 `scipy.optimize.linprog` 构建约束矩阵并求解该问题。
```python
# 构建等式约束矩阵 A_eq (Nodes x Edges)
A_eq = np.zeros((n, num_edges))
b_eq = np.zeros(n)

# 设置网络流约束
b_eq[start_node] = 1   # 源点：流出多1
b_eq[end_node] = -1    # 汇点：流入多1 (流出=-1)
# 其他中间节点默认为0，表示流量守恒

# 填充矩阵：每条边 (u, v) 从 u 流出 (+1)，流入 v (-1)
for idx, (u, v, w) in enumerate(edges):
    A_eq[u, idx] = 1
    A_eq[v, idx] = -1

# 调用单纯形法 (method='highs' 是现代的高性能实现)
res = scipy.optimize.linprog(c, A_eq=A_eq, b_eq=b_eq, method='highs')
```


## Dijkstra算法与Scipy求解运行时间比较

下图展示了随着问题规模（节点数量）增加，两种方法的运行时间对比：

![D:\code\operation_research\dijkstra\dijkstra_vs_lp_benchmark.png](file:///d%3A/code/operation_research/dijkstra/dijkstra_vs_lp_benchmark.png)

实验结果显示，**Dijkstra 算法的运行速度显著快于线性规划方法**，且这种差距达到了两个数量级（约 100 倍）。

**原因分析**：
1. **算法复杂度与专用性**：
    - **Dijkstra** 是专为最短路设计的**组合优化算法**，利用贪心策略直接在图结构上搜索，复杂度仅为 $O(Elog⁡V)$（堆优化）。它没有任何复杂的代数运算。
    - **线性规划 (单纯形/内点法)** 是**通用代数方法**。即便针对同样的问题，它也必须构建庞大的约束矩阵 $A_{eq}$（大小为 $V×E$），并进行高代价的矩阵分解和迭代。
2. **开销**：
    - LP 求解器在初始化矩阵、预处理和内存分配上的固定开销远大于 Dijkstra 整个算法的运行时间。