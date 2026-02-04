<script lang="ts">
  import { page } from '$app/state';
  import { enhance } from '$app/forms';

  let { activePage = '' }: { activePage?: string } = $props();
  let isAuthenticated = $derived(!!page.data.isAuthenticated);
</script>

<header class="company-header">
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <a class="navbar-brand" href="/">
        <i class="bi bi-star-fill"></i> Company
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
              ><i class="bi bi-house-door me-2"></i>Tela Inicial</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link {activePage === 'admin' ? 'active' : ''}"
              href="/painel_administracao"
              ><i class="bi bi-speedometer2 me-2"></i>Painel Administrador</a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link {activePage === 'forms' ? 'active' : ''}" href="/formularios"
              ><i class="bi bi-file-text me-2"></i>Formulários</a
            >
          </li>
          {#if isAuthenticated}
            <li class="nav-item">
              <form method="POST" action="/logout" use:enhance>
                <button class="nav-link btn-logout" type="submit">
                  <i class="bi bi-box-arrow-right me-2"></i>Sair
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .navbar-brand {
    font-weight: 700;
    font-size: 1.8rem;
    color: white !important;
    display: flex;
    align-items: center;
  }

  .navbar-brand i {
    color: var(--secondary-color);
    margin-right: 10px;
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 500;
    padding: 8px 16px !important;
    margin: 0 5px;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .nav-link:hover,
  .nav-link.active {
    background-color: rgba(255, 255, 255, 0.15);
    color: white !important;
  }

  .btn-logout {
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }
</style>
