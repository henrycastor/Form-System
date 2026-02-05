<script lang="ts">
  import { enhance } from '$app/forms';
  import { ShieldCheck, Key, AlertCircle } from 'lucide-svelte';

  let { form } = $props();
  let isLoading = $state(false);
  let errorMessage = $derived(
    form?.incorrect
      ? 'Senha incorreta. Tente novamente.'
      : form?.missing
        ? 'Por favor, insira a senha.'
        : ''
  );
</script>

<div class="login-page">
  <div class="login-card">
    <div class="login-header">
      <div class="logo-container">
        <ShieldCheck size={32} />
      </div>
      <h1>Acesso Restrito</h1>
      <p>Digite a senha para acessar o painel administrativo</p>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        isLoading = true;
        return async ({ update }) => {
          await update();
          isLoading = false;
        };
      }}
      class="login-form"
    >
      <div class="form-group">
        <label for="password">Senha</label>
        <div class="input-wrapper">
          <Key class="input-icon" size={20} />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Digite a senha..."
            required
          />
        </div>
        {#if errorMessage}
          <div class="error-message">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        {/if}
      </div>

      <button type="submit" class="login-button" disabled={isLoading}>
        {#if isLoading}
          <span class="spinner"></span> Verificando...
        {:else}
          Acessar Painel
        {/if}
      </button>
    </form>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0056a6 0%, #34b5e5 100%);
    padding: 20px;
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
  }

  .login-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .logo-container {
    width: 60px;
    height: 60px;
    background: rgba(0, 86, 166, 0.1);
    color: #0056a6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin: 0 auto 15px;
  }

  h1 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: 700;
  }

  p {
    color: #666;
    font-size: 0.9rem;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
    margin-bottom: 8px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-wrapper :global(.input-icon) {
    position: absolute;
    left: 15px;
    color: #999;
  }

  input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    outline: none;
  }

  input:focus {
    border-color: #0056a6;
    box-shadow: 0 0 0 4px rgba(0, 86, 166, 0.1);
  }

  .error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .login-button {
    width: 100%;
    padding: 14px;
    background: #0056a6;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .login-button:hover {
    background: #004485;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 86, 166, 0.3);
  }

  .login-button:active {
    transform: translateY(0);
  }

  .login-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
