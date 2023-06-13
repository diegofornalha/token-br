import type { DaoGeneratorData } from '$lib/features/dao-generator/types/dao-generator-data.interface';
import { writable, type Writable } from 'svelte/store';
import { ECurrencies } from '$lib/types/common/enums';

export const emptyDaoGeneratorData: DaoGeneratorData = {
	daoDetails: {
		name: '',
		tokenName: '',
		description: '',
		website: '',
		twitter: '',
		discord: '',
		contractName: '',
		logo: undefined,
		bannerImage: undefined
	},
	tokenomics: {
		paymentCurrency: ECurrencies.FLOW,
		initialSupply: 0,
		hasMaxSupply: false,
		maxSupply: undefined,
		editDelay: '259200.00',
		mintTokens: true,
		walletAddresses: []
	}
};

export const daoGeneratorData: Writable<DaoGeneratorData> = writable(emptyDaoGeneratorData);
