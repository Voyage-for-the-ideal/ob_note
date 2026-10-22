```sql
SELECT * FROM <表名> WHERE <条件表达式>
--查询语法
```
投影查询(仅出现某几个列)：将`*`换成对应列即可
排序：
`ORDER BY (对应列)`默认从小到大
`ORDER BY (对应列) DESC`从大到小
要进一步排序，可以继续添加列名

```sql
SELECT id, name, gender, score
FROM students
WHERE class_id = 1
ORDER BY score DESC;
--ORDER BY要放在FROM后面
```

分页：
`LIMIT <N-M> OFFSET <M>`
`<N-M>`：显示多少条内容（一页有多少条）
`<M>`：从第几条开始（偏移量）（第一条是0）

聚合：（查询列表的一些特征）

| 函数  | 说明                  |
| --- | ------------------- |
| SUM | 计算某一列的合计值，该列必须为数值类型 |
| AVG | 计算某一列的平均值，该列必须为数值类型 |
| MAX | 计算某一列的最大值           |
| MIN | 计算某一列的最小值           |
多表查询：
`FROM <表1>,<表二>`
`FROM <表1> <别名1>,<表二> <别名2>`

连接查询（左表：原来的表，右表：加进去的表）
```sql
-- 使用OUTER JOIN:
SELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.score
FROM students s
RIGHT OUTER JOIN classes c
ON s.class_id = c.id;
--ON 表明要填的东西
--左表：s  右表：c
```

`INNER JOIN`只返回同时存在于两张表的行数据
`RIGHT OUTER JOIN`返回右表都存在的行
`LEFT OUTER JOIN`则返回左表都存在的行
`FULL OUTER JOIN`：把两张表的所有记录全部选择出来，并且，自动把对方不存在的列填充为NULL：