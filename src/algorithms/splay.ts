import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
#define int long long
using namespace std;
constexpr int maxn=1e5+10;
int n,m,l,r;
typedef struct SplayTree
{
	int rt,idx;
	int fa[maxn],ch[maxn][2],cnt[maxn],lz[maxn],siz[maxn],val[maxn];
	bool cid(int x)
	{
		return x==ch[fa[x]][1];
	}
	void pushup(int x)
	{
		siz[x]=siz[ch[x][0]]+siz[ch[x][1]]+cnt[x];
	}
	void rotate_(int x)
	{
		int y=fa[x],z=fa[y];
		int id=cid(x);
		ch[y][id]=ch[x][!id];
		ch[x][!id]=y;
		if(z)
		{
			ch[z][cid(y)]=x;
		}
		if(ch[y][id])
		{
			fa[ch[y][id]]=y;
		}
		fa[y]=x,fa[x]=z;
		pushup(y),pushup(x);
	}
	void splay(int &z,int x)
	{
		int y=fa[x],f=fa[z];
		while(y!=f)
		{
			if(fa[y]!=f)
			{
				rotate_(cid(x)==cid(y)?y:x);
			}
			rotate_(x);
			y=fa[x];
		}
		z=x;
	}
	void build(int n)
	{
		for(int i=0;i<=n+1;++i)
		{
			++idx;
			ch[idx][0]=rt;
			if(rt)
			{
				fa[rt]=idx;
			}
			rt=idx;
			val[idx]=i;
			++cnt[idx];
		}
		splay(rt,1);
	}
	void lzrev(int x)
	{
		swap(ch[x][0],ch[x][1]);
		lz[x]^=1;
	}
	void pushdown(int x)
	{
		if(lz[x])
		{
			if(ch[x][0])
			{
				lzrev(ch[x][0]);
			}
			if(ch[x][1])
			{
				lzrev(ch[x][1]);
			}
			lz[x]=0;
		}
	}
	void find_kth(int &rt,int k)
	{
		if(k<0)
		{
			k+=siz[rt]+1;
		}
		if(k<0||k>siz[rt])
		{
			return ;
		}
		int x=rt;
		while(1)
		{
			pushdown(x);
			if(siz[ch[x][0]]>=k)
			{
				x=ch[x][0];
			}
			else if(siz[ch[x][0]]+cnt[x]>=k)
			{
				break;
			}
			else
			{
				k-=siz[ch[x][0]]+cnt[x];
				x=ch[x][1];
			}
		}
		splay(rt,x);
	}
	void rev(int l,int r)
	{
		find_kth(rt,l);
		find_kth(ch[rt][1],r+2-l);
		int x=ch[ch[rt][1]][0];
		lzrev(x);
		pushdown(x);
		splay(rt,x);
	}
	void prt(int x)
	{
		if(!x)
		{
			return ;
		}
		pushdown(x);
		prt(ch[x][0]);
		printf("%lld ",val[x]);
		prt(ch[x][1]);
	}
	void print()
	{
		find_kth(rt,1);
		find_kth(ch[rt][1],-1);
		prt(ch[ch[rt][1]][0]);
		printf("\\n");
	}
}SplayTree;
SplayTree splay;
signed main()
{
	scanf("%lld%lld",&n,&m);
	splay.build(n);
	while(m--)
	{
		scanf("%lld%lld",&l,&r);
		splay.rev(l,r);
	}
	splay.print();
	return 0;
}`;

const DEFAULT_INPUT = `5 3
1 3
1 5
2 4`;

	export const splayAlgo: AlgoDef =
	{
		id: 'splay',
		name: 'Splay 文艺平衡树',
		category: 'tree',
		desc: '文艺平衡树使用 Splay 实现区间翻转操作，通过旋转和懒标记维护序列。',
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

			// 模拟 Splay 树
			interface SplayNode
			{
				fa: number;
				ch: [number, number];
				val: number;
				siz: number;
				cnt: number;
				lz: boolean;
			}

			const nodes: SplayNode[] = [{ fa: 0, ch: [0, 0], val: 0, siz: 0, cnt: 0, lz: false }];
			let rt = 0;
			let idx = 0;

			function cid(x: number): number
			{
				return nodes[nodes[x].fa].ch[1] === x ? 1 : 0;
			}

			function pushup(x: number)
			{
				nodes[x].siz = nodes[nodes[x].ch[0]].siz + nodes[nodes[x].ch[1]].siz + nodes[x].cnt;
			}

			function rotate_(x: number)
			{
				const y = nodes[x].fa;
				const z = nodes[y].fa;
				const id = cid(x);
				nodes[y].ch[id] = nodes[x].ch[id ^ 1];
				nodes[x].ch[id ^ 1] = y;
				if (z) nodes[z].ch[cid(y)] = x;
				if (nodes[y].ch[id]) nodes[nodes[y].ch[id]].fa = y;
				nodes[y].fa = x;
				nodes[x].fa = z;
				pushup(y);
				pushup(x);
			}

			function splay(z: number, x: number)
			{
				let y = nodes[x].fa;
				const f = nodes[z].fa;
				while (y !== f)
				{
					if (nodes[y].fa !== f)
					{
						rotate_(cid(x) === cid(y) ? y : x);
					}
					rotate_(x);
					y = nodes[x].fa;
				}
				return x;
			}

			function extend(v: number): number
			{
				++idx;
				nodes.push({
					fa: 0,
					ch: [0, 0],
					val: v,
					siz: 1,
					cnt: 1,
					lz: false,
				});
				return idx;
			}

			function build(n: number)
			{
				for (let i = 0; i <= n + 1; ++i)
				{
					const newNode = extend(i);
					nodes[newNode].ch[0] = rt;
					if (rt) nodes[rt].fa = newNode;
					rt = newNode;
				}
				rt = splay(rt, 1);
			}

			function lzrev(x: number)
			{
				[nodes[x].ch[0], nodes[x].ch[1]] = [nodes[x].ch[1], nodes[x].ch[0]];
				nodes[x].lz = !nodes[x].lz;
			}

			function pushdown(x: number)
			{
				if (nodes[x].lz)
				{
					if (nodes[x].ch[0]) lzrev(nodes[x].ch[0]);
					if (nodes[x].ch[1]) lzrev(nodes[x].ch[1]);
					nodes[x].lz = false;
				}
			}

			function find_kth(k: number): number
			{
				if (k < 0) k += nodes[rt].siz + 1;
				let x = rt;
				while (true)
				{
					pushdown(x);
					if (nodes[nodes[x].ch[0]].siz >= k)
					{
						x = nodes[x].ch[0];
					}
					else if (nodes[nodes[x].ch[0]].siz + nodes[x].cnt >= k)
					{
						break;
					}
					else
					{
						k -= nodes[nodes[x].ch[0]].siz + nodes[x].cnt;
						x = nodes[x].ch[1];
					}
				}
				rt = splay(rt, x);
				return x;
			}

			function getTreeData()
			{
				const treeNodes: { id: number; val: number; ls: number; rs: number; rev: boolean; siz: number }[] = [];
				function dfs(p: number)
				{
					if (!p) return;
					treeNodes.push({
						id: p,
						val: nodes[p].val,
						ls: nodes[p].ch[0],
						rs: nodes[p].ch[1],
						rev: nodes[p].lz,
						siz: nodes[p].siz,
					});
					dfs(nodes[p].ch[0]);
					dfs(nodes[p].ch[1]);
				}
				dfs(rt);
				return { root: rt, nodes: treeNodes, now: idx };
			}

			build(n);

			steps.push({
				desc: `n=${n}, m=${m}，建树完成，初始序列 [1, 2, 3, ..., ${n}]`,
				line: 148,
				vars: { n, m, tree: getTreeData(), seq: Array.from({ length: n }, (_, i) => i + 1) },
			});

			for (let i = 1; i <= m && i < lines.length; ++i)
			{
				const parts = lines[i].split(/\s+/).map(Number);
				const l = parts[0];
				const r = parts[1];

				steps.push({
					desc: `翻转区间 [${l}, ${r}]：查找第 ${l} 个节点`,
					line: 150,
					vars: { l, r, tree: getTreeData() },
					highlight: [String(find_kth(l))],
				});

				steps.push({
					desc: `查找第 ${r + 2 - l} 个节点`,
					line: 151,
					vars: { l, r, tree: getTreeData() },
					highlight: [String(find_kth(r + 2 - l))],
				});

				const x = nodes[nodes[rt].ch[1]].ch[0];
				lzrev(x);
				pushdown(x);
				rt = splay(rt, x);

				steps.push({
					desc: `翻转节点 ${x}，打懒标记`,
					line: 152,
					vars: { l, r, tree: getTreeData() },
					highlight: [String(x)],
				});
			}

			// 输出结果
			const result: number[] = [];
			function dfs(p: number)
			{
				if (!p) return;
				pushdown(p);
				dfs(nodes[p].ch[0]);
				if (nodes[p].val !== 0 && nodes[p].val !== n + 1)
				{
					result.push(nodes[p].val);
				}
				dfs(nodes[p].ch[1]);
			}
			dfs(rt);

			steps.push({
				desc: `最终序列：[${result.join(', ')}]`,
				line: 155,
				vars: { result, tree: getTreeData(), seq: result },
			});

			return steps;
		}
	};