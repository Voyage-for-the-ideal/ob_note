### 基础信息
姓名：王玉麟
学号：PB23151808
备注：部分操作结果仅显示部分
### 数据库安装和配置结果
![[Pasted image 20250422164400.png]]

### 任务一：创建数据结构
#### 创建各表
```mysql
CREATE DATABASE lab1;
CREATE TABLE Student(
    SNO CHAR(11) NOT NULL PRIMARY KEY,
    NAME VARCHAR(3) NOT NULL ,
    GENDER VARCHAR(6) NOT NULL,
    AGE INT NOT NULL,
    DEPART INT
    );
CREATE TABLE Teacher(
    TNO CHAR(7) NOT NULL PRIMARY KEY,
    NAME VARCHAR(3) NOT NULL,
    GENDER VARCHAR(6) NOT NULL,
    BRITHDAY DATE,
    POSITION VARCHAR(20) NOT NULL,
    DEPART INT
    );
CREATE TABLE Course(
    CNO CHAR(8) NOT NULL PRIMARY KEY,
    NAME VARCHAR(30) NOT NULL,
    CPNO CHAR(8),
    FOREIGN KEY (CPNO) REFERENCES Course(CNO),
    CCREDIT FLOAT,
    TNO CHAR(7),
    FOREIGN KEY (TNO) REFERENCES Teacher(TNO)
);
--用FOREIGN KEY约束来实现外键约束

CREATE TABLE Score(
    SNO CHAR(11),
    FOREIGN KEY (SNO) REFERENCES Student(SNO),
    CNO CHAR(8),
    FOREIGN KEY (CNO) REFERENCES Course(CNO),
    PRIMARY KEY(SNO, CNO),
    DEGREE INT,
    SEMESTER CHAR(6)
);
```

其中`student`表的结构如下，其他表亦创建成功：
![[Pasted image 20250422165502.png]]
#### 导入数据
依靠`LOAD DATA INFILE`将文件数据导入mysql中，具体操作如下所示：
```mysql
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Teacher.csv" INTO TABLE Teacher
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;    
  
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Student.csv" INTO TABLE Student
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
  
SET FOREIGN_KEY_CHECKS = 0;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Course.csv" INTO TABLE Course
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
SET FOREIGN_KEY_CHECKS = 1;
  
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Score.csv" INTO TABLE Score
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

其中`student`表导入后数据如下图所示：（其他数据亦导入成功）
![[Pasted image 20250422170009.png]]
### 任务二
#### 修改基本表
```mysql
--1 增加⼀个新的属性列BIRTHYEAR
ALTER TABLE student
ADD COLUMN BIRTHYEAR INT;
```

```mysql
--2 计算每个学⽣的出⽣年份
SELECT NAME,YEAR(NOW())-AGE FROM Student;
```
![[Pasted image 20250422172124.png|300]]

```mysql
--3 将每个学⽣的年龄减去2，并将年龄的类型从int改成char
UPDATE Student SET AGE=AGE-2;
ALTER TABLE student
MODIFY COLUMN AGE CHAR NOT NULL;
```

```mysql
--4 将BIRTHYEAR列删除
ALTER TABLE student
DROP COLUMN BIRTHYEAR;
```

```mysql
--5 创建⼀个学⽣选课课程数量表： student_course(SNO,NUM_COURSE)
CREATE TABLE student_course(
    SNO CHAR(11) NOT NULL PRIMARY KEY,
    NUM_COURSE INT NOT NULL,
    FOREIGN KEY (SNO) REFERENCES Student(SNO)
);
```

![[Pasted image 20250422172303.png]]

```mysql
--6 在表 student_course 添加对应选课数量记
INSERT INTO student_course(SNO,NUM_COURSE)
SELECT SNO,COUNT(*) FROM score GROUP BY SNO;
```
![[Pasted image 20250422172409.png|300]]


```mysql
--7 删除student_course中选修1门或者3门课的学⽣，然后删除student_course表
DELETE FROM student_course WHERE NUM_COURSE=3 or NUM_COURSE=1;
DROP TABLE student_course;
```
和第6小问相比，选课数量为1/3的学生记录被删除了
![[Pasted image 20250422172451.png|300]]

```mysql
--8 在Student表中添加学⽣姓名必须取唯⼀值的约束条件，然后再将这个约束条件删除
ALTER TABLE student
ADD constraint name_unique UNIQUE(NAME);

