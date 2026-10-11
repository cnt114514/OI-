import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e5+10;
constexpr double INF=1e9;
int T,n,p;
mt19937 rd(random_device{}());
int ww=0;
struct fpp
{
	int u,v;
	fpp()=default;
	fpp(int a,int b)
	{
		a%=p;
		b%=p;
		u=a;
		v=b;
	}
	fpp operator*(const fpp& x) const
	{
		return fpp((u*x.u%p+v*x.v%p*ww%p)%p,(v*x.u%p+u*x.v%p)%p);
	}
	fpp operator^(int b)
	{
		fpp base=*(this);
		fpp res=fpp(1,0);
		while(b)
		{
			if(b&1)
			{
				res=res*base;
			}
			base=base*base;
			b>>=1;
		}
		return res;
	}
};
int qpow(int a,int b,int p)
{
	int ans=1;
	a%=p;
	while(b)
	{
		if(b&1)
		{
			ans*=a;
			ans%=p;
		}
		a*=a;
		a%=p;
		b>>=1;
	}
	return ans;
}
int cipolla()
{
	if(!n)
	{
		return 0;
	}
	else if(qpow(n,(p-1)/2,p)==p-1)
	{
		return -1;
	}
	int r=rd()%p;
	for(;;r=rd()%p)
	{
		if(qpow(((r*r-n)%p+p)%p,(p-1)/2,p)==p-1)
		{
			break;
		}
	}
	ww=((r*r-n)%p+p)%p;
	auto ans=fpp(r,1)^((p+1)/2);
	return ans.u;
}
signed main()
{
	scanf("%lld",&T);
	while(T--)
	{
		scanf("%lld%lld",&n,&p);
		int ans=cipolla();
		if(ans==-1)
		{
			printf("Hola!\\n");
		}
		else if(!ans)
		{
			printf("0\\n");
		}
		else
		{
			int ans2=(p-ans)%p;
			if(ans2<ans)
			{
				swap(ans2,ans);
			}
			printf("%lld %lld\\n",ans,ans2);
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `2
2 5
3 7`;

export const cipollaAlgo: AlgoDef =
{
	id: 'cipolla',
	name: 'Cipolla 二次剩余',
	category: 'math',
	desc: 'Cipolla 算法求解二次剩余 x² ≡ n (mod p)，基于扩域上的快速幂。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const T = Number(lines[0]);

		steps.push({
			desc: `T=${T} 组测试数据`,
			line: 54,
			vars: { T },
		});

		for (let t = 0; t < T && t + 1 < lines.length; ++t)
		{
			const parts = lines[t + 1].split(/\s+/).map(Number);
			const n = parts[0];
			const p = parts[1];

			steps.push({
				desc: `测试 ${t + 1}：n=${n}, p=${p}，求 x² ≡ ${n} (mod ${p})`,
				line: 56,
				vars: { n, p },
			});

			const legendre = qpow(n, (p - 1) / 2, p);
			steps.push({
				desc: `计算勒让德符号 n^((p-1)/2) mod p = ${legendre}`,
				line: 39,
				vars: { n, p, legendre },
			});

			if (n === 0)
			{
				steps.push({
					desc: `n=0，答案为 0`,
					line: 59,
					vars: { ans: 0 },
				});
			}
			else if (legendre === p - 1)
			{
				steps.push({
					desc: `勒让德符号为 -1，无解，输出 "Hola!"`,
					line: 62,
					vars: { ans: -1 },
				});
			}
			else
			{
				steps.push({
					desc: `存在二次剩余，需要找到 r 使得 (r²-n) 是模 p 的二次非剩余`,
					line: 43,
					vars: { n, p },
				});

				steps.push({
					desc: `构造扩域元素 (r, 1)，计算 (r, 1)^((p+1)/2)`,
					line: 49,
					vars: { n, p },
				});

				steps.push({
					desc: `二次剩余求解完成`,
					line: 66,
					vars: { n, p },
				});
			}
		}

		return steps;
	}
};

function qpow(a: number, b: number, p: number): number
{
	let ans = 1;
	a %= p;
	while (b > 0)
	{
		if (b & 1)
		{
			ans = (ans * a) % p;
		}
		a = (a * a) % p;
		b >>= 1;
	}
	return ans;
}
