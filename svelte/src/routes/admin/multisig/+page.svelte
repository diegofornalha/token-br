<script type="ts">
	import { fly } from 'svelte/transition';
	import type { DAOProject } from '$lib/types/dao-project/dao-project.interface';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { Button } from '@emerald-dao/component-library';
	import MultisigManager from '$lib/features/multisig-manager/components/MultisigManager.svelte';
	import { updateMultisigExecution } from '$flow/actions';

	const adminData: {
		activeDao: Writable<number>;
		userDaos: Writable<DAOProject[]>;
	} = getContext('admin-data');

	const activeDaoStore = adminData.activeDao;
	const userDaosStore = adminData.userDaos;

	$: activeDaoData = $userDaosStore[$activeDaoStore];

	let allWalletsValid: boolean = false;
	let thresholdValid: boolean = true;

	let existingAddresses: string[];
	let threshold: number;
	let newAddresses: {
		address: string;
		id: string;
	}[] = [];

	const reloadData = () => {
		existingAddresses = activeDaoData.onChainData.signers;
		threshold = Number(activeDaoData.onChainData.threshold);
		newAddresses = [];
	};

	onMount(() => {
		reloadData();
	});

	$: activeDaoData && reloadData();
	$: allAddresses = existingAddresses.concat(newAddresses.map((address) => address.address));
</script>

<div in:fly={{ x: 10, duration: 400 }} class="main-wrapper">
	<div>
		<h5>Multisig</h5>
		<p class="small">Manage the signers of your DAO.</p>
	</div>
	<MultisigManager
		bind:existingAddresses
		bind:newAddresses
		bind:allWalletsValid
		bind:thresholdValid
		bind:threshold
		owner={activeDaoData.generalInfo.owner}
		projectId={activeDaoData.generalInfo.project_id}
	/>
	<Button
		state={allWalletsValid &&
		thresholdValid &&
		(Number(activeDaoData.onChainData.threshold) !== threshold || newAddresses.length > 0)
			? 'active'
			: 'disabled'}
		on:click={() =>
			updateMultisigExecution(
				activeDaoData.generalInfo.owner,
				activeDaoData.generalInfo.project_id,
				allAddresses,
				threshold
			)}
	>
		Submit changes
	</Button>
</div>

<style lang="scss">
	.main-wrapper {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: var(--space-10);

		h5 {
			margin-bottom: var(--space-2);
			margin-top: 0;
		}
	}
</style>
