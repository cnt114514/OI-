import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e6+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m;
typedef struct node
{
	int ls,rs;
	int val,pri,siz;
	bool rev;
	node()=default;
	node(int l,int r,int val,int pri,int siz,bool f=0)
	{
		this->ls=l;
		this->rs=r;
		this->val=val;
		this->pri=pri;
		this->siz=siz;
		this->rev=f;
	}
}node;
typedef struct FHQ_Treap
{
	int now;
	int root;
	node tree[maxn];
	FHQ_Treap()
	{
		this->now=0;
		this->root=0;
	}
	void pushup(int p)
	{
		tree[p].siz=tree[tree[p].ls].siz+tree[tree[p].rs].siz+1;
	}
	void pushdown(int p)
	{
		if(tree[p].rev)
		{
			swap(tree[p].ls,tree[p].rs);
			if(tree[p].ls) tree[tree[p].ls].rev^=1;
			if(tree[p].rs) tree[tree[p].rs].rev^=1;
			tree[p].rev=0;
		}
	}
	int extend(int v)
	{
		tree[++now]=node(0,0,v,(int)rand(),1);
		return now;
	}
	void split(int p,int k,int &x,int &y)
	{
		if(!p)
		{
			x=y=0;
			return;
		}
		pushdown(p);
		if(k<=tree[tree[p].ls].siz)
		{
			y=p;
			split(tree[p].ls,k,x,tree[p].ls);
		}
		else
		{
			x=p;
			split(tree[p].rs,k-tree[tree[p].ls].siz-1,tree[p].rs,y);
		}
		pushup(p);
	}
	int _merge(int x,int y)
	{
		if(!x||!y) return x|y;
		if(tree[x].pri<tree[y].pri)
		{
			pushdown(x);
			tree[x].rs=_merge(tree[x].rs,y);
			pushup(x);
			return x;
		}
		else
		{
			pushdown(y);
			tree[y].ls=_merge(x,tree[y].ls);
			pushup(y);
			return y;
		}
	}
	void build(int n)
	{
		for(int i=1;i<=n;++i)
		{
			root=_merge(root,extend(i));
		}
	}
	void _reverse(int l,int r)
	{
		int x,y,z;
		x=y=z=0;
		split(root,l-1,x,y);
		split(y,r-l+1,y,z);
		tree[y].rev^=1;
		root=_merge(_merge(x,y),z);
	}
	void dfs(int p)
	{
		if(!p) return;
		pushdown(p);
		dfs(tree[p].ls);
		printf("%lld ",tree[p].val);
		dfs(tree[p].rs);
	}
}FHQ_Treap;
FHQ_Treap tree;
signed main()
{
	scanf("%lld%lld",&n,&m);
	tree.build(n);
	for(int i=1,l,r;i<=m;++i)
	{
		scanf("%lld%lld",&l,&r);
		tree._reverse(l,r);
	}
	tree.dfs(tree.root);
	return 0;
}`;

const DEFAULT_INPUT = `5 3
1 3
2 4
1 5`;

export const fhqTreapAlgo: AlgoDef =
{
	id: 'fhq-treap',
	name: '文艺平衡树 (FHQ Treap)',
	category: 'tree',
	desc: 'FHQ Treap 通过分裂和合并操作实现区间翻转，无需旋转，代码更简洁。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		const n = firstLine[0];
		const m = firstLine[1];

		steps.push({
			desc: `n=${n}, m=${m}`,
			line: 100,
			vars: { n, m },
		});

		// 模拟 FHQ Treap
		interface Node
		{
			ls: number;
			rs: number;
			val: number;
			pri: number;
			siz: number;
			rev: boolean;
		}

		const tree: Node[] = [{ ls: 0, rs: 0, val: 0, pri: 0, siz: 0, rev: false }];
		let now = 0;
		let root = 0;

		function pushup(p: number)
		{
			tree[p].siz = tree[tree[p].ls].siz + tree[tree[p].rs].siz + 1;
		}

		function pushdown(p: number)
		{
			if (tree[p].rev)
			{
				[tree[p].ls, tree[p].rs] = [tree[p].rs, tree[p].ls];
				if (tree[p].ls) tree[tree[p].ls].rev = !tree[tree[p].ls].rev;
				if (tree[p].rs) tree[tree[p].rs].rev = !tree[tree[p].rs].rev;
				tree[p].rev = false;
			}
		}

		function extend(v: number): number
		{
			++now;
			tree.push({
				ls: 0,
				rs: 0,
				val: v,
				pri: Math.floor(Math.random() * 1000000),
				siz: 1,
				rev: false,
			});
			return now;
		}

		let currentRoots = [root];
		
		function split(p: number, k: number, depth: number = 0): [number, number]
		{
			const indent = '  '.repeat(depth);
			if (!p) 
			{
				steps.push({
					desc: `${indent}split(空, ${k}) -> (0, 0)`,
					line: 56,
					vars: { tree: getTreeData(currentRoots) },
				});
				return [0, 0];
			}
			
			steps.push({
				desc: `${indent}split(节点${p}, ${k})：左子树大小=${tree[tree[p].ls].siz}`,
				line: 62,
				vars: { tree: getTreeData(currentRoots) },
				highlight: [String(p)],
			});
			
			pushdown(p);
			if (k <= tree[tree[p].ls].siz)
			{
				steps.push({
					desc: `${indent}k=${k} <= 左子树大小，往左子树分裂`,
					line: 64,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(p)],
				});
				const [x, y] = split(tree[p].ls, k, depth + 1);
				tree[p].ls = y;
				pushup(p);
				steps.push({
					desc: `${indent}分裂完成，返回 (${x}, ${p})`,
					line: 65,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(p)],
				});
				return [x, p];
			}
			else
			{
				steps.push({
					desc: `${indent}k=${k} > 左子树大小，往右子树分裂`,
					line: 69,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(p)],
				});
				const [x, y] = split(tree[p].rs, k - tree[tree[p].ls].siz - 1, depth + 1);
				tree[p].rs = x;
				pushup(p);
				steps.push({
					desc: `${indent}分裂完成，返回 (${p}, ${y})`,
					line: 70,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(p)],
				});
				return [p, y];
			}
		}

		function merge(x: number, y: number, depth: number = 0): number
		{
			const indent = '  '.repeat(depth);
			if (!x || !y) 
			{
				const result = x | y;
				steps.push({
					desc: `${indent}merge(${x}, ${y}) -> ${result}`,
					line: 76,
					vars: { tree: getTreeData(currentRoots) },
					highlight: result ? [String(result)] : [],
				});
				return result;
			}
			
			steps.push({
				desc: `${indent}merge(节点${x}, 节点${y})：优先级 ${tree[x].pri} vs ${tree[y].pri}`,
				line: 77,
				vars: { tree: getTreeData(currentRoots) },
				highlight: [String(x), String(y)],
			});
			
			if (tree[x].pri < tree[y].pri)
			{
				steps.push({
					desc: `${indent}节点${x}优先级更小，作为根，合并其右子树`,
					line: 79,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(x)],
				});
				pushdown(x);
				tree[x].rs = merge(tree[x].rs, y, depth + 1);
				pushup(x);
				steps.push({
					desc: `${indent}合并完成，返回节点${x}`,
					line: 82,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(x)],
				});
				return x;
			}
			else
			{
				steps.push({
					desc: `${indent}节点${y}优先级更小，作为根，合并其左子树`,
					line: 86,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(y)],
				});
				pushdown(y);
				tree[y].ls = merge(x, tree[y].ls, depth + 1);
				pushup(y);
				steps.push({
					desc: `${indent}合并完成，返回节点${y}`,
					line: 89,
					vars: { tree: getTreeData(currentRoots) },
					highlight: [String(y)],
				});
				return y;
			}
		}

		function getTreeData(roots?: number[])
		{
			const nodes: { id: number; val: number; ls: number; rs: number; rev: boolean }[] = [];
			const visited = new Set<number>();
			
			function dfs(p: number)
			{
				if (!p || visited.has(p)) return;
				visited.add(p);
				nodes.push({ id: p, val: tree[p].val, ls: tree[p].ls, rs: tree[p].rs, rev: tree[p].rev });
				dfs(tree[p].ls);
				dfs(tree[p].rs);
			}
			
			if (roots)
			{
				roots.forEach(r => dfs(r));
			}
			else
			{
				dfs(root);
			}
			
			return { root: roots ? roots[0] : root, nodes, now, allRoots: roots || [root] };
		}

		// 建树 - 逐步插入
		steps.push({
			desc: `开始建树，初始为空树`,
			line: 92,
			vars: { n, m, tree: getTreeData([0]) },
		});

		for (let i = 1; i <= n; ++i)
		{
			const newNode = extend(i);
			
			steps.push({
				desc: `创建节点 ${newNode}，值为 ${i}`,
				line: 94,
				vars: { i, newNode, tree: getTreeData(currentRoots) },
				highlight: [String(newNode)],
			});

			root = merge(root, newNode);
			currentRoots = [root];
			
			steps.push({
				desc: `合并节点 ${newNode} 到树中`,
				line: 96,
				vars: { i, tree: getTreeData(currentRoots) },
				highlight: [String(root)],
			});
		}

		steps.push({
			desc: `建树完成，初始序列 [1, 2, ..., ${n}]`,
			line: 98,
			vars: { n, m, tree: getTreeData(currentRoots) },
		});

		// 处理操作
		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const l = parts[0];
			const r = parts[1];

			steps.push({
				desc: `准备翻转区间 [${l}, ${r}]，第一次分裂：split(root, ${l - 1})`,
				line: 103,
				vars: { l, r, tree: getTreeData(currentRoots) },
			});

			const [x, y] = split(root, l - 1);
			currentRoots = [x, y].filter(r => r !== 0);
			
			steps.push({
				desc: `第一次分裂完成：左树=${x}，右树=${y}`,
				line: 103,
				vars: { l, r, x, y, tree: getTreeData(currentRoots) },
				highlight: currentRoots.map(String),
			});

			steps.push({
				desc: `第二次分裂：split(${y}, ${r - l + 1})`,
				line: 104,
				vars: { l, r, tree: getTreeData(currentRoots) },
			});

			const [y1, z] = split(y, r - l + 1);
			currentRoots = [x, y1, z].filter(r => r !== 0);
			
			steps.push({
				desc: `第二次分裂完成：左树=${x}，中树=${y1}，右树=${z}`,
				line: 104,
				vars: { l, r, x, y1, z, tree: getTreeData(currentRoots) },
				highlight: currentRoots.map(String),
			});

			tree[y1].rev = !tree[y1].rev;
			
			steps.push({
				desc: `给中树 ${y1} 打翻转标记`,
				line: 105,
				vars: { l, r, tree: getTreeData(currentRoots) },
				highlight: [String(y1)],
			});

			steps.push({
				desc: `开始合并：merge(merge(${x}, ${y1}), ${z})`,
				line: 106,
				vars: { l, r, tree: getTreeData(currentRoots) },
			});

			root = merge(merge(x, y1), z);
			currentRoots = [root];
			
			steps.push({
				desc: `翻转区间 [${l}, ${r}] 完成`,
				line: 106,
				vars: { l, r, tree: getTreeData(currentRoots) },
			});
		}

		// 输出结果
		const result: number[] = [];
		function dfs(p: number)
		{
			if (!p) return;
			pushdown(p);
			dfs(tree[p].ls);
			result.push(tree[p].val);
			dfs(tree[p].rs);
		}
		dfs(root);

		steps.push({
			desc: `最终序列: [${result.join(', ')}]`,
			line: 105,
			vars: { result, tree: getTreeData(currentRoots) },
		});

		return steps;
	}
};
