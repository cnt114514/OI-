import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e5+10;
int a[maxn],x,y,z;
int n,m,r,mod;
vector<int> gra[maxn];
int fa[maxn],son[maxn];
int dep[maxn],siz[maxn];
int top[maxn];
int idx;
int dfn[maxn],rnk[maxn];
int sum[maxn<<2],add[maxn<<2];
void pushup(int p){sum[p]=(sum[p<<1]+sum[p<<1|1])%mod;}
void build(int p,int l,int r,int *a)
{
	if(l==r){sum[p]=a[rnk[l]]%mod;return;}
	int mid=(l+r)>>1;
	build(p<<1,l,mid,a);
	build(p<<1|1,mid+1,r,a);
	pushup(p);
}
void updatelazy(int p,int l,int r,int k)
{
	sum[p]+=k*(r-l+1);sum[p]%=mod;
	add[p]+=k;add[p]%=mod;
}
void pushdown(int p,int l,int r)
{
	if(add[p])
	{
		int mid=(l+r)>>1;
		updatelazy(p<<1,l,mid,add[p]);
		updatelazy(p<<1|1,mid+1,r,add[p]);
		add[p]=0;
	}
}
void update(int p,int l,int r,int x,int y,int k)
{
	if(x<=l&&r<=y){updatelazy(p,l,r,k);return;}
	pushdown(p,l,r);
	int mid=(l+r)>>1;
	if(x<=mid) update(p<<1,l,mid,x,y,k);
	if(y>mid) update(p<<1|1,mid+1,r,x,y,k);
	pushup(p);
}
int query(int p,int l,int r,int x,int y)
{
	if(x<=l&&r<=y) return sum[p]%mod;
	pushdown(p,l,r);
	int mid=(l+r)>>1,res=0;
	if(x<=mid) res+=query(p<<1,l,mid,x,y);
	if(y>mid) res+=query(p<<1|1,mid+1,r,x,y);
	return res%mod;
}
void dfs1(int u,int p)
{
	fa[u]=p;siz[u]=1;dep[u]=dep[p]+1;
	for(int v:gra[u])
	{
		if(v==p) continue;
		dfs1(v,u);
		siz[u]+=siz[v];
		if(siz[son[u]]<siz[v]) son[u]=v;
	}
}
void dfs2(int u,int h)
{
	top[u]=h;dfn[u]=++idx;rnk[idx]=u;
	if(son[u]) dfs2(son[u],h);
	for(int v:gra[u])
	{
		if(v!=fa[u]&&v!=son[u]) dfs2(v,v);
	}
}
signed main()
{
	scanf("%lld%lld%lld%lld",&n,&m,&r,&mod);
	for(int i=1;i<=n;++i) scanf("%lld",a+i);
	for(int i=1,x,y;i<n;++i)
	{
		scanf("%lld%lld",&x,&y);
		gra[x].emplace_back(y);
		gra[y].emplace_back(x);
	}
	dfs1(r,0);
	dfs2(r,r);
	build(1,1,n,a);
	while(m--)
	{
		int op;
		scanf("%lld",&op);
		if(op==1)
		{
			scanf("%lld%lld%lld",&x,&y,&z);
			z%=mod;
			while(top[x]!=top[y])
			{
				if(dep[top[x]]<dep[top[y]]) swap(x,y);
				update(1,1,n,dfn[top[x]],dfn[x],z);
				x=fa[top[x]];
			}
			if(dep[x]>dep[y]) swap(x,y);
			update(1,1,n,dfn[x],dfn[y],z);
		}
		else if(op==2)
		{
			scanf("%lld%lld",&x,&y);
			int res=0;
			while(top[x]!=top[y])
			{
				if(dep[top[x]]<dep[top[y]]) swap(x,y);
				res+=query(1,1,n,dfn[top[x]],dfn[x]);
				res%=mod;
				x=fa[top[x]];
			}
			if(dep[x]>dep[y]) swap(x,y);
			res+=query(1,1,n,dfn[x],dfn[y]);
			printf("%lld\\n",res%mod);
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 5 1 100
1 2 3 4 5
1 2
1 3
2 4
3 5
1 4 5 2
2 4 5
1 2 3 1
2 1 3
2 3 5`;

export const treeChainAlgo: AlgoDef =
{
	id: 'treechain',
	name: '树链剖分',
	category: 'tree',
	desc: '树链剖分将树分解为若干条链，结合线段树实现树上路径修改和查询。',
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
		const r = firstLine[2];
		const mod = firstLine[3];

		steps.push({
			desc: `n=${n}, m=${m}, 根=${r}, 模数=${mod}`,
			line: 63,
			vars: { n, m, r, mod },
		});

		const a: number[] = [0];
		const arr = lines[1].split(/\s+/).map(Number);
		for (let i = 0; i < arr.length && i < n; ++i)
		{
			a.push(arr[i]);
		}

		steps.push({
			desc: `节点权值：[${a.slice(1).join(', ')}]`,
			line: 64,
			vars: { a: [...a] },
		});

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);
		for (let i = 2; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
		}

		steps.push({
			desc: `读入 ${n - 1} 条边，构建树`,
			line: 68,
			vars: { n },
		});

		const fa: number[] = new Array(n + 1).fill(0);
		const son: number[] = new Array(n + 1).fill(0);
		const dep: number[] = new Array(n + 1).fill(0);
		const siz: number[] = new Array(n + 1).fill(1);

		function dfs1(u: number, p: number)
		{
			fa[u] = p;
			dep[u] = dep[p] + 1;
			for (const v of gra[u])
			{
				if (v === p) continue;
				dfs1(v, u);
				siz[u] += siz[v];
				if (siz[son[u]] < siz[v]) son[u] = v;
			}
		}

		dfs1(r, 0);
		steps.push({
			desc: `DFS1 完成：计算 fa, dep, siz, son`,
			line: 49,
			vars: { fa: [...fa], dep: [...dep], siz: [...siz], son: [...son] },
		});

		const top: number[] = new Array(n + 1).fill(0);
		const dfn: number[] = new Array(n + 1).fill(0);
		const rnk: number[] = new Array(n + 1).fill(0);
		let idx = 0;

		function dfs2(u: number, h: number)
		{
			top[u] = h;
			dfn[u] = ++idx;
			rnk[idx] = u;
			if (son[u]) dfs2(son[u], h);
			for (const v of gra[u])
			{
				if (v !== fa[u] && v !== son[u]) dfs2(v, v);
			}
		}

		dfs2(r, r);
		steps.push({
			desc: `DFS2 完成：计算 top, dfn, rnk`,
			line: 57,
			vars: { top: [...top], dfn: [...dfn], rnk: [...rnk] },
		});

		steps.push({
			desc: `树链剖分完成，结合线段树处理 ${m} 个操作`,
			line: 73,
			vars: { n, m },
		});

		return steps;
	}
};
