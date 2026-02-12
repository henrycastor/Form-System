<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import { BarChart3, FileText } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Project - Default</title>
</svelte:head>

<Header activePage="home" />

<main class="main-content">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="features-section text-center">
          <div class="company-name mb-4">Company</div>

          <div class="row justify-content-center">
            <div class="col-md-4">
              <FeatureCard
                icon={BarChart3}
                title="Painel Administrativo"
                href="/painel_administracao"
              />
            </div>

            <div class="col-md-4">
              <FeatureCard icon={FileText} title="Formulários" href="/formularios" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Footer />

<style>
  /* Add any page specific styles here if needed, 
       but most should be covered by global styles and components */
  .company-name {
    font-weight: 700;
    font-size: 3rem;
    color: var(--primary-color);
  }

  .features-section {
    padding: 60px 0;
  }
</style>
