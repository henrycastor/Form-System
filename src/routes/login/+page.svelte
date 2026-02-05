<script lang="ts">
  import { enhance } from '$app/forms';
  import { ShieldCheck, Key, AlertCircle, ArrowRight, Loader2 } from 'lucide-svelte';

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

<div class="login-wrapper">
  <div class="login-card">
    <div class="login-header">
      <div class="logo-badge">
        <ShieldCheck size={32} strokeWidth={2.5} />
      </div>
      <h1>Acesso Restrito</h1>
      <p>Área exclusiva para administradores da Company</p>
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
      <div class="form-field">
        <label for="password">Chave de Acesso</label>
        <div class="input-container">
          <Key class="input-icon" size={20} />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Digite sua senha..."
            required
            disabled={isLoading}
          />
        </div>
        {#if errorMessage}
          <div class="error-toast">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        {/if}
      </div>

      <button type="submit" class="submit-btn" disabled={isLoading}>
        {#if isLoading}
          <Loader2 class="spin" size={20} /> Autenticando...
        {:else}
          Entrar no Painel <ArrowRight size={18} />
        {/if}
      </button>
    </form>

    <div class="login-footer">
      <p>&copy; 2026 Company. Todos os direitos reservados.</p>
    </div>
  </div>
</div>

<style>
  .login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-gradient);
    padding: var(--spacing-lg);
    position: relative;
    overflow: hidden;
  }

  .login-wrapper::before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: var(--secondary-color);
    filter: blur(150px);
    opacity: 0.2;
    top: -100px;
    left: -100px;
    border-radius: var(--radius-circle);
  }

  .login-wrapper::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: var(--accent-color);
    filter: blur(150px);
    opacity: 0.15;
    bottom: -150px;
    right: -150px;
    border-radius: var(--radius-circle);
  }

  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 48px;
    border-radius: var(--radius-xxl);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 440px;
    position: relative;
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.5);
    animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .login-header {
    text-align: center;
    margin-bottom: var(--spacing-xxl);
  }

  .logo-badge {
    width: 64px;
    height: 64px;
    background: var(--primary-bg-light);
    color: var(--primary-color);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg);
    box-shadow: var(--shadow-sm);
  }

  h1 {
    font-size: 1.75rem;
    color: var(--text-main);
    margin: 0 0 var(--spacing-xs);
    font-weight: 800;
    letter-spacing: -1px;
  }

  .login-header p {
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5;
  }

  .form-field {
    margin-bottom: var(--spacing-xl);
  }

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: var(--spacing-sm);
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 16px;
    color: var(--text-light);
    transition: var(--transition-fast);
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-weight: 500;
    transition: var(--transition-normal);
    outline: none;
    background: var(--white);
  }

  input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px var(--primary-bg-light);
  }

  input:focus + .input-icon {
    color: var(--primary-color);
  }

  .error-toast {
    color: var(--danger-color);
    background: #fdf2f2;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(220, 53, 69, 0.1);
    animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }
    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }
    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }
    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .submit-btn {
    width: 100%;
    padding: 16px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: var(--shadow-lg);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(0, 86, 166, 0.4);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .login-footer {
    margin-top: var(--spacing-xxl);
    text-align: center;
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-lg);
  }

  .login-footer p {
    font-size: 0.85rem;
    color: var(--text-light);
    margin: 0;
  }
</style>