ALTER TABLE student
DROP constraint name_unique;
--如果命名了完整性约束的名称，则可以使用该名称来删除完整性约束
--如果没有命名，就使用INDEX NAME来删除完整性约束
```

```mysql
--9 删除Score表的复合主键，然后建⽴新的主键（SNO,CNO,SEMESTER）
-- 为SNO列创建索引
ALTER TABLE score ADD INDEX idx_sno (SNO);
-- 为CNO列创建索引
ALTER TABLE score ADD INDEX idx_cno (CNO);
ALTER TABLE score
DROP PRIMARY KEY;
ALTER TABLE score
ADD PRIMARY KEY(SNO,CNO,SEMESTER);
```

```mysql
--10 修改Student表中DEPART列的列名为DEPARTMENT
ALTER TABLE student
RENAME COLUMN DEPART TO DEPARTMENT;
```
![[Pasted image 20250422165502.png]]

```mysql
--11 在score表中删除DEPARTMENT为229的学⽣的课程记录，
--然后在score表中为每个学生删除其最低分的课程记录

DELETE FROM Score WHERE SNO IN (SELECT SNO FROM student WHERE DEPARTMENT=229);
DELETE score FROM score
JOIN (
    SELECT SNO,MIN(DEGREE) AS min_degree
    FROM score
    GROUP BY SNO
) AS min_score
ON score.SNO=min_score.SNO AND score.DEGREE=min_score.min_degree; 
/*自己和自己join以规避 delete语句中的WHERE无法对目标组执行操作 的限制*/
```


```mysql
--12 在成绩表（Score）中增加⼀个新的属性列GRADE
ALTER TABLE score
ADD COLUMN GRADE CHAR;
UPDATE score SET GRADE = 
    CASE 
        WHEN DEGREE >= 90 THEN 'A'
        WHEN DEGREE >= 80 THEN 'B' 
        WHEN DEGREE >= 70 THEN 'C'
        WHEN DEGREE >= 60 THEN 'D'
        ELSE 'F'
    END;
```
![[Pasted image 20250422173210.png]]

```mysql
--13 在Student表中插⼊你⾃⼰的个⼈数据
INSERT INTO student
VALUES("PB231518080","WYL","male",20,229)
```
![[Pasted image 20250422173250.png]]
#### 查询
```mysql
--1 查询和你属于同⼀个系的学⽣学号和姓名
SELECT SNO,NAME
FROM student
WHERE DEPARTMENT=229;
```
![[Pasted image 20250422173442.png|300]]

```mysql
--2 查询和你属于同⼀个系的学⽣学号和姓名(不包括你本⼈)
SELECT SNO,NAME
FROM student
WHERE DEPARTMENT=229 AND SNO!="PB231518080";
```
（相比第1小问数量少了1个）
![[Pasted image 20250422173518.png|200]]

```mysql
--3 查询和YH同学不属于同⼀个系的学⽣学号和姓名
SELECT SNO,NAME
FROM student
WHERE DEPARTMENT!=(
    SELECT DEPARTMENT FROM student WHERE NAME="YH"
);
```
没有229系（YH所属系）的学生。
![[Pasted image 20250422173637.png|300]]

```mysql
--4 查询和你以及YH同学都不在⼀个系的学⽣学号和姓名
SELECT SNO,NAME
FROM student
WHERE DEPARTMENT!=(
    SELECT DEPARTMENT FROM student WHERE NAME="YH"or NAME="WYL"
);
```
（笔者和YH都是229系的）
![[Pasted image 20250422173637.png|300]]

```mysql
--5 查询229系⽼师的⼯号和姓名
SELECT TNO,NAME
FROM teacher
WHERE DEPART=229;
```
![[Pasted image 20250422173850.png|200]]

```mysql
--6 查询 11 系和 229 系教师的总⼈数
SELECT DEPART,COUNT(*)
FROM teacher
WHERE DEPART=11 or DEPART=229
GROUP BY DEPART;
/*当 SQL 查询包含聚合函数（如 COUNT, SUM, AVG）时，SELECT 列表中所有非聚合的列必须出现在 GROUP BY 子句中*/
```

![[Pasted image 20250422173929.png|200]]

```mysql
--7 查询年龄最⼤的学⽣的学号、姓名和年龄
SELECT SNO,NAME,AGE MAX_AGE
FROM student
WHERE AGE=(SELECT MAX(AGE) FROM student);
/*聚合函数（如 COUNT, SUM, AVG）应在 SELECT 或 HAVING 子句中使用，而不是在 WHERE 子句中*/
```
最大的人22岁
![[Pasted image 20250422174015.png|300]]

```mysql
--8 查询你的系中年龄最⼩的学⽣的学号、姓名和年龄。
SELECT SNO,NAME,AGE MIN_AGE
FROM student
WHERE AGE=(SELECT MIN(AGE) FROM student) AND DEPARTMENT=229;
```
最小的人17岁
![[Pasted image 20250422174039.png]]

```mysql
--9 查询选修 DB_Design 课程且成绩在 80 分及以下的学⽣的学号、姓名和分数
SELECT stu.SNO,stu.NAME,sco.DEGREE
FROM student stu,score sco
WHERE stu.SNO=sco.SNO 
    AND sco.DEGREE<=80
    AND sco.CNO=(
        SELECT CNO FROM course WHERE NAME='DB_Design'
    );
