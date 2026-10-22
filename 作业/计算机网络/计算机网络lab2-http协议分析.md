PB23151808 王玉麟
#### T1
如图所示，我的浏览器和服务器使用的浏览器都使用了HTTP 1.1
![[Pasted image 20251015224227.png]]
#### T2
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6\r\n
如图所示，优先接受简体中文，其次是英语，然后是英式英语，最后是美式英语。
![[屏幕截图 2025-10-15 224656.png]]
#### T3
由第一问截图可知，服务器ip地址为128.119.245.12 ；浏览器ip地址为202.141.185.223
#### T4
由第一问截图可知，返回的状态码为200OK
#### T5
Last-Modified: Wed, 15 Oct 2025 05:59:01 GMT\r\n
如图所示，最后修改时间为格林威治标准时间2025.10.15当天05:59:01 
![[屏幕截图 2025-10-15 230132.png]]
#### T6
返回的字节长度为128字节
![[Pasted image 20251015230538.png]]
#### T7
在内容窗口中有很多列表窗口中没显示的头部信息，如具体的发送时间，文本长度，优先接受语言等，如下图所示。

![[Pasted image 20251015235711.png]]

![[Pasted image 20251015235651.png]]
#### T8
如图所示，第一次GET请求中没有包含`IF-MODIFIED-SINCE`头部
![[Pasted image 20251016120408.png]]

#### T9
如图所示，服务器明确返回了文件内容。
判断方法：查看Hypertext Transfer Protocol中是否有`Line-based text data`
![[Pasted image 20251016120228.png]]
#### T10
第二次GET请求中包含`IF-MODIFIED-SINCE`，其值为Wed, 15 Oct 2025 05:59:01 GMT\r\n
![[Pasted image 20251016124224.png]]
#### T11
响应状态码为304 ，短语为NOT Modified。并未返回文件内容
![[Pasted image 20251016124437.png]]

![[Pasted image 20251016124502.png]]
#### T12
发送了一个HTTP GET请求，No.458为对应请求。
![[屏幕截图 2025-10-16 124957.png]]
#### T13+T14
No.498包含了响应的状态码和短语，为200 OK
#### T15
返回的HTTP响应被分成了3个TCP段
![[Pasted image 20251016131822.png]]
#### T16
发送了三个GET请求，分别发送到以下三个IP地址：
128.119.245.12 ; 128.119.245.12 ; 2.56.99.24
![[Pasted image 20251016133517.png]]
#### T17
两个图片的GET请求的TCP的stream index不一样，说明使用了不同的TCP流发送，并且由T16图可知第二个GET请求明显晚于第一个GET请求。故浏览器串行下载两张图片。
![[Pasted image 20251016134149.png]]
#### T18
第一次响应的状态码和短语为401 Unauthorized
![[Pasted image 20251016134653.png]]
#### T19
新增了Authorization:Basic字段
![[Pasted image 20251016140154.png]]