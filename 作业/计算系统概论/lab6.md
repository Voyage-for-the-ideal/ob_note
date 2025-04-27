# 基础信息
#### lab6
#### 姓名：王玉麟
#### 日期：2025.1.7
# Purpose
> 实现文档中的TO DO部分
## Setup program
- Enable keyboard interrupt
- Setup ISR for keyboard
- Setup ISR for trap x77
- Call user program A
## Keyboard ISR
- Get the keycode
- If Q is pressed, halt the machine
## Trap x77 ISR
- Call switch program
# Program  Design
##  Enable keyboard interrupt
```LC3
LD R3,KBSRMask
STI R3,KBSR;将KBSR的14位变成1
KBSR .FILL xFE00
KBSRMask .FILL x4000
```
是否检测键盘中断取决于KBSR[14]，为1则视为启用
## Setup ISR for keyboard and TRAP x77
以keyboard ISR为例：
```LC3
LD R1,KBVecAddr
LD R2,KBISRAddr
STR R2,R1,#0;当键盘有输入，中断发生时程序跳到x1000
KBVecAddr .FILL x0180
KBISRAddr .FILL x1000
```
检测到键盘输入时，程序会跳到中断矢量对应的地址x180处，所以只需要在x180这个位置放对应的ISR程序地址，就可以实现一旦出现键盘输入，即跳转到x1000处的程序。
## Call user program A
```LC3
LD R1,PSR_A
ADD R6,R6,#-1
STR R1,R6,#0
LD R1,PC_A
ADD R6,R6,#-1
STR R0,R6,#0
RTI;程序结束调用
```
需要注意的是，RTI之前的代码都在为调用做准备，真正的调用是在**特权模式**下运行到RTI时，将R6对应的栈弹出两个，当作此时的PSR和PC，同时根据新的PSR转换模式（此处为**用户模式**）。此时，程序下一步将执行栈中弹出的PC。

==为什么不能使用如下程序？==
```LC3
LD R7,PRO_A
JMP R7
PRO_A .FILL x4090
```
因为此时处在**特权模式**下，不可使用JMP；反过来，若处于**用户模式**下，不可使用RTI。
## Keyboard ISR
```LC3
ADD R6,R6,#-1;将R0，R1，R2入栈
STR R0,R6,#0
ADD R6,R6,#-1
STR R1,R6,#0
ADD R6,R6,#-1
STR R2,R6,#0

;Check
;LDI R1,KBSR
;BRzp Check
LDI R0,KBDR;将KBDR的值给R0
LD R2,NEG_Q;将Q的值给R2
ADD R2,R2,R0
BRnp CONTINUE;是Q，则直接停止（顺便输出）；不是Q，则继续执行program
STI R0,DDR;将R0的值输出到屏幕上
HALT

CONTINUE
LDR R2,R6,#0
ADD R6,R6,#1
LDR R1,R6,#0
ADD R6,R6,#1
LDR R0,R6,#0
ADD R6,R6,#1;将R2，R1，R0出栈
RTI

NEG_Q .FILL x-51
DSR .FILL xFE02
DDR .FILL xFE06
KBDR .FILL xFE02
```
启动该程序的条件是检测到键盘存在输入，此时PSR[15]=0,则程序转变为**特权模式**，故需要使用RTI进行返回。
为了不影响主程序中临时寄存器的使用，故将R0，R1，R2入栈出栈。
## Trap x77 ISR
```LC3
LD R7,SwitchProgramAddr
JMP R7;
SwitchProgramAddr .FILL x2000
```
与调用Program A不同的是，switch program中直接使用了JMP指令，这是因为，在成功调用program后，此时由**特权模式**转变为了**用户模式**，故可以直接
# Testing Evidence
![[Pasted image 20250107012158.png]]

# FEELINGS
之前对相关的中断驱动几乎没有概念，所有相关知识都来源课本+题目+实验。上次实验是用`TRAP x21`实现的输入输出，这一次则使用了KBDR和DDR等，算是巩固了知识（在实验之前我还对KBSR[14]的功能不了解）。

在不怎么了解RTI、TRAP使用、STI等操作的情况下完成实验还是很难的qwq，因为不知如何下手。好在网上有前人指路，结合课本附录，还是可以写出来的（对不对就不知道了）

NICE！（化用）