# vue debug helper for tampermonkey
Vue组件探测、统计、分析辅助脚本  
项目地址：[https://github.com/xxxily/vue-debug-helper](https://github.com/xxxily/vue-debug-helper)  
脚本安装地址：[https://greasyfork.org/scripts/444075](https://greasyfork.org/scripts/444075)

## 特性
* 支持当前激活的组件统计
* 支持对已销毁的组件进行统计
* 支持对对组件存活时间进行统计
* 支持给指定组件或全部组件注入空白数据
* 支持快速查看了解组件的关系链

## 简介

Vue组件探测、统计、分析辅助脚本，主要用于分析当前应用的组件渲染情况和辅助检查组件的内存泄露情况，如果你是简单的vue应用，使用vue devtools 工具开发即可

## 其他说明
- 1、功能基于Vue.mixin，理论上只要支持全局mixin的vue版本都适用    
- 2、暂未对vue3进行测试，可能存在异常  
- 3、暂不打算对vue1进行兼容

## 快捷键列表
|  快捷键   | 说明    |
| --- | --- |
| shift+alt+a | 全部组件混合统计 |
| shift+alt+l | 当前存活组件统计 |
| shift+alt+d | 已销毁组件统计 |
| shift+alt+c | 清空统计信息 |
| shift+alt+e | 数据注入（dd）或 取消数据注入（undd） |

## 更新日志
* [https://github.com/xxxily/vue-debug-helper/blob/main/changeLog.md](https://github.com/xxxily/vue-debug-helper/blob/main/changeLog.md)

## 给我赞赏
如果我的努力给你带来了便利，请不要吝啬你的赞赏

![如果我的努力给你带来了便利，请不要吝啬你的赞赏](https://cdn.jsdelivr.net/gh/xxxily/h5player@master/donate.png "如果我的努力给你带来了便利，请不要吝啬你的赞赏")
