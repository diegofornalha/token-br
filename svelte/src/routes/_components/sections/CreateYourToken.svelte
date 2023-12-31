<script type="ts">
	import CreateProjectStepsCard from '$components/cards/CreateProjectStepsCard.svelte';
	import IntersectionObserver from 'svelte-intersection-observer';

	interface stepData {
		number: number;
		title: string;
		description: string;
		element: HTMLElement | undefined;
		intersecting: boolean;
	}

	let stepsData: stepData[] = [
		{
			number: 1,
			title: 'Input DAO Details',
			description: 'Input a name, description, logos, and all your socials.',
			element: undefined,
			intersecting: false
		},
		{
			number: 2,
			title: 'Configure Tokenomics',
			description:
				'Select what type of token you will raise in, a max supply, turn minting on/off, and configure an edit delay.',
			element: undefined,
			intersecting: false
		},
		{
			number: 3,
			title: 'Launch Your DAO',
			description:
				'In under 5 minutes you can launch your own DAO on the Flow blockchain with a multi-sig treasury.',
			element: undefined,
			intersecting: false
		}
	];

	let activeStep: number | undefined = undefined;

	const handleIntersection = (i: number) => {
		activeStep = i;
	};

	$: stepsData.filter((e) => e.intersecting === false) ? (activeStep = undefined) : null;
</script>

<section class="container-small section-large">
	<div class="hide-on-mobile left-wrapper">
		<CreateProjectStepsCard {activeStep} />
	</div>
	<div class="right-wrapper">
		<div class="title-wrapper">
			<span class="tagline">No Code Required</span>
			<h2 class="w-medium">Creating your own DAO is easy</h2>
			<!-- <p>
				Whether you want to create a token to raise funds in a treasury, or simply as utility &
				rewards for your community, Toucans makes it easy for you to build organizations together,
				online.
			</p> -->
		</div>
		<div class="column-16">
			{#each stepsData as step, i}
				<IntersectionObserver
					element={stepsData[i].element}
					bind:intersecting={stepsData[i].intersecting}
					threshold={1}
					rootMargin="-115px"
					on:intersect={() => handleIntersection(i)}
				>
					<div bind:this={stepsData[i].element} class="steps-wrapper">
						<div class="row-3 align-center">
							<div
								class="circle center"
								class:active={stepsData[i].intersecting && !stepsData[i + 1]?.intersecting}
							>
								<span class="w-bold">{step.number}</span>
							</div>
							<h4>{step.title}</h4>
						</div>
						<p>{step.description}</p>
					</div>
				</IntersectionObserver>
			{/each}
		</div>
	</div>
</section>

<style type="scss">
	.container-small {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-width: 45ch;

		@include mq('medium') {
			display: grid;
			grid-template-columns: 1fr 1fr;
			max-width: none;
			align-items: flex-start;
			gap: 4rem;
		}

		.left-wrapper {
			display: none;

			@include mq('medium') {
				position: sticky;
				top: var(--space-20);
				display: grid;
				place-content: left;
			}
		}

		.title-wrapper {
			text-align: center;
			margin: var(--space-13) 0;

			@include mq('medium') {
				text-align: left;
				margin-top: 0;
				margin-bottom: var(--space-16);
			}

			h2 {
				margin: var(--space-6) 0;
			}
		}

		.steps-wrapper {
			.circle {
				width: 38px;
				height: 32px;
				background-color: var(--clr-surface-primary);
				border-radius: 14px;
				transition: 0.5s;
				transition-delay: 0.1s;
			}

			.circle.active {
				background-color: var(--clr-primary-main);
				color: var(--clr-heading-inverse);
			}

			h4 {
				display: inline;
			}

			p {
				margin-top: var(--space-6);
			}
		}
	}
</style>
