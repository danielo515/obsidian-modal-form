<script lang="ts">
    let { activeTab = $bindable(), tabs }: { activeTab: string; tabs: string[] } = $props();
</script>

<div class="tabs">
    {#each tabs as tab}
        <div class="tab-outer" class:active={tab === activeTab}>
            <button
                class="tab"
                onclick={() => {
                    activeTab = tab;
                }}
            >
                {tab}
            </button>
        </div>
    {/each}
</div>

<style>
    .tabs {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        padding-top: 0.15rem;
    }

    .tab {
        background: none;
        cursor: pointer;
        font-size: 1rem;
        color: var(--gray-700);
        border: none;
        outline: none;
        cursor: pointer;
        padding: 1rem;
        border-radius: 10px 10px 0 0; /* 0 0 = No border-radius at bottom */
        box-shadow: none;
        text-transform: capitalize;
        position: relative;
    }
    .tab::after {
        position: absolute;
        right: -0.5px;
        width: 1px;
        background-color: var(--tab-divider-color);
        content: " ";
        height: 20px;
    }

    button {
        appearance: none;
        border: none;
    }
    .tab-outer {
        padding: 1px 0px 3.5px;
        border-radius: var(--tab-radius-active);
    }

    .tab-outer.active {
        /* box-shadow: 0 0 0 var(--tab-outline-width) var(--tab-outline-color); */
        color: var(--tab-text-color-focused-active);
        background-color: var(--tab-background-active);
    }

    .tabs {
        background-color: var(--background-secondary);
    }

    /* Create an active/current tablink class */
    .tab-outer:hover {
        background-color: var(--background-modifier-border) !important;
    }
</style>
