import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=2e4+10;
constexpr int maxm=2e5+10;
int n,m;
int fa[maxn];
typedef struct edge
{
	int u,v,w;
	edge()=default;
	edge(int a,int b,int c):u(a),v(b),w(c){}
	bool operator <(const edge& x) const
	{
		return this->w<x.w;
	}
};
edge es[maxm];
void init()
{
	for(int i=1;i<=n;++i)
	{
		fa[i]=i;
	}
}
int find_root(int x)
{
	return fa[x]==x?x:fa[x]=find_root(fa[x]);
}
void join(int x,int y)
{
	int xr=find_root(x);
	int yr=find_root(y);
	if(xr!=yr)
	{
		fa[xr]=yr;
	}
}
int cnt,ans;
signed main()
{
	scanf("%lld%lld",&n,&m);
	init();
	for(int i=1,x,y,z;i<=m;++i)
	{
		scanf("%lld%lld%lld",&x,&y,&z);
		es[i]={x,y,z};
	}
	sort(es+1,es+m+1);
	for(int i=1;i<=m;++i)
	{
		edge& e=es[i];
		if(find_root(e.u)!=find_root(e.v))
		{
			join(e.u,e.v);
			ans+=e.w;
			++cnt;
		}
	}
	if(cnt!=n-1)
	{
		printf("orz");
	}
	else
	{
		printf("%lld",ans);
	}
	return 0;
}`;

const DEFAULT_INPUT = `4 5
1 2 2
1 3 3
2 3 1
2 4 4
3 4 5`;

export const kruskalAlgo: AlgoDef =
{
	id: 'kruskal',
	name: 'Kruskal 最小生成树',
	category: 'graph',
	desc: 'Kruskal 算法：按边权排序后依次加入不构成环的边，用并查集维护连通性。',
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

		const fa: number[] = new Array(n + 1);
		const edges: { u: number; v: number; w: number }[] = [];

		function find_root(x: number): number
		{
			return fa[x] === x ? x : (fa[x] = find_root(fa[x]));
		}

		function join(x: number, y: number)
		{
			const xr = find_root(x);
			const yr = find_root(y);
			if (xr !== yr) fa[xr] = yr;
		}

		steps.push({
			desc: `读入：n=${n}, m=${m}`,
			line: 38,
			vars: { n, m },
		});

		// init
		for (let i = 1; i <= n; ++i) fa[i] = i;
		steps.push({
			desc: `初始化并查集 fa[i]=i`,
			line: 23,
			vars: { n, fa: [...fa] },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			edges.push({ u: parts[0], v: parts[1], w: parts[2] });
		}
		steps.push({
			desc: `读入 ${m} 条边`,
			line: 43,
			vars: { edges: edges.map(e => `${e.u}-${e.v}:${e.w}`) },
		});

		edges.sort((a, b) => a.w - b.w);
		steps.push({
			desc: `按边权排序`,
			line: 45,
			vars: { edges: edges.map(e => `${e.u}-${e.v}:${e.w}`) },
		});

		let ans = 0;
		let cnt = 0;
		const mstEdges: string[] = [];

		for (let i = 0; i < edges.length; ++i)
		{
			const e = edges[i];
			const fu = find_root(e.u);
			const fv = find_root(e.v);

			steps.push({
				desc: `检查边 ${e.u}-${e.v}，权值 ${e.w}，find_root(${e.u})=${fu}, find_root(${e.v})=${fv}`,
				line: 48,
				vars: { u: e.u, v: e.v, w: e.w, fu, fv, fa: [...fa], ans, cnt },
				highlight: [String(e.u), String(e.v)],
			});

			if (fu !== fv)
			{
				join(e.u, e.v);
				ans += e.w;
				++cnt;
				mstEdges.push(`${e.u}-${e.v}:${e.w}`);

				steps.push({
					desc: `加入 MST！join(${e.u},${e.v})，ans=${ans}，cnt=${cnt}`,
					line: 50,
					vars: { u: e.u, v: e.v, fa: [...fa], ans, cnt, mstEdges: [...mstEdges] },
					highlight: [String(e.u), String(e.v)],
				});
			}
		}

		if (cnt !== n - 1)
		{
			steps.push({
				desc: `cnt=${cnt} ≠ n-1=${n - 1}，图不连通，输出 orz`,
				line: 55,
				vars: { cnt, n },
			});
		}
		else
		{
			steps.push({
				desc: `最小生成树完成！总权值 = ${ans}`,
				line: 58,
				vars: { ans, mstEdges: [...mstEdges] },
			});
		}

		return steps;
	}
};
