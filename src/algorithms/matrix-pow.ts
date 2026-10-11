import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e2+10;
constexpr int mod=1e9+7;
int n,m;
typedef struct mat
{
	int rows,cols;
	int** data;
	mat(int a,int b)
	{
		this->rows=a,this->cols=b;
		data=(int**)malloc(a*sizeof(int*));
		for(int i=0;i<n;++i)
		{
			data[i]=(int*)malloc(b*sizeof(int));
		}
	}
	mat operator*(const mat& b) const
	{
		mat res=mat(this->rows,b.cols);
		for(int i=0;i<this->rows;++i)
		{
			for(int j=0;j<b.cols;++j)
			{
				res.data[i][j]=0;
				for(int k=0;k<b.rows;++k)
				{
					res.data[i][j]+=((this->data[i][k]%mod)*(b.data[k][j])%mod)%mod;
					res.data[i][j]%=mod;
				}
			}
		}
		return res;
	}
	mat operator^(int n) const
	{
		mat res=mat(this->rows,this->cols);
		for(int i=0;i<res.rows;++i)
		{
			for(int j=0;j<res.cols;++j)
			{
				if(i==j)
				{
					res.data[i][j]=1;
				}
				else
				{
					res.data[i][j]=0;
				}
			}
		}
		if(!n)
		{
			return res;
		}
		mat base=mat(this->rows,this->cols);
		for(int i=0;i<res.rows;++i)
		{
			for(int j=0;j<res.cols;++j)
			{
				base.data[i][j]=this->data[i][j];
			}
		}
		while(n)
		{
			if(n&1)
			{
				res=res*base;
			}
			base=base*base;
			n>>=1;
		}
		return res;
	}
}mat;
signed main()
{
	scanf("%lld%lld",&n,&m);
	mat matrix=mat(n,n);
	for(int i=0;i<n;++i)
	{
		for(int j=0;j<n;++j)
		{
			scanf("%lld",&matrix.data[i][j]);
		}
	}
	matrix=matrix^m;
	for(int i=0;i<n;++i)
	{
		for(int j=0;j<n;++j)
		{
			printf("%lld ",matrix.data[i][j]);
		}
		putchar('\\n');
	}
	return 0;
}`;

const DEFAULT_INPUT = `2 3
1 2
3 4`;

export const matrixPowAlgo: AlgoDef =
{
	id: 'matrix-pow',
	name: '矩阵快速幂',
	category: 'math',
	desc: '使用快速幂算法计算矩阵的 m 次幂，时间复杂度 O(n³ log m)。',
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
		const mod = 1e9 + 7;

		steps.push({
			desc: `n=${n}, m=${m}，读入矩阵`,
			line: 68,
			vars: { n, m },
		});

		const matrix: number[][] = [];
		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			matrix.push(parts.map(x => x % mod));
		}

		steps.push({
			desc: `矩阵读入完成`,
			line: 74,
			vars: { matrix },
		});

		const res: number[][] = Array.from({ length: n }, (_, i) =>
			Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
		);

		steps.push({
			desc: `初始化结果矩阵为单位矩阵`,
			line: 36,
			vars: { res, base: matrix },
		});

		let base = matrix.map(row => [...row]);
		let exp = m;

		while (exp > 0)
		{
			steps.push({
				desc: `指数 exp=${exp}（二进制：${exp.toString(2)}）`,
				line: 53,
				vars: { exp, res, base },
			});

			if (exp & 1)
			{
				const newRes: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
				for (let i = 0; i < n; ++i)
				{
					for (let j = 0; j < n; ++j)
					{
						for (let k = 0; k < n; ++k)
						{
							newRes[i][j] = (newRes[i][j] + res[i][k] * base[k][j]) % mod;
						}
					}
				}
				res.splice(0, n, ...newRes);

				steps.push({
					desc: `exp 末位为 1，res = res × base`,
					line: 56,
					vars: { exp, res, base },
				});
			}

			const newBase: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
			for (let i = 0; i < n; ++i)
			{
				for (let j = 0; j < n; ++j)
				{
					for (let k = 0; k < n; ++k)
					{
						newBase[i][j] = (newBase[i][j] + base[i][k] * base[k][j]) % mod;
					}
				}
			}
			base.splice(0, n, ...newBase);

			steps.push({
				desc: `base = base × base`,
				line: 58,
				vars: { exp, res, base },
			});

			exp >>= 1;
		}

		steps.push({
			desc: `矩阵快速幂完成`,
			line: 75,
			vars: { result: res },
		});

		return steps;
	}
};
