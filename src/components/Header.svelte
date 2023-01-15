<script lang="ts">
	import ynabLogo from "../../assets/ynab-logo.png";
	import type { Bank } from "../types";

	export let bank: Bank;
</script>

<div class="header-container">
	<header style="color: {bank.color}">
		<h1>CZ banks to YNAB converter</h1>
		<span>&#127464&#127487; &#127974; &#128284; <img src={ynabLogo} /></span>
	</header>
</div>

<style>
	.header-container {
		margin: 0 auto 1rem;
		display: flex;
		justify-content: center;
	}

	header {
		display: inline-flex;
		flex-direction: column-reverse;
		text-align: center;
		padding: 1rem;
		border-radius: 1rem;
	}

	header h1 {
		font-size: 1rem;
		font-weight: normal;
	}

	header span {
		font-size: 4rem;
	}

	header img {
		width: 3.5rem;
		height: auto;
	}
</style>
