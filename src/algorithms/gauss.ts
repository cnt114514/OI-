import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e2+10;
constexpr double eps=1e-9;
int n;
double a[maxn][maxn];
double ans[maxn];
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		for(int j=1;j<=n+1;++j)
		{
			scanf("%lf",&a[i][j]);
		}
	}
	for(int k=1;k<=n;++k)
	{
		int id=k;
		for(int i=k;i<=n;++i)
		{
			if(fabs(a[i][k])>fabs(a[id][k]))
			{
				id=i;
			}
		}
		swap(a[k],a[id]);
		if(fabs(a[k][k])<eps)
		{
			continue;
		}
		for(int i=k+1;i<=n;++i)
		{
			double m=-(a[i][k]/a[k][k]);
			for(int j=k;j<=n+1;++j)
			{
				a[i][j]+=a[k][j]*m;
			}
		}
	}
	for(int i=n;i>=1;--i)
	{
		ans[i]=a[i][n+1];
		for(int j=i+1;j<=n;++j)
		{
			ans[i]-=ans[j]*a[i][j];
		}
		ans[i]/=a[i][i];
	}
	for(int i=1;i<=n;++i)
	{
		printf("%.2lf\\n",ans[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `3
1 1 1 6
2 1 -1 1
1 -1 2 5`;

export const gaussAlgo: AlgoDef =
{
	id: 'gauss',
	name: '高斯消元',
	category: 'math',
	desc: '高斯消元法求解线性方程组，通过行变换将增广矩阵化为上三角矩阵后回代。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const a: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 2).fill(0));

		steps.push({
			desc: `n=${n}，读入增广矩阵`,
			line: 9,
			vars: { n },
		});

		for (let i = 1; i <= n; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			for (let j = 1; j <= n + 1; ++j)
			{
				a[i][j] = parts[j - 1];
			}
		}

		steps.push({
			desc: `增广矩阵读入完成`,
			line: 14,
			vars: { a: a.map(row => [...row]) },
		});

		for (let k = 1; k <= n; ++k)
		{
			steps.push({
				desc: `第 ${k} 轮消元`,
				line: 15,
				vars: { k, a: a.map(row => [...row]) },
			});

			let id = k;
			for (let i = k; i <= n; ++i)
			{
				if (Math.abs(a[i][k]) > Math.abs(a[id][k]))
				{
					id = i;
				}
			}

			if (id !== k)
			{
				[a[k], a[id]] = [a[id], a[k]];
				steps.push({
					desc: `交换第 ${k} 行和第 ${id} 行`,
					line: 21,
					vars: { k, id, a: a.map(row => [...row]) },
				});
			}

			if (Math.abs(a[k][k]) < 1e-9)
			{
				steps.push({
					desc: `主元 a[${k}][${k}] ≈ 0，跳过`,
					line: 23,
					vars: { k, a: a.map(row => [...row]) },
				});
				continue;
			}

			for (let i = k + 1; i <= n; ++i)
			{
				const m = -(a[i][k] / a[k][k]);
				for (let j = k; j <= n + 1; ++j)
				{
					a[i][j] += a[k][j] * m;
				}
				steps.push({
					desc: `消去第 ${i} 行：倍数 m=${m.toFixed(3)}`,
					line: 27,
					vars: { i, k, m, a: a.map(row => [...row]) },
				});
			}
		}

		steps.push({
			desc: `上三角矩阵完成，开始回代`,
			line: 33,
			vars: { a: a.map(row => [...row]) },
		});

		const ans: number[] = new Array(n + 1).fill(0);
		for (let i = n; i >= 1; --i)
		{
			ans[i] = a[i][n + 1];
			for (let j = i + 1; j <= n; ++j)
			{
				ans[i] -= ans[j] * a[i][j];
			}
			ans[i] /= a[i][i];

			steps.push({
				desc: `ans[${i}] = ${ans[i].toFixed(3)}`,
				line: 38,
				vars: { i, ans: [...ans], a: a.map(row => [...row]) },
			});
		}

		steps.push({
			desc: `解：${ans.slice(1).map(x => x.toFixed(2)).join(', ')}`,
			line: 43,
			vars: { ans: [...ans] },
		});

		return steps;
	}
};
