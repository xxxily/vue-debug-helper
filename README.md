# vue debug helper for tampermonkey
Vue组件探测、统计、分析辅助脚本  
项目地址：[https://github.com/xxxily/vue-debug-helper](https://github.com/xxxily/vue-debug-helper)  
脚本安装地址：[https://greasyfork.org/scripts/444075](https://greasyfork.org/scripts/444075)

## 特性
* 支持生产环境下进行组件审查
* 按需打印组件的生命周期信息
* 支持全局组件注册情况观察
* 支持强制阻断组件的创建
* 支持当前激活的组件统计
* 支持对已销毁的组件进行统计
* 支持对对组件存活时间进行统计
* 支持进行组件模糊查找和根据uid精确查找
* 支持查找没有DOM关联的组件
* 支持给指定组件或全部组件注入空白数据
* 支持快速查看了解组件的关系链
* 支持实时打印性能观察(PerformanceObserver)结果
* 自动开启生产环境下的Vue调试模式

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

## TODO
* 元素审查功能
* 区间统计功能
* 组件调用整体关系链输出
* 停用watch和computed
* 实现自定义快捷键
* 操作提示语之操作反馈优化
* 解决开启调试模式后，vue devtools 没正常开启问题
* 支持作为调试脚本，接入到应用
* 组件文件地址信息关联
* vue3支持