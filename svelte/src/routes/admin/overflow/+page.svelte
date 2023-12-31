<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { Button, Currency } from '@emerald-dao/component-library';
	import CurrencyInput from '$lib/components/atoms/CurrencyInput.svelte';
	import type { DAOProject } from '$lib/types/dao-project/dao-project.interface';
	import CheckElement from './_components/CheckElement.svelte';
	import { transferOverflowSuite } from './_validations/validation';
	import { transferOverflowExecution } from '$flow/actions';

	// DAO Context
	const adminData: {
		activeDao: Writable<number>;
		userDaos: Writable<DAOProject[]>;
	} = getContext('admin-data');

	const activeDaoStore = adminData.activeDao;
	const userDaosStore = adminData.userDaos;

	$: activeDaoData = $userDaosStore[$activeDaoStore];

	$: activeRound = activeDaoData.onChainData.currentFundingCycle;

	// Transfer overflow
	let transferAmount: number = 0;
	const onTransferOverflowTokens = async () => {
		await transferOverflowExecution(activeDaoData.generalInfo.owner, activeDaoData.generalInfo.project_id, transferAmount.toString())
	};

	// Input validation
	let res = transferOverflowSuite.get();
	const handleInputChange = () => {
		res = transferOverflowSuite(
			transferAmount,
			amountToGoal,
			Number(activeDaoData.onChainData.overflowBalance)
		);
	};

	// Overflow data
	$: activeRoundGoal = activeRound?.details.fundingTarget
		? Number(activeRound.details.fundingTarget)
		: 'infinite';
	$: activeRoundFunding = activeRound?.raisedTowardsGoal
		? Number(activeRound.raisedTowardsGoal)
		: 0;
	$: amountToGoal =
		activeRoundGoal != 'infinite' ? (activeRoundGoal as number) - activeRoundFunding : 0;

	$: isEligibleForTransfer =
		activeRound !== null &&
		Number(activeDaoData.onChainData.overflowBalance) > 0 &&
		(amountToGoal > 0 || activeRoundGoal == 'infinite');
</script>

<div in:fly={{ x: 10, duration: 400 }} class="main-wrapper">
	<div>
		<h5>Overflow</h5>
		<p class="small">
			Manage the overflow of your DAO. <br />Overflow are the funds gathered by your DAO that
			exceeded your funding goals.
		</p>
	</div>
	<div class="column-4">
		<div class="card column-1">
			<span> Available overflow </span>
			<Currency
				amount={Number(activeDaoData.onChainData.overflowBalance)}
				currency={activeDaoData.onChainData.paymentCurrency}
				fontSize="1.5rem"
				color="heading"
			/>
		</div>
		<div class="divider" />
		<div class="column-4">
			<div class="column-2">
				<span class="heading">Transfer overflow to funding round</span>
				<p class="small">
					If the conditions below are met, you can transfer tokens from your overflow balance to
					your active funding round.
				</p>
			</div>
			<div class="row-3">
				<CheckElement check={activeRound !== null} text="The DAO has an active funding round" />
				{#if activeRound !== null}
					<CheckElement
						check={amountToGoal > 0 || activeRoundGoal == 'infinite'}
						text="The active funding round hasn't reached its goal"
					/>
				{/if}
				<CheckElement
					check={Number(activeDaoData.onChainData.overflowBalance) > 0}
					text="The DAO has overflow tokens"
				/>
			</div>
		</div>
		{#if isEligibleForTransfer && activeRound !== null}
			<div class="divider" />
			<div class="column-2">
				<span class="heading"> Transfer amount </span>
				<CurrencyInput
					name="transferOverflowAmount"
					autofocus={true}
					currency={activeDaoData.onChainData.paymentCurrency}
					isValid={res.isValid()}
					errors={res.getErrors('transferOverflowAmount')}
					bind:value={transferAmount}
					on:input={handleInputChange}
				/>
				<Button
					width="extended"
					state={res.isValid() ? 'active' : 'disabled'}
					on:click={onTransferOverflowTokens}>Transfer</Button
				>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.main-wrapper {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: var(--space-6);

		h5 {
			margin-bottom: var(--space-2);
			margin-top: 0;
		}

		[class^='card'] {
			padding-block: var(--space-5);
		}

		.divider {
			border-bottom: 2px dashed var(--clr-border-primary);
			opacity: 0.5;
			margin-block: var(--space-5);
		}

		span.heading {
			color: var(--clr-heading-main);
			font-size: var(--font-size-3);
		}
	}
</style>