```
无查询结果

```mysql
--10 查询选修过“ZDH”⽼师课程的学⽣学号和姓名
SELECT DISTINCT stu.SNO,stu.NAME
FROM student stu
JOIN score sc ON stu.SNO=sc.SNO
JOIN course c ON sc.CNO=c.CNO
JOIN teacher t ON c.TNO=t.TNO
WHERE t.NAME="ZDH";
```
![[Pasted image 20250422175018.png|250]]

```mysql
--11(输出DB_Design课程所有学生的学号和成绩)
SELECT score.SNO,score.DEGREE
FROM score
JOIN course ON score.CNO=course.CNO
WHERE course.NAME="DB_Design"
ORDER BY DEGREE DESC;
```
（在作业后面的**空值**部分，DB_Design成被修改为空值。无法原样呈现，这里用Grade做应证）
![[Pasted image 20250422175551.png|300]]

```mysql
--12 查询每门课的平均成绩
SELECT course.CNO,course.NAME,AVG(score.DEGREE) AS AVG_DEGREE
FROM course
LEFT JOIN score ON score.CNO=course.CNO
GROUP BY course.CNO;
/*LEFT JOIN 右表中没有匹配的行时，结果集中的列值为NULL*/
```
（在作业后面的**空值**部分，DB_Design成绩被修改为空值）
![[Pasted image 20250422175621.png|400]]

```mysql
--13 查询学分⼤于 3(不包括3) 的课程的平均成绩
SELECT course.CNO,course.NAME,AVG(score.DEGREE)
FROM course
LEFT JOIN score ON score.CNO=course.CNO
WHERE course.CCREDIT>3
GROUP BY course.CNO;
```
其中Deep_Learning课程成绩为空值
![[Pasted image 20250422175741.png|400]]

```mysql
--14 查询至少选修了TNO=”TA90023”的老师（ZDH ⽼师）开设的所有课程的学生学号
/*使用双NOT EXISTS*/
SELECT SNO FROM student
WHERE NOT EXISTS(
    SELECT * FROM course
    WHERE course.TNO="TA90023"
    AND NOT EXISTS(
        SELECT * FROM score
        WHERE score.SNO=student.SNO AND score.CNO=course.CNO
    )
);

/*即，选了ZDH的课 且 这种课的数量等于ZDH开课数量*/
SELECT SNO
FROM (
    SELECT SNO, COUNT(DISTINCT CNO) cnt
    FROM Score
    WHERE CNO IN (SELECT CNO FROM Course WHERE TNO = 'TA90023')
    GROUP BY SNO
) t
WHERE cnt = (SELECT COUNT(DISTINCT CNO) FROM Course WHERE TNO = 'TA90023');
```
结果为：PB230000003，PB230000040，PB230000054

```mysql
--15 查询每门课程的最⾼分和最低分，并计算其分数差
SELECT score.CNO,course.NAME,
    MAX(score.DEGREE) AS MAX_DEGREE,
    MIN(score.DEGREE) AS MIN_DEGREE,
    MAX(score.DEGREE)-MIN(score.DEGREE) AS DIFF_DEGREE
