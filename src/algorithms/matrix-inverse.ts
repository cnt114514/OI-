import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=405;
constexpr int mod=1e9+7;
int n;
int a[maxn][maxn*2];
int qpow(int base,int exp)
{
	int res=1;
	while(exp)
	{
		if(exp&1)
		{
			res*=base;
			res%=mod;
		}
		base*=base;
		base%=mod;
		exp>>=1;
	}
	return res;
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		for(int j=1;j<=n;++j)
		{
			scanf("%lld",&a[i][j]);
			a[i][j]%=mod;
		}
	}
	for(int i=1;i<=n;++i)
	{
		a[i][i+n]=1;
	}
	for(int k=1;k<=n;++k)
	{
		int id=k;
		for(int i=k;i<=n;++i)
		{
			if(a[i][k]!=0)
			{
				id=i;
				break;
			}
		}
		if(a[id][k]==0)
		{
			printf("No Solution");
			return 0;
		}
		swap(a[k],a[id]);
		int inv=qpow(a[k][k],mod-2);
		for(int j=k;j<=n*2;++j)
		{
			a[k][j]=a[k][j]*inv%mod;
		}
		for(int i=1;i<=n;++i)
		{
			if(i!=k && a[i][k]!=0)
			{
				int m=a[i][k];
				for(int j=k;j<=n*2;++j)
				{
					a[i][j]=(a[i][j]-m*a[k][j]%mod+mod)%mod;
				}
			}
		}
	}
	for(int i=1;i<=n;++i)
	{
		for(int j=n+1;j<=2*n;++j)
		{
			printf("%lld ",a[i][j]);
		}
		putchar('\\n');
	}
	return 0;
}`;

const DEFAULT_INPUT = `3
1 2 3
0 1 4
5 6 0`;

export const matrixInverseAlgo: AlgoDef =
{
	id: 'matrix-inverse',
	name: '矩阵求逆（高斯-约旦消元）',
	category: 'math',
	desc: '使用高斯-约旦消元法在模意义下求矩阵的逆。将矩阵扩展为 [A|I]，通过行变换将 A 化为 I，右侧即为 A⁻¹。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const mod = 1e9 + 7;

		const a: number[][] = Array.from({ length: n + 1 }, () => new Array(2 * n + 1).fill(0));

		steps.push({
			desc: `n=${n}，读入矩阵`,
			line: 21,
			vars: { n, a: a.map(row => [...row]) },
		});

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			for (let j = 0; j < parts.length && j < n; ++j)
			{
				a[i][j + 1] = parts[j] % mod;
			}
		}

		steps.push({
			desc: `矩阵 A 读入完成`,
			line: 26,
			vars: { n, a: a.map(row => [...row]) },
		});

		for (let i = 1; i <= n; ++i)
		{
			a[i][i + n] = 1;
		}

		steps.push({
			desc: `构造增广矩阵 [A|I]`,
			line: 30,
			vars: { n, a: a.map(row => [...row]) },
		});

		for (let k = 1; k <= n; ++k)
		{
			steps.push({
				desc: `第 ${k} 轮消元`,
				line: 32,
				vars: { k, a: a.map(row => [...row]) },
			});

			let id = k;
			for (let i = k; i <= n; ++i)
			{
				if (a[i][k] !== 0)
				{
					id = i;
					break;
				}
			}

			if (a[id][k] === 0)
			{
				steps.push({
					desc: `主元为 0，矩阵不可逆`,
					line: 39,
					vars: { k, a: a.map(row => [...row]) },
				});
				return steps;
			}

			if (id !== k)
			{
				[a[k], a[id]] = [a[id], a[k]];
				steps.push({
					desc: `交换第 ${k} 行和第 ${id} 行`,
					line: 43,
					vars: { k, id, a: a.map(row => [...row]) },
				});
			}

			const inv = qpow(a[k][k], mod - 2);
			for (let j = k; j <= 2 * n; ++j)
			{
				a[k][j] = a[k][j] * inv % mod;
			}

			steps.push({
				desc: `第 ${k} 行除以主元 a[${k}][${k}]=${a[k][k]}（逆元=${inv}）`,
				line: 45,
				vars: { k, inv, a: a.map(row => [...row]) },
			});

			for (let i = 1; i <= n; ++i)
			{
				if (i !== k && a[i][k] !== 0)
				{
					const m = a[i][k];
					for (let j = k; j <= 2 * n; ++j)
					{
						a[i][j] = (a[i][j] - m * a[k][j] % mod + mod) % mod;
					}
					steps.push({
						desc: `第 ${i} 行减去 ${m} 倍第 ${k} 行`,
						line: 50,
						vars: { i, k, m, a: a.map(row => [...row]) },
					});
				}
			}
		}

		steps.push({
			desc: `消元完成，提取逆矩阵`,
			line: 56,
			vars: { a: a.map(row => [...row]) },
		});

		const invMatrix: number[][] = [];
		for (let i = 1; i <= n; ++i)
		{
			invMatrix.push(a[i].slice(n + 1, 2 * n + 1));
		}

		steps.push({
			desc: `矩阵求逆完成`,
			line: 60,
			vars: { invMatrix },
		});

		return steps;
	}
};

function qpow(base: number, exp: number): number
{
	const mod = 1e9 + 7;
	let res = 1;
	base %= mod;
	while (exp > 0)
	{
		if (exp & 1)
		{
			res = res * base % mod;
		}
		base = base * base % mod;
		exp >>= 1;
	}
	return res;
}
