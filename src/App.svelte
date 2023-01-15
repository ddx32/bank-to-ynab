<script lang="ts">
	import "./app.css";
	import type { Bank } from "./types";
	import { getYnabCsv } from "./lib/csvFileTools";

	import Header from "./components/Header.svelte";

	import airBankLogo from "../assets/airbank-logo.png";
	import kbLogo from "../assets/kb-logo.png";

	let isDragging = false;
	let fileDownloadUrl: string;

	const banks: Bank[] = [
		{
			id: "air_bank",
			name: "AirBank",
			color: "#000000",
			secondaryColor: "#99CC33",
			bodyColor: "#ffffff",
			icon: airBankLogo,
		},
		{
			id: "kb",
			name: "KB",
			color: "#FFFFFF",
			secondaryColor: "#CC0033",
			bodyColor: "#CC0033",
			icon: kbLogo,
		},
	];

	let currentBank = banks[0];

	function setBank(bankName: string) {
		currentBank = banks.find((bank) => bank.name === bankName);
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();

		isDragging = false;
		if (event.dataTransfer?.items.length !== 1) {
			return;
		}

		const item = event.dataTransfer.items[0];
		const downloadUrl = await getYnabCsv(item, currentBank);
		fileDownloadUrl = downloadUrl;
	}

	function getFileUrl() {
		const date = new Date().toISOString();
		return `ynab-export-${currentBank.id}-${date}.csv`;
	}
</script>

<div id="container" style="background-color: {currentBank.secondaryColor};">
	<main>
		<Header bank={currentBank} />
		<section class="content">
			<div class="tabs">
				{#each banks as bank}
					<div
						class="bank-tab"
						style="background-color: {bank.color}; background-image: url({bank.icon})"
						on:click={() => setBank(bank.name)}
					>
						{bank.name}
					</div>
				{/each}
			</div>
			<div
				class="drop-zone {isDragging ? 'dragover-active' : ''}"
				style="background-color: {currentBank.color}; color: {currentBank.bodyColor}"
				on:dragenter={() => (isDragging = true)}
				on:dragover={(e) => e.preventDefault()}
				on:dragleave={() => (isDragging = false)}
				on:drop={handleDrop}
			>
				<div class="info-text" style="border-color: {currentBank.bodyColor}30">
					Drag & drop your CSV report from {currentBank.name} here
				</div>
			</div>
		</section>

		{#if fileDownloadUrl}
			<a
				href={fileDownloadUrl}
				download={getFileUrl()}
				class="download-button"
				style="background-color: {currentBank.bodyColor}; color: {currentBank.color}; border-color: {currentBank.color}"
				>Download file</a
			>
		{/if}
	</main>
</div>

<style>
	#container {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	main {
		width: 100%;
		padding: 1rem;
		max-width: 50rem;
	}

	.tabs {
		width: 100%;
		display: flex;
		gap: 0.5rem;
	}

	.bank-tab {
		padding: 1rem 2rem;
		cursor: pointer;
		border-radius: 0.5rem 0.5rem 0 0;
		background-size: 70%;
		background-repeat: no-repeat;
		background-position: center;
		color: transparent;
	}

	.drop-zone {
		padding: 2rem;
		border-radius: 0 0.8rem 0.8rem 0.8rem;
		text-align: center;
		text-transform: uppercase;
		font-weight: bold;
		font-size: 1.2rem;
		box-shadow: rgba(0, 0, 0, 0.463) 0 0 1rem;
	}

	.dragover-active {
		background-color: blueviolet;
	}

	.info-text {
		pointer-events: none;
		border: 3px dashed rgba(255, 255, 255, 0.2);
		padding: 3rem 2rem;
		border-radius: 1rem;
	}

	.download-button {
		display: block;
		margin: auto;
		max-width: 10rem;
		padding: 1.5rem;
		margin-top: 2rem;
		text-align: center;
		text-transform: uppercase;
		font-weight: bold;
		text-decoration: none;
		border-radius: 0.5rem;
		box-shadow: rgba(0, 0, 0, 0.275) 0 0 1rem;
		border: 2px solid #000;
	}
</style>
