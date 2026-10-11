import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=2e2+10;
constexpr int maxm=1e4+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m,s,t,cur[maxn];
typedef struct edge
{
	int to,nxt,w;
	edge()=default;
	edge(int a,int b,int c):to(a),nxt(b),w(c){}
}edge;
edge es[maxm];
int enums,heads[maxn];
void add_edge(int x,int y,int w)
{
	es[++enums]={y,heads[x],w};
	heads[x]=enums;
}
void add_flow(int x,int y,int w)
{
	add_edge(x,y,w);
	add_edge(y,x,0);
}
int d[maxn];
bool bfs()
{
	for(int i=1;i<n+9;++i) d[i]=0;
	queue<int> q;
	q.emplace(s);
	d[s]=1;
	cur[s]=heads[s];
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(int i=heads[u];i;i=es[i].nxt)
		{
			int w=es[i].w;
			if(!w) continue;
			int v=es[i].to;
			if(d[v]) continue;
			d[v]=d[u]+1;
			cur[v]=heads[v];
			q.emplace(v);
			if(v==t) return 1;
		}
	}
	return 0;
}
int dfs(int u,int limit)
{
	if(u==t) return limit;
	int flow=0;
	for(int i=cur[u];i&&flow<limit;i=es[i].nxt)
	{
		cur[u]=i;
		int w=es[i].w;
		if(!w) continue;
		int v=es[i].to;
		if(d[v]!=d[u]+1) continue;
		int f=dfs(v,min(w,limit-flow));
		es[i].w-=f;
		es[i^1].w+=f;
		flow+=f;
	}
	return flow;
}
int dinic()
{
	int maxf=0,flow=0;
	while(bfs())
	{
		while(flow=dfs(s,INF))
		{
			maxf+=flow;
		}
	}
	return maxf;
}
signed main()
{
	enums=1;
	scanf("%lld%lld%lld%lld",&n,&m,&s,&t);
	for(int i=1,u,v,w;i<=m;++i)
	{
		scanf("%lld%lld%lld",&u,&v,&w);
		add_flow(u,v,w);
	}
	int maxf=dinic();
	printf("%lld",maxf);
}`;

const DEFAULT_INPUT = `4 5 1 4
1 2 3
1 3 2
2 3 1
2 4 2
3 4 3`;

export const dinicAlgo: AlgoDef =
{
	id: 'dinic',
	name: '最大流 Dinic',
	category: 'graph',
	desc: 'Dinic 算法使用 BFS 分层 + DFS 多路增广求解最大流，时间复杂度 O(V²E)。',
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
		const s = firstLine[2];
		const t = firstLine[3];

		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		const es_w: number[] = [0, 0];
		const heads: number[] = new Array(n + 1).fill(0);
		let enums = 1;

		const origEdges: { from: number; to: number; cap: number; idx: number }[] = [];

		function add_edge(x: number, y: number, w: number)
		{
			++enums;
			es_to.push(y);
			es_nxt.push(heads[x]);
			es_w.push(w);
			heads[x] = enums;
		}

		function add_flow(x: number, y: number, w: number)
		{
			add_edge(x, y, w);
			const idx = enums;
			add_edge(y, x, 0);
			origEdges.push({ from: x, to: y, cap: w, idx });
		}

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			add_flow(parts[0], parts[1], parts[2]);
		}

		function getEdgeStates()
		{
			return origEdges.map(e => ({ from: e.from, to: e.to, cap: e.cap, flow: e.cap - es_w[e.idx] }));
		}

		steps.push({
			desc: `n=${n}, m=${m}, s=${s}, t=${t}，读入 ${m} 条边`,
			line: 53,
			vars: { n, m, s, t, maxf: 0, edgeStates: getEdgeStates() },
		});

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const d: number[] = new Array(n + 1).fill(0);
		const cur: number[] = new Array(n + 1).fill(0);
		let maxf = 0;

		function bfs(): boolean
		{
			for (let i = 1; i < n + 9; ++i) d[i] = 0;
			const queue: number[] = [];
			queue.push(s);
			d[s] = 1;
			cur[s] = heads[s];

			while (queue.length > 0)
			{
				const u = queue.shift()!;
				for (let i = heads[u]; i; i = es_nxt[i])
				{
					const w = es_w[i];
					if (!w) continue;
					const v = es_to[i];
					if (d[v]) continue;
					d[v] = d[u] + 1;
					cur[v] = heads[v];
					queue.push(v);
					if (v === t) return true;
				}
			}
			return false;
		}

		const pathStack: number[] = [];

		function dfs(u: number, limit: number): number
		{
			if (u === t) return limit;
			let flow = 0;
			pathStack.push(u);
			for (let i = cur[u]; i && flow < limit; i = es_nxt[i])
			{
				cur[u] = i;
				const w = es_w[i];
				if (!w) continue;
				const v = es_to[i];
				if (d[v] !== d[u] + 1) continue;
				const f = dfs(v, Math.min(w, limit - flow));
				es_w[i] -= f;
				es_w[i ^ 1] += f;
				flow += f;
				if (f > 0) break;
			}
			if (flow === 0) pathStack.pop();
			return flow;
		}

		let iter = 0;
		while (bfs())
		{
			++iter;
			const reached: string[] = [];
			for (let i = 1; i <= n; ++i) if (d[i] > 0) reached.push(String(i));

			steps.push({
				desc: `第 ${iter} 次 BFS：构建层次图 d=[${d.slice(1, n + 1).join(',')}]`,
				line: 35,
				vars: { iter, maxf, d: [...d], edgeStates: getEdgeStates() },
				highlight: reached,
			});

			let flow: number;
			while ((flow = dfs(s, INF)))
			{
				maxf += flow;
				const path = [...pathStack, t];
				steps.push({
					desc: `DFS 增广：${path.join('→')}，流量 ${flow}，maxf=${maxf}`,
					line: 49,
					vars: { iter, flow, maxf, edgeStates: getEdgeStates() },
					highlight: path.map(String),
				});
				pathStack.length = 0;
			}
		}

		steps.push({
			desc: `最大流 = ${maxf}`,
			line: 61,
			vars: { maxf, edgeStates: getEdgeStates() },
		});

		return steps;
	}
};
