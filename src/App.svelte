<script lang="ts">
  import "./app.css";
  import type { Bank } from "./types";
  import { getDownloadLink, getYnabCsv } from "./lib/csvFileTools";
  import { preprocessKbData } from "./lib/getKbData";
  import { preprocessKbPlusData } from "./lib/getKbPlusData";

  import Header from "./components/Header.svelte";

  import airBankLogo from "../assets/airbank-logo.png";
  import kbLogo from "../assets/kb-logo.png";
  import kbPlusLogo from "../assets/kbplus.png";

  type HistoryEntry = {
    id: number;
    sourceName: string;
    downloadUrl: string;
    downloadName: string;
    bankName: string;
    bankColor: string;
    bankBodyColor: string;
    rowCount: number;
    processedAt: Date;
    downloaded: boolean;
  };

  let isDragging = false;
  let history: HistoryEntry[] = [];
  let nextId = 0;
  let processingError: string | null = null;

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
      id: "kb-plus",
      name: "KB Plus",
      color: "#FFFFFF",
      secondaryColor: "#000000",
      bodyColor: "#000000",
      icon: kbPlusLogo,
      preprocessFunction: preprocessKbPlusData,
    },
    {
      id: "kb",
      name: "KB",
      color: "#FFFFFF",
      secondaryColor: "#CC0033",
      bodyColor: "#CC0033",
      icon: kbLogo,
      preprocessFunction: preprocessKbData,
    },
  ];

  let currentBank = banks[0];

  function setBank(bankName: string) {
    const bank = banks.find((bank) => bank.name === bankName);
    currentBank = bank ?? currentBank;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();

    isDragging = false;
    if (event.dataTransfer?.items.length !== 1) {
      return;
    }

    const item = event.dataTransfer.items[0];
    const sourceName = item.kind === "file" ? item.getAsFile()?.name : undefined;

    try {
      const csv = await getYnabCsv(item, currentBank);
      const url = await getDownloadLink(csv);
      history = [
        {
          id: nextId++,
          sourceName: sourceName ?? "unknown",
          downloadUrl: url,
          downloadName: getFileName(),
          bankName: currentBank.name,
          bankColor: currentBank.color,
          bankBodyColor: currentBank.bodyColor,
          rowCount: Math.max(0, csv.length - 1),
          processedAt: new Date(),
          downloaded: false,
        },
        ...history,
      ];
      processingError = null;
    } catch (error) {
      processingError = "There was an error processing the file";
    }
  }

  function markDownloaded(id: number) {
    history = history.map((h) =>
      h.id === id ? { ...h, downloaded: true } : h,
    );
  }

  // A small list of neutral words used to give each export a friendly, unique tag.
  const NAME_WORDS = [
    "brave", "quiet", "swift", "sunny", "bright", "calm", "lucky", "merry",
    "amber", "azure", "cosmic", "gentle", "noble", "rapid", "vivid", "zesty",
    "otter", "river", "willow", "meadow", "harbor", "comet", "falcon", "maple",
    "pebble", "cedar", "lantern", "compass", "marble", "orchard",
  ];

  function randomWords(count = 2): string {
    const pool = [...NAME_WORDS];
    const out: string[] = [];
    for (let i = 0; i < count && pool.length; i++) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out.join("-");
  }

  function getFileName(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}${pad(d.getMinutes())}`;
    const bank = currentBank.id.replace(/_/g, "-");
    return `ynab-${bank}-${date}-${time}-${randomWords()}.csv`;
  }
</script>

<div id="container" style="background-color: {currentBank.secondaryColor};">
  <main>
    <Header bank={currentBank} />
    <section class="content">
      <div class="tabs">
        {#each banks as bank}
          <button
            class="bank-tab"
            style="background-color: {bank.color}; background-image: url({bank.icon})"
            on:click={() => setBank(bank.name)}
          >
            {bank.name}
          </button>
        {/each}
      </div>
      <div
        class="drop-zone {isDragging ? 'dragover-active' : ''}"
        style="background-color: {currentBank.color}; color: {currentBank.bodyColor}"
        role="button"
        tabindex="0"
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

    {#if processingError}
      <p class="error-message">{processingError}</p>
    {/if}

    {#if history.length}
      <section class="history">
        <h2 class="history-title">History</h2>
        <ul class="history-list">
          {#each history as entry (entry.id)}
            <li
              class="history-item {entry.downloaded ? 'is-done' : ''}"
              style="--accent: {entry.bankColor};"
            >
              <div class="history-info">
                <span class="history-name">{entry.sourceName}</span>
                <span class="history-meta">
                  <span class="history-bank">{entry.bankName}</span>
                  <span class="history-dot">·</span>
                  {entry.rowCount} rows
                  <span class="history-dot">·</span>
                  {entry.processedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div class="history-action">
                {#if entry.downloaded}
                  <span class="history-done">✓ Downloaded</span>
                {/if}
                <a
                  href={entry.downloadUrl}
                  download={entry.downloadName}
                  class="download-button {entry.downloaded ? 'is-secondary' : ''}"
                  style="background-color: {entry.bankBodyColor}; color: {entry.bankColor}; border-color: {entry.bankColor}"
                  on:click={() => markDownloaded(entry.id)}
                  >{entry.downloaded ? "Download again" : "Download"}</a
                >
              </div>
            </li>
          {/each}
        </ul>
      </section>
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
    padding: 2rem 0;
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
    border: none;
    text-indent: -9999px;
    overflow: hidden;
    white-space: nowrap;
    width: 100px;
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

  .error-message {
    margin-top: 2rem;
    background: rgba(169, 19, 29, 0.5);
    padding: 0.75rem 1rem;
    border-radius: 0.4rem;
  }

  .history {
    margin-top: 2rem;
  }

  .history-title {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.65;
  }

  .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    background: rgba(0, 0, 0, 0.18);
    border-left: 4px solid var(--accent);
    border-radius: 0.55rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0 0.15rem 0.6rem;
    backdrop-filter: blur(2px);
    transition:
      opacity 0.2s,
      background 0.2s;
  }

  /* Freshly added entry sits at the top and briefly announces itself. */
  .history-item:first-child {
    animation: history-in 0.45s ease;
  }

  @keyframes history-in {
    from {
      opacity: 0;
      transform: translateY(-0.4rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .history-item.is-done {
    opacity: 0.62;
  }

  .history-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .history-name {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-meta {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .history-bank {
    font-weight: 600;
  }

  .history-dot {
    opacity: 0.5;
    margin: 0 0.15rem;
  }

  .history-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .history-done {
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.8;
    white-space: nowrap;
  }

  .download-button {
    display: block;
    padding: 0.7rem 1.4rem;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.85rem;
    text-decoration: none;
    white-space: nowrap;
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.275) 0 0 1rem;
    border: 2px solid #000;
    transition:
      transform 0.1s,
      filter 0.1s;
  }

  .download-button:hover {
    filter: brightness(1.1);
    transform: scale(1.05);
  }

  .download-button.is-secondary {
    padding: 0.45rem 0.9rem;
    font-size: 0.75rem;
    box-shadow: none;
    opacity: 0.85;
  }
</style>
