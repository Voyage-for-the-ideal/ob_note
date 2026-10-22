#include<stdio.h>
#include<stdlib.h>
struct person{
    int num;
    float salary;
    struct person *next;
};
struct person *CreateList(void);
void PrintList(struct person *head);
struct person *ListDelete(struct person *head,int num);
struct person *ListInsert(struct person *head,struct person *ps);
void ListSearch(struct person *head,int num);
int main()
{
    int sn,num;
    struct person *head,ps;
    while(1)
    {
        printf("\t职工信息管理系统\n");
        printf("==============================\n");
        printf("\t1.职工信息链表建立\n");
        printf("\t2.职工链表节点的插入\n");
        printf("\t3.职工链表节点的删除\n");
        printf("\t4.职工链表节点的查询\n");
        printf("\t5.职工链表节点的输出\n");
        printf("\t0.退出\n");
        printf("==============================\n");
        printf("请选择菜单功能（0~5）:");
        while(1){
            scanf("%d",&sn);
            if(sn<0||sn>5)  printf("\n输入错误，请重新输入（0~5）:");
            else    break;
        }
        switch(sn){
            case 1:
                printf("职工信息链表建立\n");
                head=CreateList();
                break;
            case 2:
            	printf("插入职工信息节点\n");
                printf("输入要插入的职工的工号:");
                scanf("%d",&ps.num);
                printf("输入要插入的职工的工资:");
                scanf("%f",&ps.salary);
                head=ListInsert(head,&ps);
                break;
            case 3:
                printf("职工节点的删除\n");
                printf("输入要删除的职工的工号:");
                scanf("%d",&num);
                head=ListDelete(head,num);
                break;
            case 4:
                printf("职工节点的查询\n");
                printf("输入要查找的职工的工号:");
                scanf("%d",&num);
                ListSearch(head,num);
                break;
            case 5:
                printf("职工信息链表的输出\n");
                PrintList(head);
                break;
            case 0:
                printf("再见！\n");
                exit(0);
        }

    }
    return 0;
}
struct person *CreateList(void)
{
	struct person *head=NULL;
	struct person *rear=NULL;
	struct person *p=NULL;
	int no;
	printf("\n输入一个职工号，输入0结束::");
	scanf("%d",&no);
	while(no!=0)										//读入职工号（不是0时循环）
	{
		p=(struct person *)malloc(sizeof(struct person));	//申请新节点
		if(p==NULL) {printf("error!");exit(0);}
		p->num=no;
		printf("\n输入一个职工工资:");
		scanf("%f",&p->salary);							//输入职工工资
		if(head==NULL)head=p;							//将p指向的新结点插入空表
		else rear->next=p;								//新结点插入到表尾结点之后
		rear=p;											//表尾指针指向新的表尾结点
		printf("\n输入一个职工号，输入0结束:");
		scanf("%d",&no);								//读入下一个职工号
	}
	if(rear!=NULL)
		rear->next=NULL;								//终端节点置空
	printf("\n建表结束！\n");
	return head;										//返回链表的头指针
}
struct person *ListInsert(struct person *head,struct person *ps)
//head为链表头指针，ps指向要插入的结点，由调用函数生成好
{
	struct person *p,*q;
	if(head==NULL) //若为空表，使head直接指向插入结点皆可
	{
		head=ps;
		printf("%d\n",head->num);
		return head;
	}
	if(head->num>ps->num) //结点插入在表头
	{
		ps->next=head;
		head=ps;
		return head;
	}
	p=q=head; //使p，q指向表头结点
	while(p!=NULL&&p->num<ps->num) //查找插入位置
	{
		q=p;
		p=p->next; //使q指向p所指向的结点的前一个结点
	}
	q->next=ps;	//插入新结点
	ps->next=p;
	return head;
}
struct person *ListDelete(struct person *head,int num) //删除职工号为num的结点
{
	struct person *q,*p;
	if(head->num==num)							//要删除的结点为链表首结点
	{
		p=head;
		head=p->next;
		return head;
	}
	q=p=head;
	while(p!=NULL&&p->num!=num)			//查找要删除的结点
	{
		q=p;							//用q指向刚访问过的结点
		p=p->next;						//使p指向下一个结点
	}
	if(p!=NULL)							//查到要删除的结点
	{
		q->next=p->next;				//将p指向结点的下一个结点连接到p->next
		free(p);						//删除p指向的结点
		return head;
	}
	printf("没有该职工!\n");
	return head;
}
void ListSearch(struct person *head,int num)
{
	struct person *p=head;
	while(p!=NULL)
	{
		if(p->num==num)	printf("节点找到：%d %f\n",p->num,p->salary);
		p=p->next;
	}
	printf("节点未找到\n");
}
void PrintList(struct person *head)
{
	struct person *p=head;
	while(p!=NULL)
	{
		printf("%d %f\n",p->num,p->salary);
		p=p->next;
	}
}
