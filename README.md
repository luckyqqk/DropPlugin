# DropPlugin
drop item or prize gift in an mobile game,base on pomelo

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

[npm-image]: https://img.shields.io/npm/v/drop-plugin.svg
[npm-url]: https://npmjs.org/package/drop-plugin
[downloads-image]: https://img.shields.io/npm/dm/drop-plugin.svg
[downloads-url]: https://npmjs.org/package/drop-plugin
[node-version-image]: https://img.shields.io/badge/node-%3E6.0.0-brightgreen.svg
[node-version-url]: https://nodejs.org/en/download/

### 用途分析
* 游戏是让玩家花时间或者金钱换取游戏世界中虚拟的东西,那么给用户东西的需求随处可见,几乎伴随着游戏一生.
* 于是,某做了一个掉落物品的插件,可用于礼包,抽奖,关卡掉落,宝箱开启等相关物品产出的功能的开发.

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
require('drop-plugin').drop('1001');  // '1001'为json数据文件(非配置文件,下文详细说明)中的掉落组id
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
|掉落组集id|是否全部掉落0否1是|掉落次数|是否允许重复掉落0否1是 |是否为包中包0否1是|
|:-------:|:-------------:|:-----:|:-----------------:|:-------------:|
|id       |allDrop        |dropNum|repeat             |isGroup        |
|1001     |1              |0      |1                  |1              |
#### 第二个页签叫drop.out,是掉落的产出数据,可填写空产出以达到你的某些需求
|id   |产出id(可以是掉落组id,也可以是你的物品表的id)|产出个数|权重    |
|:---:|:-------------------------------------:|:-----:|:-----:|
|id   |outId                                  |outNum |percent|
|1001 |1                                      |1      |1      |


### 掉落组
* 根据权重,掉落物品和数量.

### 掉落组集
* 先掉落掉落组ID, 再根据掉落组ID, 掉落物品, 各掉落组的物品产出放入同一数组.
* 注意:组集的产出不能是组集,之所以故意不支持,第一是怕组集产出自己造成死循环,二是二维包已经可以满足所有需求,x维包确实没意义.

### 支持掉落情形
* m,n为正整数
* m里掉落n个,可重复产出.特点:根据权重随机掉落n次.
* m里掉落n个,产出不可重复,则m > n.特点:单次掉落后重新计算权重.
* m里全部掉落

### 版本说明
* 1.1.0之前版本虽能使用,但使用起来没那么方便.
* 1.1.0版本readme说明中有bug,我将尽快更新1.1.1版本.
* 以上版本共有95个下载者,对这些下载者带来的不便和困惑,某表示抱歉,并保证以后发包的准确性.
* 1.1.1版本代码上未做改动,修复了readme中的bug,增加了用途分析.