FROM score
JOIN course ON score.CNO=course.CNO
GROUP BY score.CNO;
```
![[Pasted image 20250422175936.png|600]]

```mysql
--16 查询存在考试成绩低于 78 分的学⽣学号，以及每个学生低于 78 分的课程的数量
SELECT SNO,COUNT(*) AS NUM
FROM score
WHERE DEGREE<=78
GROUP BY SNO;
```
![[Pasted image 20250422180005.png|200]]

```mysql
--17 查询所教过的课程中有学生考试成绩低于 72 分的教师的工号和姓名
SELECT DISTINCT teacher.TNO,teacher.NAME
FROM teacher
JOIN course ON teacher.TNO=course.TNO
WHERE EXISTS(
    SELECT * FROM score
    WHERE score.DEGREE<72
);
```
![[Pasted image 20250422180029.png|210]]

```mysql
--18 查询选修大于 6 门课程的学⽣
SELECT s.SNO, s.NAME
FROM Student s
JOIN Score sc ON s.SNO = sc.SNO
GROUP BY s.SNO, s.NAME
HAVING COUNT(DISTINCT sc.CNO) > 6;
```
无查询结果


```mysql
--19 查询⾄少选修了学号为SNO=”PB230000002”的同学（ZY同学）所选全部课程的学生学号
/*即，选了ZY同学选的课 且 这种课的数量等于ZY同学选课数量*/
SELECT SNO
FROM (
    SELECT SNO,COUNT(DISTINCT CNO) cnt
    FROM score
    WHERE CNO IN (SELECT CNO FROM score WHERE SNO="PB230000002")
    GROUP BY SNO
)AS t
WHERE cnt=(SELECT COUNT(DISTINCT CNO) FROM Score WHERE SNO="PB230000002");  
```
只有ZY一人

```mysql
--20 查询student表中各个学生姓名与相应的平均成绩
SELECT student.NAME,AVG(score.DEGREE)
FROM student
LEFT JOIN score ON student.SNO=score.SNO
GROUP BY student.SNO;
```
![[Pasted image 20250422180807.png|250]]

```mysql
--21 查询每个系的学生人数和每个系的平均分
SELECT student.DEPARTMENT,COUNT(*),AVG(score.DEGREE)
FROM student
LEFT JOIN score ON student.SNO=score.SNO
GROUP BY student.DEPARTMENT
/*229系的学生都不在score里面*/
```
![[Pasted image 20250422180838.png|400]]


```mysql
--22 查询所有未选修 DB_Design 课程或者 Data_Mining 课程的学⽣的学⽣姓名
--EXISTS语句只返回True False
SELECT DISTINCT student.NAME
FROM student
JOIN score ON student.SNO=score.SNO
WHERE NOT EXISTS(
    SELECT * FROM score
    JOIN course ON score.CNO=course.CNO
    WHERE score.SNO=course.CNO AND (course.NAME="DB_Design" OR course.NAME="Data_Mining")
);
```
结果为ADN，BL，FWJ，GNJ，HD，HXY，JTY，LH

```mysql
--23 查询各个课程的课程名及选该课的学⽣的平均年龄
SELECT course.NAME,stu_avg_age
FROM course
LEFT JOIN (SELECT score.CNO,AVG(student.AGE) as stu_avg_age
FROM student
RIGHT JOIN score ON student.SNO=score.SNO
GROUP BY score.CNO
)
AS t ON course.CNO=t.CNO
GROUP BY course.CNO;
```
一共有11条记录，其中的Deep_Learning为NULL。
![[Pasted image 20250422181016.png|300]]

```mysql
--24 查询选修了课程名中包含”Computer”课程的学⽣的学号和姓名
SELECT DISTINCT student.SNO,student.NAME
FROM student
JOIN score
WHERE student.SNO=score.SNO
    AND score.CNO IN(
        SELECT CNO FROM course
        WHERE course.NAME LIKE "%Computer%"
    )
