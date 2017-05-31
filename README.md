# DropPlugin
drop item or prize gift in an mobile game,base on pomelo

掉落组
根据权重,掉落物品和数量.

掉落组集
先掉落掉落组ID, 再根据掉落组ID, 掉落物品, 各掉落组的物品产出放入同一数组.

支持掉落情形
m,n为正整数
m里掉落n个,根据权重随机掉落n次,结果可重复.
m里掉落n个, m > n, 结果不可重复.单次掉落后重新计算权重.
m里全部掉落
