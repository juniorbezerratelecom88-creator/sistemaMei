import { adjustLightness } from './color-utils';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Aplica a identidade visual da empresa (cor primária/secundária) como
 * variáveis CSS no elemento raiz. Sem cores definidas, não faz nada e o
 * painel mantém o gradiente índigo/violeta padrão declarado em globals.css.
 */
export function applyBrandTheme(empresa?: { corPrimaria?: string | null; corSecundaria?: string | null } | null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const primaria = empresa?.corPrimaria;
  const secundaria = empresa?.corSecundaria;

  if (primaria && HEX_PATTERN.test(primaria)) {
    root.style.setProperty('--brand-primary', primaria);
    root.style.setProperty('--brand-primary-hover', adjustLightness(primaria, -10));
  } else {
    root.style.removeProperty('--brand-primary');
    root.style.removeProperty('--brand-primary-hover');
  }

  if (secundaria && HEX_PATTERN.test(secundaria)) {
    root.style.setProperty('--brand-secondary', secundaria);
  } else {
    root.style.removeProperty('--brand-secondary');
  }
}
