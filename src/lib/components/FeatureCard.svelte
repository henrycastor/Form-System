<script lang="ts">
  import type { Component } from 'svelte';

  const {
    icon: Icon,
    title,
    href = '#',
    buttonText = 'Acessar',
  }: {
    icon: Component;
    title: string;
    href?: string;
    buttonText?: string;
  } = $props();
</script>

<div class="feature-item">
  <div class="feature-icon">
    <Icon size={32} strokeWidth={2.5} />
  </div>
  <h4>{title}</h4>
  <a class="btn btn-primary btn-lg" {href}>{buttonText}</a>
</div>

<style>
  .feature-item {
    padding: var(--spacing-lg);
    border-radius: var(--radius-sm);
    transition: var(--transition-normal);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .feature-item:hover {
    transform: translateY(-5px);
    background-color: var(--light-bg);
  }

  .feature-icon {
    background-color: var(--accent-color);
    color: var(--white);
    width: 70px;
    height: 70px;
    border-radius: var(--radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-md);
    font-size: 1.8rem;
  }
</style>
