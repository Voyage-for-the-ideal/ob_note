
#### self attention机制
seq2seq机制中：input自己和自己搞（但是无法识别输入顺序，所以需要手动加入输入顺序）



#### model training
Beam search： 比贪心的视野大一些，每一时间步考察分数较高的多个（如果是一个，就退化成贪心）输出
copy mechanism：从input中摘取一些作为回答
Guided Attention：引导机器有序读取input


transformer其中的model训练很容易让人联想到人类成长的路径，或者说，之前我就已经被这样引导了，所以会这么想。