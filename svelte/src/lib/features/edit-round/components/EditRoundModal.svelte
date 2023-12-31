<script type="ts">
	import { Button, Modal, getModal, InputWrapper, Range } from '@emerald-dao/component-library';
	import Icon from '@iconify/svelte';
	import type { FundingCycle } from '$lib/types/dao-project/funding-rounds/funding-cycle.interface';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { DAOProject } from '$lib/types/dao-project/dao-project.interface';
	import CurrencyInput from '$components/atoms/CurrencyInput.svelte';
	import validationSuite from '../validation/validation';
	import submitRoundChanges, { type RoundChangesData } from '../functions/submitRoundChanges';
	import EditRoundDatePicker from './EditRoundDatePicker.svelte';

	export let round: FundingCycle;
	export let cycleIndex: number;

	$: adminData = getContext('admin-data') as {
		activeDao: Writable<number>;
		userDaos: Writable<DAOProject[]>;
	};

	$: activeDao = adminData.activeDao;
	$: userDaos = adminData.userDaos;

	$: issuanceRate = Number(round.details.issuanceRate);
	$: fundingTarget = Number(round.details.fundingTarget);
	$: reserveRate = Number(round.details.reserveRate) * 100;
	$: startDate = round.details.timeframe.startTime;
	$: endDate = round.details.timeframe.endTime;

	let infiniteRound = false;

	let formData: RoundChangesData = {
		issuanceRate: 0,
		fundingTarget: 0,
		startDate: '0',
		endDate: '0',
		reserveRate: 0,
		projectId: '',
		cycleIndex: 0
	};

	onMount(() => {
		formData.issuanceRate = issuanceRate;
		formData.fundingTarget = fundingTarget;
		formData.startDate = round.details.timeframe.startTime;
		formData.endDate = round.details.timeframe.endTime || '0';
		formData.reserveRate = reserveRate;
		formData.projectId = $userDaos[$activeDao].generalInfo.project_id;
		formData.cycleIndex = cycleIndex;

		infiniteRound = round.details.timeframe.endTime === null;
	});

	const id = `edit-round-${round.details.cycleId}`;

	const handleChange = (input: Event | CustomEvent) => {
		const target = input.target ?? (input as CustomEvent).detail.target;

		res = validationSuite(formData, target.name);
	};

	let res = validationSuite.get();

	$: validChanges =
		res.hasErrors() === false &&
		(formData.issuanceRate !== issuanceRate ||
			formData.fundingTarget !== fundingTarget ||
			formData.reserveRate !== reserveRate ||
			Number(startDate) !== Number(formData.startDate) ||
			Number(endDate) !== Number(formData.endDate));
</script>

<div
	class="header-link row align-center"
	on:click={() => {
		getModal(id).open();
	}}
	on:keydown
>
	<Icon icon="tabler:edit" />
</div>

<Modal {id}>
	<div class="main-wrapper column-7">
		<h4 class="h5">Edit funding round</h4>
		<div class="content-wrapper">
			<div class="column-4">
				<EditRoundDatePicker
					rounds={$userDaos[$activeDao].onChainData.fundingCycles}
					bind:infiniteDuration={infiniteRound}
					cycleId={round.details.cycleId}
					minStartTimePlus5Minutes={new Date()}
					initialStartDate={round.details.timeframe.startTime}
					initialEndDate={round.details.timeframe.endTime || '0'}
					bind:startDate={formData.startDate}
					bind:endDate={formData.endDate}
				>
					<label for="infinite-duration" class="switch">
						<input
							type="checkbox"
							name="infinite-duration"
							id="infinite-duration"
							bind:checked={infiniteRound}
						/>
						<span class="slider" />
						Infinite round
					</label>
				</EditRoundDatePicker>
			</div>
			<div class="column-1">
				<label for="issuance-rate">
					Issuance rate
					<em>
						(current rate: {issuanceRate} ${$userDaos[$activeDao].generalInfo.token_symbol})
					</em>
				</label>
				<CurrencyInput
					name="issuance-rate"
					currency={$userDaos[$activeDao].generalInfo.token_symbol}
					bind:value={formData.issuanceRate}
					on:input={handleChange}
					isValid={res.isValid('issuance-rate')}
					errors={res.getErrors('issuance-rate')}
				/>
				<div class="range-wrapper column-1">
					<label for="reserve-rate">Reserve rate <em>(current rate: {reserveRate}%)</em></label>
					<Range
						bind:value={formData.reserveRate}
						suffix="%"
						id="reserveRate"
						--clr-surface-secondary="var(--clr-surface-primary)"
					/>
				</div>
				<label for="funding-target"
					>Funding target
					<em>
						(current target: {fundingTarget === 0 ? '∞' : fundingTarget}
						${$userDaos[$activeDao].onChainData.paymentCurrency})
					</em>
				</label>
				<span class="xsmall"><em>* Put a 0 to make the target infinite</em></span>
				<CurrencyInput
					name="funding-target"
					currency={$userDaos[$activeDao].onChainData.paymentCurrency}
					bind:value={formData.fundingTarget}
					on:input={handleChange}
					isValid={res.isValid('funding-target')}
					errors={res.getErrors('funding-target')}
				/>
			</div>
		</div>
		<div class="button-wrapper">
			<Button
				width="extended"
				state={validChanges ? 'active' : 'disabled'}
				on:click={() => submitRoundChanges(formData)}>Submit changes</Button
			>
		</div>
	</div>
</Modal>

<style lang="scss">
	.main-wrapper {
		padding: var(--space-4);

		.content-wrapper {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: var(--space-12);
			max-width: 700px;

			.range-wrapper {
				margin-bottom: var(--space-6);
			}
		}

		.button-wrapper {
			display: flex;
			justify-content: flex-end;
		}
	}

	em {
		color: var(--clr-text-off);
	}
</style>
