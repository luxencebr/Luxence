/**
 * Dispara um evento customizado para notificar que o perfil foi atualizado
 * Isso permite que componentes como ProfileCompletionChecklist atualizem automaticamente
 */
export function dispatchProfileUpdateEvent() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('profileUpdated', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }
}
