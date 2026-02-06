<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';

  const {
    title,
    description,
    icon: Icon,
    href = '#',
    colorIndex = 1,
  }: {
    title: string;
    description: string;
    icon: any;
    href?: string;
    colorIndex?: number;
  } = $props();
</script>

<a {href} class="form-card-link" data-sveltekit-preload-data="hover">
  <div class="form-card variant-{colorIndex}">
    <div class="form-icon">
      <Icon size={40} />
    </div>
    <h3 class="form-title">{title}</h3>
    <div class="form-btn">
      Acessar <ArrowRight class="ms-2" size={18} />
    </div>
  </div>
</a>

<style>
  @import '$lib/css/_color-variants.css';

  .form-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
  }

  .form-card {
    background-color: var(--white);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    transition: var(--transition-normal);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-top: 6px solid var(--primary-color);
    height: 100%;
  }

  .form-card:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-hover);
  }

  .form-icon {
    background-color: var(--light-bg);
    color: var(--primary-color);
    width: 80px;
    height: 80px;
    border-radius: var(--radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-xl);
    font-size: 2.5rem;
    transition: var(--transition-normal);
  }

  .form-card:hover .form-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .form-title {
    color: var(--primary-color);
    font-weight: 700;
    font-size: 1.4rem;
    margin-bottom: var(--spacing-md);
  }

  .form-description {
    color: var(--text-muted);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
    flex-grow: 1;
    font-size: 1.05rem;
  }

  .form-btn {
    background-color: var(--primary-color);
    color: var(--white);
    border: none;
    padding: var(--spacing-sm) var(--spacing-xl);
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: var(--transition-normal);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: 100%;
    margin-top: auto;
  }

  .form-card:hover .form-btn {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    opacity: 0.9;
  }
</style>
