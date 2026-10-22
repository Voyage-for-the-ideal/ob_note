PB23151808 王玉麟

### T1
如图，主机ip地址为202.141.188.165
![[Pasted image 20251124215430.png]]

### T2
上层协议字段值为01，表示为ICMP协议
![[Pasted image 20251124215653.png]]

### T3
首部20字节，数据部分36字节，后者由**总字节-首部字节**得到。
![[Pasted image 20251124215722.png]]

### T4
未被分片，因为Fragment Offset为0
![[Pasted image 20251124215952.png]]

### T5
Identification，Header checksum，Time to Live这些项必须改变。前两者唯一标识了这条报文，TTL项在寻找路由阶段一直在增加。
![[Pasted image 20251124221335.png]]

### T6
**保持不变**：版本、首部长度、服务类型、数据包长度、 标志、片偏移、上层协议、源IP地址、目的IP地址


**一定不变**：只要是基于IPv4的ICMP报文，版本、服务类型、上层协议、源IP地址和目的IP地址

**一定会变**：Identification，checksum

### T7
Identification每发送一条即增加一次
![[Pasted image 20251124221941.png]]
![[Pasted image 20251124221953.png]]
![[Pasted image 20251124222008.png]]

### T8
一共七条报文，Identification和TTL分别为:
15447,1  15727,1  15797,1  15867,1  16053,1  16088,1  16193,1  
![[Pasted image 20251124222449.png]]

### T9
前者改变，因为不是同一条报文；后者不变，因为都是第一跳的路由器

### T10
363是第一个被发送的分片，被分为了363，364，365三个切片（因wireshark折叠分片所以未显示）
![[Pasted image 20251124224440.png]]

### T11
如图，Flags表明数据已被分片，可以根据后续的偏移量判断其为第一个数据报片段。长度为1500字节
![[Pasted image 20251124225140.png]]

### T12
如图，由偏移量=1480可知其不是第一个分片，由Flags判断后续还有分片。
![[Pasted image 20251124225433.png]]

### T13
Fragment Offset,Header checksum值的字段变化了

### T14
由No=365的报文可以看出，一共三个片段
![[Pasted image 20251124225659.png]]

### T15
Total Length、Flags、Header checksum发生了辩护