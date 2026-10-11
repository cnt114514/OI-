import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
int n,W;
int v[1010],w[1010];
int f[1010];
signed main()
{
	scanf("%lld%lld",&n,&W);
	for(int i=1;i<=n;++i)
	{
		scanf("%lld%lld",&w[i],&v[i]);
	}
	for(int i=1;i<=n;++i)
	{
		for(int j=W;j>=w[i];--j)
		{
			f[j]=max(f[j],f[j-w[i]]+v[i]);
		}
	}
	printf("%lld\\n",f[W]);
	return 0;
}`;

const DEFAULT_INPUT = `4 5
1 2
2 4
3 4
4 5`;

export const knapsack01Algo: AlgoDef =
{
	id: 'knapsack01',
	name: '01 背包',
	category: 'dp',
	desc: '01 背包问题：每种物品只能选一次，求在容量限制下的最大价值。时间复杂度 O(nW)。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		const n = firstLine[0];
		const W = firstLine[1];

		const w: number[] = [0]; // 1-indexed
		const v: number[] = [0];

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			w.push(parts[0]);
			v.push(parts[1]);
		}

		steps.push({
			desc: `n=${n}, W=${W}，物品：${w.slice(1).map((wi, i) => `(w=${wi},v=${v[i + 1]})`).join(', ')}`,
			line: 7,
			vars: { n, W, w: [...w], v: [...v] },
		});

		const f: number[] = new Array(W + 1).fill(0);

		steps.push({
			desc: `初始化 f[0..${W}] = 0`,
			line: 12,
			vars: { f: [...f] },
		});

		for (let i = 1; i <= n; ++i)
		{
			steps.push({
				desc: `考虑第 ${i} 个物品：w=${w[i]}, v=${v[i]}`,
				line: 13,
				vars: { i, w: w[i], v: v[i], f: [...f] },
			});

			for (let j = W; j >= w[i]; --j)
			{
				const oldF = f[j];
				const newF = Math.max(f[j], f[j - w[i]] + v[i]);
				f[j] = newF;

				if (newF > oldF)
				{
					steps.push({
						desc: `j=${j}：f[${j}]=max(${oldF}, f[${j - w[i]}]+${v[i]})=max(${oldF}, ${f[j - w[i]] + v[i]})=${newF}`,
						line: 15,
						vars: { i, j, oldF, newF, f: [...f] },
					});
				}
			}
		}

		steps.push({
			desc: `最大价值 f[${W}] = ${f[W]}`,
			line: 18,
			vars: { f: [...f] },
		});

		return steps;
	}
};