/*%是通配符，表示任意字符*/
```
![[Pasted image 20250422181043.png|220]]

```mysql
--25 设课程平均成绩为 x，查询各个课程成绩处于[x-5, x+5]区间的同学的成绩表
SELECT s.SNO, s.CNO, s.DEGREE
FROM score s
JOIN (
    SELECT CNO, AVG(DEGREE) AS avg_degree
    FROM score
    GROUP BY CNO
) AS t ON s.CNO = t.CNO
WHERE s.DEGREE BETWEEN (t.avg_degree - 5) AND (t.avg_degree + 5);
```
![[Pasted image 20250422181110.png|350]]

```mysql
--26 查询每门课程的课程号、课程名以及在这门课程上GRADE为A的学生人数
SELECT c.CNO,c.NAME,num_A
FROM course c
JOIN (
    SELECT score.CNO,COUNT(*) AS num_A
    FROM score
    WHERE score.GRADE="A"
    GROUP BY score.CNO
) AS t ON c.CNO=t.CNO
ORDER BY num_A DESC;
#DESC表示降序排列
```
![[Pasted image 20250422181153.png|350]]

```mysql
--27 查询包含 "_"（下划线）且位 "_" 于后⾯的字符串包含"r"的所有课程的课程名
SELECT NAME
FROM course 
WHERE NAME REGEXP '.*_[^_]*r.*';
/*  .*匹配任意字符
    [^_]*匹配非下划线字符
    r表示正则表达式中的字符r
*/
```
结果为（7个）：Linear_Algebra，Machine_Learning，Natural_Language_Processing，Signal_Control，Computer_Network，Pattern_Recognition，Deep_Learning

```mysql
--28 查询每个老师教的所有课程中最高的平均成绩
SELECT teacher.TNO,CNO,max_avg_grade
FROM teacher
LEFT JOIN(SELECT course.TNO,course.CNO,max_avg_grade
        FROM course
        JOIN(
    SELECT CNO,MAX(avg_grade) AS max_avg_grade
    FROM (
        SELECT CNO,AVG(DEGREE) AS avg_grade
        FROM score
        GROUP BY CNO
    ) AS t1
    GROUP BY CNO
)AS t2 ON course.CNO=t2.CNO
)AS t3 ON teacher.TNO=t3.TNO;
/*使用了三层join
    1.内层查询计算每门课程的平均成绩
    2.中间查询计算每门课程的最大平均成绩
    3.外层查询将教师表和课程表连接起来，获取教师的工号和课程编号以及最大平均成绩
    PS：如果没有第三层，则无法返回那些没有授课的老师的信息
*/
```
（在作业后面的**空值**部分，DB_Design成绩被修改为空值）
![[Pasted image 20250422181313.png|350]]

#### 索引
```mysql
--1
CREATE INDEX NAME_INDEX ON Student(NAME);

--2
CREATE UNIQUE INDEX CNO_INDEX ON Course(CNO);

--3
CREATE INDEX score_idx ON Score(SNO ASC, DEGREE DESC);

--4
SHOW INDEX FROM score;

--5
DROP INDEX CNO_INDEX ON Course;
```
#### 视图
```mysql
--1
CREATE VIEW db_229_student
AS
SELECT SNO,NAME,GENDER,AGE,DEPARTMENT
FROM student
WHERE DEPARTMENT=229
WITH CHECK OPTION;
```

```mysql
--2
UPDATE db_229_student
SET 
    SNO="PB231518080",
    NAME="WYL"
WHERE SNO="PB230000031";
```

```mysql
--3
SELECT SNO,NAME,GENDER
FROM db_229_student
WHERE AGE<21;
```

```mysql
--4
INSERT INTO student
VALUES("SA242290001","QWE","male",22,229);
SELECT * FROM db_229_student;
```
![[Pasted image 20250422200216.png|580]]

```mysql
--5
DROP VIEW db_229_student;
```
#### 触发器
```mysql
--1
CREATE TABLE teacher_salary(
    TNO CHAR(7) NOT NULL PRIMARY KEY,
    SAL FLOAT NOT NULL,
    FOREIGN KEY (TNO) REFERENCES Teacher(TNO)
);
```

```mysql
--2 
--使用NOT IN
CREATE TRIGGER validate_tno_insert
BEFORE INSERT ON teacher_salary
FOR EACH ROW
BEGIN
    IF (NEW.TNO NOT IN (SELECT TNO FROM Teacher)) 
    THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'TNO not in Teacher';
    END IF;
END;

--使用NOT EXISTS
CREATE TRIGGER validate_tno_update
BEFORE UPDATE ON teacher_salary
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM teacher 
        WHERE TNO = NEW.TNO
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '工号不存在于teacher表';
    END IF;
