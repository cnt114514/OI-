// 全局类型定义

/** 单条模拟步骤 */
export interface SimStep {
  /** 步骤描述文本 */
  desc: string;
  /** 当前高亮执行的代码行号（1-based） */
  line?: number;
  /** 该时刻的变量快照，供可视化组件读取 */
  vars: Record<string, unknown>;
  /** 额外高亮的元素集合（节点 id、边 id、下标等），不同算法含义不同 */
  highlight?: (number | string)[];
}

/** 算法元信息 */
export interface AlgoDef {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 分类：math/graph/tree/string/dp ... */
  category: string;
  /** 算法简介 */
  desc: string;
  /** 参考代码（C++） */
  code: string;
  /** 默认演示输入 */
  defaultInput: string;
  /** 以纯函数方式生成全部模拟步骤 */
  run: (input: string) => SimStep[];
}
