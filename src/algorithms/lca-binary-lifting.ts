import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn = 1e6 + 10;
constexpr int nlog2 = 21;

vector<int> gra[maxn];
int deep[maxn];
int dp[maxn][nlog2];
int n, m, s;

void dfs(int u, int p)
{
	deep[u] = deep[p] + 1;
	dp[u][0] = p;

	for (int i = 1; i < nlog2; ++i)
	{
		dp[u][i] = dp[dp[u][i - 1]][i - 1];
	}
	for (int v : gra[u])
	{
		if (v != p) dfs(v, u);
	}
}

int LCA(int u, int v)
{
	if (deep[u] < deep[v]) swap(u, v);

	int diff = deep[u] - deep[v];
	int i = 0;
	while (diff)
	{
		if (diff & 1) u = dp[u][i];
		diff >>= 1;
		++i;
	}

	if (u == v) return u;

	for (int i = nlog2 - 1; i >= 0; --i)
	{
		if (dp[u][i] != dp[v][i])
		{
			u = dp[u][i];
			v = dp[v][i];
		}
	}
	return dp[u][0];
}

signed main()
{
	scanf("%lld%lld%lld", &n, &m, &s);
	for (int i = 1, x, y; i < n; ++i)
	{
		scanf("%lld%lld", &x, &y);
		gra[x].emplace_back(y);
		gra[y].emplace_back(x);
	}
	dfs(s, 0);
	for (int i = 1, a, b; i <= m; ++i)
	{
		scanf("%lld%lld", &a, &b);
		printf("%lld\\n", LCA(a, b));
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 2 1
1 2
1 3
2 4
2 5
4 5
3 5`;

export const lcaBinaryLiftingAlgo: AlgoDef =
{
	id: 'lca-binary-lifting',
	name: 'LCA 倍增法',
	category: 'tree',
	desc: '使用倍增法求解 LCA，预处理 O(n log n)，查询 O(log n)。通过二进制分解深度差快速上跳。',
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
		const root = firstLine[2];

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);
		const deep: number[] = new Array(n + 1).fill(0);
		const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(21).fill(0));

		steps.push({
			desc: `初始化：n=${n}, m=${m}, root=${root}`,
			line: 42,
			vars: { n, m, root },
		});

		for (let i = 1; i < n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
		}

		function dfs(u: number, p: number)
		{
			deep[u] = deep[p] + 1;
			dp[u][0] = p;

			steps.push({
				desc: `DFS(${u}): deep[${u}]=${deep[u]}, dp[${u}][0]=${p}`,
				line: 11,
				vars: { u, p, 'deep[u]': deep[u] },
			});

			for (let i = 1; i < 21 && (1 << i) <= deep[u]; ++i)
			{
				dp[u][i] = dp[dp[u][i - 1]][i - 1];
				steps.push({
					desc: `dp[${u}][${i}] = dp[${dp[u][i - 1]}][${i - 1}] = ${dp[u][i]}`,
					line: 16,
					vars: { u, i, 'dp[u][i]': dp[u][i] },
				});
			}

			for (const v of gra[u])
			{
				if (v !== p) dfs(v, u);
			}
		}

		dfs(root, 0);
		steps.push({
			desc: `DFS 预处理完成`,
			line: 22,
			vars: { deep: [...deep], u: 0, v: 0 },
		});

		function lca(u: number, v: number): number
		{
			steps.push({
				desc: `查询 LCA(${u}, ${v})`,
				line: 26,
				vars: { u, v, deep: [...deep] },
			});

			if (deep[u] < deep[v])
			{
				[u, v] = [v, u];
				steps.push({
					desc: `deep[${u}]<deep[${v}]，交换`,
					line: 28,
					vars: { u, v, deep: [...deep] },
				});
			}

			let diff = deep[u] - deep[v];
			let i = 0;
			while (diff)
			{
				if (diff & 1)
				{
					steps.push({
						desc: `diff=${diff} (二进制末位=1)，u=dp[${u}][${i}]=${dp[u][i]}`,
						line: 33,
						vars: { u, v, diff, i, deep: [...deep] },
					});
					u = dp[u][i];
				}
				diff >>= 1;
				++i;
			}

			if (u === v)
			{
				steps.push({
					desc: `u==v，LCA=${u}`,
					line: 37,
					vars: { u, v, result: u, deep: [...deep] },
				});
				return u;
			}

			for (let i = 20; i >= 0; --i)
			{
				if (dp[u][i] !== dp[v][i])
				{
					steps.push({
						desc: `i=${i}，dp[${u}][${i}]≠dp[${v}][${i}]，上移`,
						line: 42,
						vars: { u, v, i, deep: [...deep] },
					});
					u = dp[u][i];
					v = dp[v][i];
				}
			}

			const result = dp[u][0];
			steps.push({
				desc: `LCA = dp[${u}][0] = ${result}`,
				line: 46,
				vars: { u, v, result, deep: [...deep] },
			});
			return result;
		}

		let lineIdx = n;
		for (let i = 1; i <= m && lineIdx < lines.length; ++i, ++lineIdx)
		{
			const parts = lines[lineIdx].split(/\s+/).map(Number);
			const x = parts[0], y = parts[1];
			lca(x, y);
		}

		return steps;
	}
};
