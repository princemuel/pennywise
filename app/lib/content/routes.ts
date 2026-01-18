import {
	IconArrowUpDown,
	IconChartDonut,
	IconHouse,
	IconJarFillX,
	IconReceiptX
} from '../../assets/icons';

export const routes = [
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
