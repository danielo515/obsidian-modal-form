<script lang="ts">
    export let allowWrap: boolean = false;
</script>
<div>
    <pre><code class:allowWrap><slot /></code></pre>
</div>

<style>
    pre {
        background-color: var(--background-secondary);
        border-radius: var(--border-radius);
        padding: 0.5rem;
    }
    code {
        font-family: var(--font-family-monospace);
    }
    code.allowWrap {
        white-space: pre-wrap;
    }
    div {
        display: flex;
    }
</style>
