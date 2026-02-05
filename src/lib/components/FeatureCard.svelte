<script lang="ts">
  import type { Component } from 'svelte';

  const {
    icon: Icon,
    title,
    href = '#',
    buttonText = 'Acessar',
  }: {
    icon: any;
    title: string;
    href?: string;
    buttonText?: string;
  } = $props();
</script>

<div class="feature-item">
  <div class="feature-icon">
    <Icon size={32} strokeWidth={2.5} />
  </div>
  <h3>{title}</h3>
  <a class="btn-feature" {href}>{buttonText}</a>
</div>

<style>
  .feature-item {
    background: white;
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    transition: var(--transition-normal);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    text-align: center;
    height: 100%;
    justify-content: space-between;
  }

  .feature-item:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color);
  }

  .feature-icon {
    background-color: var(--primary-bg-light);
    color: var(--primary-color);
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg);
    transition: var(--transition-normal);
  }

  .feature-item:hover .feature-icon {
    background-color: var(--primary-color);
    color: white;
    transform: scale(1.1) rotate(5deg);
    box-shadow: var(--shadow-glow);
  }

  h3 {
    font-size: 1.4rem;
    color: var(--text-main);
    margin-bottom: var(--spacing-lg);
    font-weight: 700;
  }

  .btn-feature {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: var(--radius-full);
    font-weight: 600;
    text-decoration: none;
    transition: var(--transition-fast);
    box-shadow: var(--shadow-sm);
    width: 100%;
  }

  .btn-feature:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
</style>
