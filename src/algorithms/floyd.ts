import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e2+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m;
int gra[maxn][maxn];
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=1;i<=n;++i)
	{
		for(int j=1;j<=n;++j)
		{
			gra[i][j]=INF;
		}
	}
	for(int i=1,u,v,w;i<=m;++i)
	{
		scanf("%lld%lld%lld",&u,&v,&w);
		gra[u][v]=min(gra[u][v],w);
		gra[v][u]=min(gra[v][u],w);
	}
	for(int k=1;k<=n;++k)
	{
		for(int i=1;i<=n;++i)
		{
			for(int j=1;j<=n;++j)
			{
				gra[i][j]=min(gra[i][j],gra[i][k]+gra[k][j]);
			}
		}
	}
	for(int i=1;i<=n;++i)
	{
		for(int j=1;j<=n;++j)
		{
			if(i==j)
			{
				putchar('0');
				putchar(' ');
			}
			else
			{
				printf("%lld ",gra[i][j]);
			}
		}
		putchar('\\n');
	}
	return 0;
}`;

const DEFAULT_INPUT = `4 5
1 2 3
2 3 2
1 3 7
3 4 1
1 4 10`;

export const floydAlgo: AlgoDef =
{
	id: 'floyd',
	name: 'Floyd 全源最短路',
	category: 'graph',
	desc: 'Floyd-Warshall 算法求解所有点对之间的最短路径，支持无向图，时间复杂度 O(n³)。',
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

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const gra: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(INF));

		steps.push({
			desc: `初始化：n=${n}, m=${m}`,
			line: 8,
			vars: { n, m },
		});

		for (let i = 1; i <= n; ++i)
		{
			for (let j = 1; j <= n; ++j)
			{
				gra[i][j] = INF;
			}
		}
		steps.push({
			desc: `初始化距离矩阵：gra[i][j]=INF`,
			line: 13,
			vars: { gra: gra.map(row => [...row]) },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1], w = parts[2];
			gra[u][v] = Math.min(gra[u][v], w);
			gra[v][u] = Math.min(gra[v][u], w);
			steps.push({
				desc: `读入边 ${u}-${v}，权值 ${w}（无向）`,
				line: 19,
				vars: { u, v, w, gra: gra.map(row => [...row]) },
				highlight: [String(u), String(v)],
			});
		}

		for (let k = 1; k <= n; ++k)
		{
			steps.push({
				desc: `外层循环：k=${k}，以节点 ${k} 为中转`,
				line: 23,
				vars: { k, gra: gra.map(row => [...row]) },
			});

			for (let i = 1; i <= n; ++i)
			{
				for (let j = 1; j <= n; ++j)
				{
					const oldVal = gra[i][j];
					const newVal = Math.min(gra[i][j], gra[i][k] + gra[k][j]);
					if (newVal < oldVal)
					{
						gra[i][j] = newVal;
						steps.push({
							desc: `松弛：gra[${i}][${j}] 从 ${oldVal} 更新为 ${newVal}（经过 ${k}）`,
							line: 27,
							vars: { i, j, k, oldVal, newVal, gra: gra.map(row => [...row]) },
							highlight: [String(i), String(j), String(k)],
						});
					}
				}
			}
		}

		steps.push({
			desc: 'Floyd 算法完成，输出最终距离矩阵',
			line: 32,
			vars: { gra: gra.map(row => [...row]) },
		});

		return steps;
	}
};
