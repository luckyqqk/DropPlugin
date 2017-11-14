# DropPlugin
drop item or prize gift in an mobile game,base on pomelo

### 使用方法
* 本插件基于pomelo,终端进入game-server
```
npm install drop-plugin
```
* 在config下新增文件夹drop,在drop文件夹下新增drop.json
```
{
  "development": "/app/data/json/drop",  // 指向掉落所需要的json文件
  "production": "/app/data/json/drop"    // 指向掉落所需要的json文件
}
```
* 在需要掉落产出的地方,例如:通关奖励,抽卡等功能写下如下代码
```
require('dropPlugin').drop('1001');  // '1001'为json数据文件(非配置文件,下文详细说明)中的掉落组id
```
* 掉落的返回内容如下
```
[ { outId: '2017', outNum: 1 } ]      // json结构,其中'2017',是你物品表中的物品id
```
### json文件
* 本插件中提供了测试用的json文件.
* json文件其实是由倒表工具将excel转成的json数据.
* 如果对[倒表工具](https://github.com/luckyqqk/excel2json.git)感兴趣,我这可提供一个,是于小懒先生写的,我修改了一下.
### excel字段
#### 第一个页签叫drop,是掉落包的设置
|掉落组集id|是否全部掉落0否1是|掉落次数|是否允许重复掉落0否1是|是否为包中包0否1是|
|:-:|:-:|:-:|:-:|:-:|
|id|allDrop|dropNum|repeat|isGroup|
|1001|1|0|1|1|
#### 第二个页签叫drop.out,是掉落的产出数据,可填写空产出以达到你的某些需求
|id|产出id(可以是掉落组id,也可以是你的物品表的id)|产出个数|权重|
|:-:|:-:|:-:|:-:|
|id|outId|outNum|percent|
|1001|1|0|1|1|


### 掉落组
* 根据权重,掉落物品和数量.

### 掉落组集
* 先掉落掉落组ID, 再根据掉落组ID, 掉落物品, 各掉落组的物品产出放入同一数组.

### 支持掉落情形
* m,n为正整数
* m里掉落n个,根据权重随机掉落n次,结果可重复.
* m里掉落n个, m > n, 结果不可重复.单次掉落后重新计算权重.(若m > n请直接使用全部掉落)
* m里全部掉落
