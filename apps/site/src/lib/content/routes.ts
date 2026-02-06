import {
	IconArrowUpDown,
	IconChartDonut,
	IconHouse,
	IconJarFillX,
	IconReceiptX
} from '@/assets/media/icons';

import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

type Route<T extends string = string> = {
	href: T;
	text: string;
	Icon: Component<SVGAttributes<SVGSVGElement>>;
};

const routes: Array<Route> = [
	{
		text: 'overview',
		href: '/',
		Icon: IconHouse
	},
	{
		text: 'transactions',
		href: '/transactions',
		Icon: IconArrowUpDown
	},
	{
		text: 'budgets',
		href: '/budgets',
		Icon: IconChartDonut
	},
	{
		text: 'pots',
		href: '/pots',
		Icon: IconJarFillX
	},
	{
		text: 'recurring bills',
		href: '/bills',
		Icon: IconReceiptX
	}
];
export default routes;
