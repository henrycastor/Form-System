<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import FormCard from '$lib/components/FormCard.svelte';
  import BackButton from '$lib/components/BackButton.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { forms } from '$lib/form/forms';
</script>

<svelte:head>
  <title>Formulários - Project</title>
</svelte:head>

<Header activePage="forms" />

<main class="main-content">
  <div class="container">
    <BackButton />

    <PageHeader
      center={true}
      title="Formulários"
      subtitle="Selecione um dos formulários abaixo para preenchimento."
    />

    <div class="forms-container">
      <div class="forms-grid">
        {#each forms as form, i (form.id)}
          <FormCard
            title={form.title}
            description={form.description}
            icon={form.icon}
            href={form.href}
            colorIndex={(i % 6) + 1}
          />
        {/each}
      </div>
    </div>
  </div>
</main>

<Footer />

<style>
  /* Page Specifics */
  .forms-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    width: 100%;
  }

  /* Grid Layout */
  .forms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-full);
  }
</style>
