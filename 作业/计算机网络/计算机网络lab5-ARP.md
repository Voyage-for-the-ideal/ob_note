PB23151808 王玉麟

最开始捕获的HTTP GET报文如下图：
![[Pasted image 20251208211736.png]]

### T1
48位以太网地址是Intel_de:59:3b

Source: Intel_de:59:3b (a8:64:f1:de:59:3b)
    .... ..0. .... .... .... .... = LG bit: Globally unique address (factory default)
    .... ...0 .... .... .... .... = IG bit: Individual address (unicast)

![[Pasted image 20251208212303.png]]

### T2
目的地址为VMware_9f:00:7f

Destination: VMware_9f:00:7f (00:50:56:9f:00:7f)
    .... ..0. .... .... .... .... = LG bit: Globally unique address (factory default)
    .... ...0 .... .... .... .... = IG bit: Individual address (unicast)

不是，是路由器的地址

### T3
两字节数据为0x0800，对应上层协议为IPv4。（Type: IPv4 (0x0800)）

### T4
如图所示，第47个字节出现了字母"G"
![[Pasted image 20251208213014.png]]

### T5
以太网源地址为VMware_9f:00:7f
拥有该地址的设备是路由器。

### T6
目的地址为Intel_de:59:3b
拥有该地址的设备是我电脑

### T7
十六进制值为0x0800，对应IPv4协议
![[Pasted image 20251208214803.png]]

### T8
如图，OK中的O出现在4f，为第68个字节
![[Pasted image 20251208215151.png]]

### T9
当前ARP缓存内容如图所示，其中既包括了广播这样的保留地址，也包括了网关对应的MAC地址。
![[Pasted image 20251208215446.png]]

### T10
ARP请求的源地址为00:50:56:9f:00:7f，目的地址为a8:64:f1:de:59:3b
![[Pasted image 20251208221426.png]]

![[Pasted image 20251208221525.png]]

### T11
两字节帧类型值为0x0806，对应上层协议为ARP

### T12
1. ARP操作码字段位于第20，21个字节![[Pasted image 20251208221918.png]]
2. 操作码字段值为1
3. 包括了发送方的IP地址
4. 位于报文的Target MAC address部分![[Pasted image 20251208222218.png]]

5. 操作码字段值为2![[Pasted image 20251208222404.png]]
6. 位于报文的Sender MAC address部分

### T13
ARP回答的源地址为a8:64:f1:de:59:3b，目的地址为00:50:56:9f:00:7f

### T14
ARP请求是广播的，但是ARP回复只发给特定路由器，终端无法接收其他终端的ARP回复。

### EX-1
IP正确但以太网地址填错，则在发送请求时，ARP会发送到错误的以太网地址，故无法到达正确的IP地址，双方无法正确通信

### EX-2
这是询问gemini3得到的结果，从中可知，超时时长为15-45不等，均值为30s
![[Pasted image 20251208223926.png]]