END;
/*NOT IN会返回整个表，而NOT EXISTS+SELECT 1只会进行存在性判断。
后者比前者效率更高*/

--抛出错误用例
INSERT INTO teacher_salary (TNO, SAL)
VALUES ('TA11111', 5000);
```
抛出错误如下：
![[Pasted image 20250422193127.png|500]]

```mysql
--3
/*INSERT触发器中只有NEW
UPDATE触发器中只有OLD和NEW*/
CREATE TRIGGER sal_update
BEFORE UPDATE ON teacher_salary
FOR EACH ROW
BEGIN
    DECLARE teacher_position VARCHAR(50);
    DECLARE original_sal FLOAT;
    SET original_sal = OLD.SAL;
  
    -- 获取职称（仅查询一次）
    SELECT POSITION INTO teacher_position 
    FROM teacher 
    WHERE TNO = NEW.TNO;

    CASE teacher_position
        WHEN 'Instructor' THEN
            IF NEW.SAL < 4000 THEN
                SET NEW.SAL = 4000;
                
            ELSEIF NEW.SAL > 7000 THEN
                SET NEW.SAL = 7000;
            END IF;
        WHEN 'Associate Professor' THEN
            IF NEW.SAL < 7000 THEN
                SET NEW.SAL = 7000;
            ELSEIF NEW.SAL > 10000 THEN
                SET NEW.SAL = 10000;
            END IF;
        WHEN 'Professor' THEN
            IF NEW.SAL < 10000 THEN
                SET NEW.SAL = 10000;
            ELSEIF NEW.SAL > 13000 THEN
                SET NEW.SAL = 13000;
            END IF;
    END CASE;
    IF NEW.SAL != original_sal THEN
        SIGNAL SQLSTATE '01000' -- 使用警告级别的SQLSTATE
        SET MESSAGE_TEXT = '已成功修改';
    END IF;
END;
CREATE TRIGGER sal_insert
BEFORE INSERT ON teacher_salary
FOR EACH ROW
BEGIN
    DECLARE teacher_position VARCHAR(50);
  
    -- 获取职称（仅查询一次）
    SELECT POSITION INTO teacher_position 
    FROM teacher 
    WHERE TNO = NEW.TNO;

    CASE teacher_position
        WHEN 'Instructor' THEN
            IF NEW.SAL < 4000 THEN
                SET NEW.SAL = 4000;
            ELSEIF NEW.SAL > 7000 THEN
                SET NEW.SAL = 7000;
            END IF;
        WHEN 'Associate Professor' THEN
            IF NEW.SAL < 7000 THEN
                SET NEW.SAL = 7000;
            ELSEIF NEW.SAL > 10000 THEN
                SET NEW.SAL = 10000;
            END IF;
        WHEN 'Professor' THEN
            IF NEW.SAL < 10000 THEN
                SET NEW.SAL = 10000;
            ELSEIF NEW.SAL > 13000 THEN
                SET NEW.SAL = 13000;
            END IF;
    END CASE;
        SIGNAL SQLSTATE '01000' -- 使用警告级别的SQLSTATE
        SET MESSAGE_TEXT = '触发修改，已成功调整薪资';
END;
```

```mysql
--insert修改样例
INSERT INTO teacher_salary (TNO, SAL)
VALUES ('TA90021', 8000);
```
更新样例如下
![[Pasted image 20250422193403.png|200]]

```mysql
--update修改样例
UPDATE teacher_salary
SET SAL=3000 WHERE TNO='TA90021';
```
![[Pasted image 20250422193626.png|210]]

```mysql
-- 删除触发器
DROP TRIGGER sal_insert;
DROP TRIGGER sal_update;
DROP TRIGGER validate_tno_insert;
```

#### 空值
```mysql
UPDATE score
JOIN course ON score.CNO=course.CNO
SET score.DEGREE=NULL
WHERE course.NAME="DB_Design";

SELECT s.SNO,s.DEGREE
FROM score s
ORDER BY s.DEGREE ASC;
```
#### 开放题
```mysql
--将所有学生的成绩加10%,91分以上的修改为100
UPDATE score SET DEGREE=DEGREE*1.1 WHERE DEGREE<=91;
UPDATE score SET DEGREE=100 WHERE DEGREE>91;
```

```mysql
--删去自己的信息
DELETE FROM student WHERE SNO="PB231518080";
```