import { AlgoDef } from '../types';
import { dijkstraAlgo } from './dijkstra';
import { spfaAlgo } from './spfa';
import { bfsAlgo } from './bfs';
import { dfsAlgo } from './dfs';
import { unionFindAlgo } from './unionfind';
import { floydAlgo } from './floyd';
import { kruskalAlgo } from './kruskal';
import { topoSortAlgo } from './toposort';
import { ekAlgo } from './ek';
import { dinicAlgo } from './dinic';
import { hlppAlgo } from './hlpp';
import { mcmfAlgo } from './mcmf';
import { tarjanSCCAlgo } from './tarjanscc';
import { edmondsAlgo } from './edmonds';
import { bitAlgo } from './bit';
import { segTreeAlgo } from './segtree';
import { treapAlgo } from './treap';
import { fhqTreapAlgo } from './fhq-treap';
import { lcaBinaryLiftingAlgo } from './lca-binary-lifting';
import { lcaTarjanAlgo } from './lcatarjan';
import { splayAlgo } from './splay';
import { treeChainAlgo } from './treechain';
import { pruferAlgo } from './prufer';
import { kmpAlgo } from './kmp';
import { manacherAlgo } from './manacher';
import { zFunctionAlgo } from './zfunction';
import { trieAlgo } from './trie';
import { acAutomatonAlgo } from './acautomaton';
import { samAlgo } from './sam';
import { gsamAlgo } from './gsam';
import { knapsack01Algo } from './knapsack01';
import { eulerSieveAlgo } from './eulersieve';
import { fastPowAlgo } from './fastpow';
import { fftAlgo } from './fft';
import { nttAlgo } from './ntt';
import { cipollaAlgo } from './cipolla';
import { gaussAlgo } from './gauss';
import { matrixInverseAlgo } from './matrix-inverse';
import { matrixPowAlgo } from './matrix-pow';

export const allAlgorithms: AlgoDef[] =
[
	// 数学
	eulerSieveAlgo,
	fastPowAlgo,
	fftAlgo,
	nttAlgo,
	cipollaAlgo,
	gaussAlgo,
	matrixInverseAlgo,
	matrixPowAlgo,
	// 图论
	dijkstraAlgo,
	spfaAlgo,
	bfsAlgo,
	dfsAlgo,
	unionFindAlgo,
	floydAlgo,
	kruskalAlgo,
	topoSortAlgo,
	ekAlgo,
	dinicAlgo,
	hlppAlgo,
	mcmfAlgo,
	tarjanSCCAlgo,
	edmondsAlgo,
	// 树论
	bitAlgo,
	segTreeAlgo,
	treapAlgo,
	fhqTreapAlgo,
	lcaBinaryLiftingAlgo,
	lcaTarjanAlgo,
	splayAlgo,
	treeChainAlgo,
	pruferAlgo,
	// 字符串
	kmpAlgo,
	manacherAlgo,
	zFunctionAlgo,
	trieAlgo,
	acAutomatonAlgo,
	samAlgo,
	gsamAlgo,
	// 动态规划
	knapsack01Algo,
];
