import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e4+10;
constexpr int INF=INT_MAX;
int n,m,s;
vector<int> gra[maxn];
int dis[maxn];
bool vis[maxn];
int cnt[maxn];
bool SPFA()
{
	for(int i=1;i<=n;++i)
	{
		dis[i]=INF;
	}
	dis[s]=0;
	vis[s]=1;
	queue<int> q;
	q.emplace(s);
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		if(dis[u]!=INF)
		{
			vis[u]=0;
			for(int v:gra[u])
			{
				if(dis[v]>dis[u]+1)
				{
					dis[v]=dis[u]+1;
					cnt[v]=cnt[u]+1;
					if(cnt[v]>n+1)
					{
						return 1;
					}
					if(!vis[v])
					{
						q.emplace(v);
						vis[v]=1;
					}
				}
			}
		}
	}
	return 0;
}
signed main()
{
	scanf("%lld%lld%lld",&n,&m,&s);
	for(int i=1;i<=m;++i)
	{
		int u,v;
		scanf("%lld%lld",&u,&v);
		gra[u].emplace_back(v);
		gra[v].emplace_back(u);
	}
	bool flag=SPFA();
	for(int i=1;i<=n;++i)
	{
		printf("%lld ",dis[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `6 7 1
1 2
1 3
2 4
2 5
3 5
3 6
5 6`;

export const spfaAlgo: AlgoDef =
{
	id: 'spfa',
	name: 'SPFA 最短路',
	category: 'graph',
	desc: 'SPFA（Shortest Path Faster Algorithm）算法，可处理负权边，通过入队次数判断负环。',
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

		const INF = 2147483647;
		const gra: number[][] = Array.from({ length: n + 1 }, () => []);

		steps.push({
			desc: `读入图：n=${n}, m=${m}, 源点 s=${s}`,
			line: 50,
			vars: { n, m, s },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
			steps.push({
				desc: `加边 ${u}-${v}（无向）`,
				line: 55,
				vars: { u, v },
			});
		}

		const dis: number[] = new Array(n + 1).fill(INF);
		const vis: boolean[] = new Array(n + 1).fill(false);
		const cnt: number[] = new Array(n + 1).fill(0);
		const queue: number[] = [];

		steps.push({
			desc: `初始化：dis[i]=INF`,
			line: 18,
			vars: { dis: [...dis] },
		});

		dis[s] = 0;
		vis[s] = true;
		queue.push(s);

		steps.push({
			desc: `dis[${s}]=0，vis[${s}]=true，入队`,
			line: 22,
			vars: { dis: [...dis], vis: [...vis], queue: [...queue] },
		});

		let hasNegCycle = false;

		while (queue.length > 0)
		{
			const u = queue.shift()!;

			steps.push({
				desc: `出队 u=${u}`,
				line: 25,
				vars: { u, queue: [...queue], vis: [...vis] },
				highlight: [String(u)],
			});

			if (dis[u] !== INF)
			{
				vis[u] = false;

				for (const v of gra[u])
				{
					steps.push({
						desc: `检查边 ${u}-${v}，dis[${v}]=${dis[v] === INF ? 'INF' : dis[v]}`,
						line: 30,
						vars: { u, v, dis: [...dis] },
						highlight: [String(u), String(v)],
					});

					if (dis[v] > dis[u] + 1)
					{
						dis[v] = dis[u] + 1;
						cnt[v] = cnt[u] + 1;

						steps.push({
							desc: `松弛！dis[${v}]=${dis[v]}，cnt[${v}]=${cnt[v]}`,
							line: 34,
							vars: { v, dis: [...dis], cnt: [...cnt] },
							highlight: [String(u), String(v)],
						});

						if (cnt[v] > n + 1)
						{
							steps.push({
								desc: `cnt[${v}]=${cnt[v]} > n+1=${n + 1}，检测到负环！`,
								line: 37,
								vars: { v, cnt: [...cnt], hasNegCycle: true },
							});
							hasNegCycle = true;
							break;
						}

						if (!vis[v])
						{
							queue.push(v);
							vis[v] = true;
							steps.push({
								desc: `${v} 不在队列中，入队`,
								line: 41,
								vars: { v, queue: [...queue], vis: [...vis] },
							});
						}
					}
				}

				if (hasNegCycle) break;
			}
		}

		if (!hasNegCycle)
		{
			const result: string[] = [];
			for (let i = 1; i <= n; ++i)
			{
				result.push(dis[i] >= INF / 2 ? 'INF' : String(dis[i]));
			}
			steps.push({
				desc: `输出结果：${result.join(' ')}`,
				line: 59,
				vars: { dis: [...dis], result: result.join(' ') },
			});
		}
		else
		{
			steps.push({
				desc: '存在负环，无法求最短路',
				line: 58,
				vars: { hasNegCycle: true },
			});
		}

		return steps;
	}
};
