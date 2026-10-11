import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
int a,b,p;
int power(int a,int b,int p)
{
	int ans=1%p;
	a%=p;
	while(b>0)
	{
		if(b&1) ans=ans*a%p;
		a=a*a%p;
		b>>=1;
	}
	return ans;
}
signed main()
{
	scanf("%lld%lld%lld",&a,&b,&p);
	printf("%lld\\n",power(a,b,p));
	return 0;
}`;

const DEFAULT_INPUT = `2 10 1000`;

export const fastPowAlgo: AlgoDef =
{
	id: 'fastpow',
	name: '快速幂',
	category: 'math',
	desc: '快速幂算法在 O(log n) 时间内计算 a^b mod p，基于二进制分解思想。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const parts = lines[0].split(/\s+/).map(Number);
		const a = parts[0];
		const b = parts[1];
		const p = parts[2];

		steps.push({
			desc: `输入：a=${a}, b=${b}, p=${p}`,
			line: 15,
			vars: { a, b, p },
		});

		let ans = 1 % p;
		let base = a % p;
		let exp = b;

		steps.push({
			desc: `初始化：ans=${ans}, base=${base}, exp=${exp}`,
			line: 7,
			vars: { ans, base, exp, p },
		});

		while (exp > 0)
		{
			const bit = exp & 1;
			steps.push({
				desc: `exp=${exp}，二进制末位=${bit}`,
				line: 10,
				vars: { ans, base, exp, bit, p },
			});

			if (bit)
			{
				const oldAns = ans;
				ans = (ans * base) % p;
				steps.push({
					desc: `末位为 1，ans = ${oldAns} * ${base} mod ${p} = ${ans}`,
					line: 11,
					vars: { ans, base, exp, p, oldAns },
				});
			}

			const oldBase = base;
			base = (base * base) % p;
			steps.push({
				desc: `base = ${oldBase}² mod ${p} = ${base}`,
				line: 12,
				vars: { ans, base, exp, p, oldBase },
			});

			exp >>= 1;
			steps.push({
				desc: `exp >>= 1，exp=${exp}`,
				line: 13,
				vars: { ans, base, exp, p },
			});
		}

		steps.push({
			desc: `循环结束，${a}^${b} mod ${p} = ${ans}`,
			line: 15,
			vars: { ans, a, b, p },
		});

		return steps;
	}
};
