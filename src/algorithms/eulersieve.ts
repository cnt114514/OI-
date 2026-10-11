import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
int n;
bool vis[100000010];
int prime[100000010];
int cnt=0;
void euler_sieve()
{
	for(int i=2;i<=n;++i)
	{
		if(!vis[i]) prime[++cnt]=i;
		for(int j=1;j<=cnt&&i*prime[j]<=n;++j)
		{
			vis[i*prime[j]]=1;
			if(i%prime[j]==0) break;
		}
	}
}
signed main()
{
	scanf("%d",&n);
	euler_sieve();
	for(int i=1;i<=cnt;++i)
	{
		printf("%d ",prime[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `20`;

export const eulerSieveAlgo: AlgoDef =
{
	id: 'eulersieve',
	name: '线性筛素数（欧拉筛）',
	category: 'math',
	desc: '欧拉筛在 O(n) 时间内筛出所有素数，每个合数只被其最小质因子筛去一次。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const n = Number(input.trim());
		if (isNaN(n) || n < 2) return steps;

		const vis: boolean[] = new Array(n + 1).fill(false);
		const prime: number[] = [0];
		let cnt = 0;

		steps.push({
			desc: `n=${n}，开始线性筛`,
			line: 14,
			vars: { n, cnt, prime: [...prime], vis: [...vis] },
		});

		for (let i = 2; i <= n; ++i)
		{
			if (!vis[i])
			{
				prime[++cnt] = i;
				steps.push({
					desc: `${i} 是素数，加入 prime[${cnt}]=${i}`,
					line: 7,
					vars: { i, cnt, prime: [...prime], vis: [...vis] },
				});
			}

			for (let j = 1; j <= cnt && i * prime[j] <= n; ++j)
			{
				const num = i * prime[j];
				vis[num] = true;
				steps.push({
					desc: `标记 ${num} = ${i} × ${prime[j]} 为合数`,
					line: 10,
					vars: { i, j, num, cnt, prime: [...prime], vis: [...vis] },
				});

				if (i % prime[j] === 0)
				{
					steps.push({
						desc: `${i} % ${prime[j]} = 0，break`,
						line: 11,
						vars: { i, j, cnt, prime: [...prime], vis: [...vis] },
					});
					break;
				}
			}
		}

		steps.push({
			desc: `筛法完成，共 ${cnt} 个素数：[${prime.slice(1).join(', ')}]`,
			line: 16,
			vars: { cnt, prime: [...prime] },
		});

		return steps;
	}
};
