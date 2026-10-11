import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e5+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n;
int ls[maxn],rs[maxn];
int val[maxn],pri[maxn];
int siz[maxn];
int root,now;
void pushup(int p)
{
	siz[p]=siz[ls[p]]+siz[rs[p]]+1;
}
int extend(int v)
{
	++now;
	val[now]=v;
	pri[now]=rand();
	siz[now]=1;
	ls[now]=rs[now]=0;
	return now;
}
void zag(int &p)
{
	int tmp=ls[p];
	ls[p]=rs[tmp];
	rs[tmp]=p;
	pushup(p);
	pushup(tmp);
	p=tmp;
}
void zig(int &p)
{
	int tmp=rs[p];
	rs[p]=ls[tmp];
	ls[tmp]=p;
	pushup(p);
	pushup(tmp);
	p=tmp;
}
void _insert(int &p,int v)
{
	if(!p)
	{
		p=extend(v);
		return;
	}
	if(v<=val[p])
	{
		_insert(ls[p],v);
		if(pri[ls[p]]<pri[p]) zag(p);
	}
	else
	{
		_insert(rs[p],v);
		if(pri[rs[p]]<pri[p]) zig(p);
	}
	pushup(p);
}
void _remove(int &p,int v)
{
	if(!p) return;
	if(v==val[p])
	{
		if(!ls[p]&&!rs[p])
		{
			p=0;
			return;
		}
		if(!ls[p])
		{
			p=rs[p];
			return;
		}
		else if(!rs[p])
		{
			p=ls[p];
			return;
		}
		if(pri[ls[p]]<pri[rs[p]])
		{
			zag(p);
			_remove(rs[p],v);
		}
		else
		{
			zig(p);
			_remove(ls[p],v);
		}
	}
	else if(v<val[p]) _remove(ls[p],v);
	else _remove(rs[p],v);
	pushup(p);
}
int query_rank(int p,int v)
{
	if(!p) return 1;
	if(v<=val[p]) return query_rank(ls[p],v);
	else return siz[ls[p]]+1+query_rank(rs[p],v);
}
int query_kth(int p,int k)
{
	if(!p) return -INF;
	if(k<=siz[ls[p]]) return query_kth(ls[p],k);
	else if(k==siz[ls[p]]+1) return val[p];
	else return query_kth(rs[p],k-siz[ls[p]]-1);
}
int query_pre(int p,int v)
{
	if(!p) return -INF;
	if(val[p]>=v) return query_pre(ls[p],v);
	else return max(val[p],query_pre(rs[p],v));
}
int query_nxt(int p,int v)
{
	if(!p) return INF;
	if(val[p]<=v) return query_nxt(rs[p],v);
	else return min(val[p],query_nxt(ls[p],v));
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1,op,x;i<=n;++i)
	{
		scanf("%lld%lld",&op,&x);
		if(op==1) _insert(root,x);
		else if(op==2) _remove(root,x);
		else if(op==3) printf("%lld\\n",query_rank(root,x));
		else if(op==4) printf("%lld\\n",query_kth(root,x));
		else if(op==5) printf("%lld\\n",query_pre(root,x));
		else if(op==6) printf("%lld\\n",query_nxt(root,x));
	}
	return 0;
}`;

const DEFAULT_INPUT = `10
1 5
1 3
1 7
1 2
1 6
3 5
4 3
5 5
6 5
2 5`;

export const treapAlgo: AlgoDef =
{
	id: 'treap',
	name: '普通平衡树 (Treap)',
	category: 'tree',
	desc: 'Treap 是一种随机化平衡二叉搜索树，通过优先级维护堆性质，支持插入、删除、查排名、查第k大、查前驱后继。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		steps.push({
			desc: `n=${n} 个操作`,
			line: 100,
			vars: { n },
		});

		const ls: number[] = new Array(100005).fill(0);
		const rs: number[] = new Array(100005).fill(0);
		const val: number[] = new Array(100005).fill(0);
		const pri: number[] = new Array(100005).fill(0);
		const siz: number[] = new Array(100005).fill(0);
		let root = 0;
		let now = 0;

		function pushup(p: number)
		{
			siz[p] = siz[ls[p]] + siz[rs[p]] + 1;
		}

		function extend(v: number): number
		{
			++now;
			val[now] = v;
			pri[now] = Math.floor(Math.random() * 1000000);
			siz[now] = 1;
			ls[now] = rs[now] = 0;
			return now;
		}

		function zag(p: { value: number })
		{
			const tmp = ls[p.value];
			ls[p.value] = rs[tmp];
			rs[tmp] = p.value;
			pushup(p.value);
			pushup(tmp);
			p.value = tmp;
		}

		function zig(p: { value: number })
		{
			const tmp = rs[p.value];
			rs[p.value] = ls[tmp];
			ls[tmp] = p.value;
			pushup(p.value);
			pushup(tmp);
			p.value = tmp;
		}

		function getTreeData()
		{
			const nodes: { id: number; val: number; ls: number; rs: number; siz: number }[] = [];
			function dfs(p: number)
			{
				if (!p) return;
				nodes.push({ id: p, val: val[p], ls: ls[p], rs: rs[p], siz: siz[p] });
				dfs(ls[p]);
				dfs(rs[p]);
			}
			dfs(root);
			return { root, nodes, now };
		}

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const op = parts[0];
			const x = parts[1];

			if (op === 1)
			{
				const rootRef = { value: root };
				
				function _insert(p: { value: number }, v: number, depth: number = 0)
				{
					const indent = '  '.repeat(depth);
					
					if (!p.value)
					{
						p.value = extend(v);
						steps.push({
							desc: `${indent}找到空位置，插入节点 ${v}（节点编号 ${p.value}）`,
							line: 42,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p.value)],
						});
						return;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p.value}（值=${val[p.value]}），比较 ${v} ${v <= val[p.value] ? '<=' : '>'} ${val[p.value]}`,
						line: v <= val[p.value] ? 45 : 55,
						vars: { op, x, currentNode: p.value, tree: getTreeData() },
						highlight: [String(p.value)],
					});
					
					if (v <= val[p.value])
					{
						steps.push({
							desc: `${indent}往左子树递归`,
							line: 46,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p.value)],
						});
						const lsRef = { value: ls[p.value] };
						_insert(lsRef, v, depth + 1);
						ls[p.value] = lsRef.value;
						if (pri[ls[p.value]] < pri[p.value])
						{
							steps.push({
								desc: `${indent}左儿子优先级更小，右旋`,
								line: 50,
								vars: { op, x, tree: getTreeData() },
								highlight: [String(p.value), String(ls[p.value])],
							});
							zag(p);
						}
					}
					else
					{
						steps.push({
							desc: `${indent}往右子树递归`,
							line: 56,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p.value)],
						});
						const rsRef = { value: rs[p.value] };
						_insert(rsRef, v, depth + 1);
						rs[p.value] = rsRef.value;
						if (pri[rs[p.value]] < pri[p.value])
						{
							steps.push({
								desc: `${indent}右儿子优先级更小，左旋`,
								line: 60,
								vars: { op, x, tree: getTreeData() },
								highlight: [String(p.value), String(rs[p.value])],
							});
							zig(p);
						}
					}
					pushup(p.value);
				}
				_insert(rootRef, x);
				root = rootRef.value;

				steps.push({
					desc: `插入 ${x} 完成`,
					line: 46,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 2)
			{
				// 删除操作
				steps.push({
					desc: `开始删除节点 ${x}`,
					line: 63,
					vars: { op, x, tree: getTreeData() },
				});
				
				function _remove(parent: number, isLeft: boolean, v: number, depth: number = 0)
				{
					const p = isLeft ? ls[parent] : rs[parent];
					const indent = '  '.repeat(depth);
					
					if (!p)
					{
						steps.push({
							desc: `${indent}节点为空，返回`,
							line: 65,
							vars: { op, x, tree: getTreeData() },
						});
						return;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p}（值=${val[p]}）`,
						line: 66,
						vars: { op, x, tree: getTreeData() },
						highlight: [String(p)],
					});
					
					if (v === val[p])
					{
						steps.push({
							desc: `${indent}找到要删除的节点 ${p}`,
							line: 66,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p)],
						});
						
						if (!ls[p] && !rs[p])
						{
							steps.push({
								desc: `${indent}叶子节点，直接删除`,
								line: 70,
								vars: { op, x, tree: getTreeData() },
							});
							if (isLeft) ls[parent] = 0;
							else rs[parent] = 0;
							return;
						}
						
						if (!ls[p])
						{
							steps.push({
								desc: `${indent}只有右子树，用右子树替代`,
								line: 75,
								vars: { op, x, tree: getTreeData() },
							});
							if (isLeft) ls[parent] = rs[p];
							else rs[parent] = rs[p];
							return;
						}
						
						if (!rs[p])
						{
							steps.push({
								desc: `${indent}只有左子树，用左子树替代`,
								line: 80,
								vars: { op, x, tree: getTreeData() },
							});
							if (isLeft) ls[parent] = ls[p];
							else rs[parent] = ls[p];
							return;
						}
						
						if (pri[ls[p]] < pri[rs[p]])
						{
							steps.push({
								desc: `${indent}左儿子优先级更小，右旋`,
								line: 85,
								vars: { op, x, tree: getTreeData() },
								highlight: [String(p), String(ls[p])],
							});
							const pRef = { value: p };
							zag(pRef);
							if (isLeft) ls[parent] = pRef.value;
							else rs[parent] = pRef.value;
							_remove(pRef.value, false, v, depth + 1);
						}
						else
						{
							steps.push({
								desc: `${indent}右儿子优先级更小，左旋`,
								line: 90,
								vars: { op, x, tree: getTreeData() },
								highlight: [String(p), String(rs[p])],
							});
							const pRef = { value: p };
							zig(pRef);
							if (isLeft) ls[parent] = pRef.value;
							else rs[parent] = pRef.value;
							_remove(pRef.value, true, v, depth + 1);
						}
					}
					else if (v < val[p])
					{
						steps.push({
							desc: `${indent}${v} < ${val[p]}，往左子树递归`,
							line: 94,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p)],
						});
						_remove(p, true, v, depth + 1);
					}
					else
					{
						steps.push({
							desc: `${indent}${v} > ${val[p]}，往右子树递归`,
							line: 95,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p)],
						});
						_remove(p, false, v, depth + 1);
					}
					
					if (p) pushup(p);
				}
				
				// 创建虚拟根节点来简化删除逻辑
				const virtualRoot = now + 1;
				ls[virtualRoot] = root;
				rs[virtualRoot] = 0;
				val[virtualRoot] = Infinity;
				pri[virtualRoot] = -Infinity;
				siz[virtualRoot] = siz[root] + 1;
				
				_remove(virtualRoot, true, x);
				root = ls[virtualRoot];
				
				steps.push({
					desc: `删除 ${x} 完成`,
					line: 96,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 3)
			{
				// 查询排名
				function query_rank(p: number, v: number, depth: number = 0): number
				{
					const indent = '  '.repeat(depth);
					
					if (!p)
					{
						steps.push({
							desc: `${indent}节点为空，返回排名 1`,
							line: 100,
							vars: { op, x, tree: getTreeData() },
						});
						return 1;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p}（值=${val[p]}，左子树大小=${siz[ls[p]]}）`,
						line: 101,
						vars: { op, x, tree: getTreeData() },
						highlight: [String(p)],
					});
					
					if (v <= val[p])
					{
						steps.push({
							desc: `${indent}${v} <= ${val[p]}，往左子树查询`,
							line: 101,
							vars: { op, x, tree: getTreeData() },
						});
						return query_rank(ls[p], v, depth + 1);
					}
					else
					{
						const rank = siz[ls[p]] + 1 + query_rank(rs[p], v, depth + 1);
						steps.push({
							desc: `${indent}${v} > ${val[p]}，排名 = ${siz[ls[p]]} + 1 + 右子树排名 = ${rank}`,
							line: 102,
							vars: { op, x, tree: getTreeData() },
						});
						return rank;
					}
				}
				
				const rank = query_rank(root, x);
				steps.push({
					desc: `${x} 的排名为 ${rank}`,
					line: 131,
					vars: { op, x, rank, tree: getTreeData() },
				});
			}
			else if (op === 4)
			{
				// 查询第k大
				function query_kth(p: number, k: number, depth: number = 0): number
				{
					const indent = '  '.repeat(depth);
					
					if (!p)
					{
						steps.push({
							desc: `${indent}节点为空，返回 -INF`,
							line: 106,
							vars: { op, x, tree: getTreeData() },
						});
						return -Infinity;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p}（值=${val[p]}，左子树大小=${siz[ls[p]]}，k=${k}）`,
						line: 107,
						vars: { op, x, tree: getTreeData() },
						highlight: [String(p)],
					});
					
					if (k <= siz[ls[p]])
					{
						steps.push({
							desc: `${indent}k=${k} <= 左子树大小 ${siz[ls[p]]}，往左子树查询`,
							line: 107,
							vars: { op, x, tree: getTreeData() },
						});
						return query_kth(ls[p], k, depth + 1);
					}
					else if (k === siz[ls[p]] + 1)
					{
						steps.push({
							desc: `${indent}k=${k} == 左子树大小 + 1，找到目标节点 ${p}（值=${val[p]}）`,
							line: 108,
							vars: { op, x, tree: getTreeData() },
							highlight: [String(p)],
						});
						return val[p];
					}
					else
					{
						const newK = k - siz[ls[p]] - 1;
						steps.push({
							desc: `${indent}k=${k} > 左子树大小 + 1，往右子树查询，新 k=${newK}`,
							line: 109,
							vars: { op, x, tree: getTreeData() },
						});
						return query_kth(rs[p], newK, depth + 1);
					}
				}
				
				const result = query_kth(root, x);
				steps.push({
					desc: `排名第 ${x} 的数为 ${result}`,
					line: 132,
					vars: { op, x, result, tree: getTreeData() },
				});
			}
			else if (op === 5)
			{
				// 查询前驱
				function query_pre(p: number, v: number, depth: number = 0): number
				{
					const indent = '  '.repeat(depth);
					
					if (!p)
					{
						steps.push({
							desc: `${indent}节点为空，返回 -INF`,
							line: 113,
							vars: { op, x, tree: getTreeData() },
						});
						return -Infinity;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p}（值=${val[p]}）`,
						line: 114,
						vars: { op, x, tree: getTreeData() },
						highlight: [String(p)],
					});
					
					if (val[p] >= v)
					{
						steps.push({
							desc: `${indent}${val[p]} >= ${v}，往左子树查询`,
							line: 114,
							vars: { op, x, tree: getTreeData() },
						});
						return query_pre(ls[p], v, depth + 1);
					}
					else
					{
						const result = Math.max(val[p], query_pre(rs[p], v, depth + 1));
						steps.push({
							desc: `${indent}${val[p]} < ${v}，前驱 = max(${val[p]}, 右子树前驱) = ${result}`,
							line: 115,
							vars: { op, x, tree: getTreeData() },
						});
						return result;
					}
				}
				
				const result = query_pre(root, x);
				steps.push({
					desc: `${x} 的前驱为 ${result}`,
					line: 133,
					vars: { op, x, result, tree: getTreeData() },
				});
			}
			else if (op === 6)
			{
				// 查询后继
				function query_nxt(p: number, v: number, depth: number = 0): number
				{
					const indent = '  '.repeat(depth);
					
					if (!p)
					{
						steps.push({
							desc: `${indent}节点为空，返回 INF`,
							line: 119,
							vars: { op, x, tree: getTreeData() },
						});
						return Infinity;
					}
					
					steps.push({
						desc: `${indent}访问节点 ${p}（值=${val[p]}）`,
						line: 120,
						vars: { op, x, tree: getTreeData() },
						highlight: [String(p)],
					});
					
					if (val[p] <= v)
					{
						steps.push({
							desc: `${indent}${val[p]} <= ${v}，往右子树查询`,
							line: 120,
							vars: { op, x, tree: getTreeData() },
						});
						return query_nxt(rs[p], v, depth + 1);
					}
					else
					{
						const result = Math.min(val[p], query_nxt(ls[p], v, depth + 1));
						steps.push({
							desc: `${indent}${val[p]} > ${v}，后继 = min(${val[p]}, 左子树后继) = ${result}`,
							line: 121,
							vars: { op, x, tree: getTreeData() },
						});
						return result;
					}
				}
				
				const result = query_nxt(root, x);
				steps.push({
					desc: `${x} 的后继为 ${result}`,
					line: 134,
					vars: { op, x, result, tree: getTreeData() },
				});
			}
		}

		return steps;
	}
};
