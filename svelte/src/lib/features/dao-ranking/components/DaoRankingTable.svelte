<script type="ts">
	import type { DaoRankingData } from '../types/dao-ranking-data.interface';
	import DaoRankingRow from './atoms/DaoRankingRow.svelte';

	export let projectsData: DaoRankingData[];
</script>

<div class="table-wrap">
	<table class="table table-bordered table-dark table-hover">
		<thead>
			<tr>
				<th class="left-align">#</th>
				<th class="left-align">Name</th>
				<th>Total Funding</th>
				<th>Treasury Value</th>
				<th># Proposals</th>
				<th># Participants</th>
				<th>7d Funding</th>
			</tr>
		</thead>
		<tbody>
			{#each projectsData as project, i}
				<DaoRankingRow {project} number={i} />
			{/each}
		</tbody>
	</table>
</div>

<style type="scss">
	.table {
		width: 100%;
		border-spacing: 0 var(--space-5);

		th {
			color: var(--clr-text-main);
			font-size: var(--font-size-0);
			text-align: right;
		}

		.left-align {
			text-align: left;
		}
	}
</style>
