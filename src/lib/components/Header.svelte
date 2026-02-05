<script lang="ts">
  import { page } from '$app/state';
  import { enhance } from '$app/forms';
  import { Star, House, LayoutDashboard, FileText, LogOut } from 'lucide-svelte';

  let { activePage = '' }: { activePage?: string } = $props();
  let isAuthenticated = $derived(!!page.data.isAuthenticated);
</script>

<header class="company-header">
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <a class="navbar-brand" href="/">
        <Star
          class="me-2"
          size={28}
          strokeWidth={2.5}
          fill="var(--secondary-color)"
          color="var(--secondary-color)"
        /> Company
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-label="Menu de navegação"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link {activePage === 'home' ? 'active' : ''}" href="/"
              ><House class="me-2" size={18} />Tela Inicial</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link {activePage === 'admin' ? 'active' : ''}"
              href="/painel_administracao"
              ><LayoutDashboard class="me-2" size={18} />Painel Administrador</a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link {activePage === 'forms' ? 'active' : ''}" href="/formularios"
              ><FileText class="me-2" size={18} />Formulários</a
            >
          </li>
          {#if isAuthenticated}
            <li class="nav-item">
              <form method="POST" action="/logout" use:enhance>
                <button class="nav-link btn-logout" type="submit">
                  <LogOut class="me-2" size={18} />Sair
                </button>
              </form>
            </li>
          {/if}
        </ul>
      </div>
    </div>
  </nav>
</header>

<style>
  .company-header {
    background-color: var(--primary-color);
    background: var(--primary-gradient);
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .navbar-brand {
    font-weight: 800;
    font-size: 1.8rem;
    color: white !important;
    display: flex;
    align-items: center;
    letter-spacing: -0.5px;
  }

  .navbar-brand :global(svg) {
    filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.4));
    transition: var(--transition-normal);
  }

  .navbar-brand:hover :global(svg) {
    transform: rotate(15deg) scale(1.1);
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.85) !important;
    font-weight: 600;
    padding: 10px 20px !important;
    margin: 0 4px;
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
  }

  .nav-link:hover {
    background-color: rgba(255, 255, 255, 0.12);
    color: white !important;
    transform: translateY(-1px);
  }

  .nav-link.active {
    background-color: white;
    color: var(--primary-color) !important;
    box-shadow: var(--shadow-sm);
  }

  .btn-logout {
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  @media (max-width: 991px) {
    .nav-link {
      margin: 5px 0;
    }
  }
</style>
