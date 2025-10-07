import styled from 'styled-components';

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--ds-radius-lg);
  border: 1px solid transparent;
  padding: ${p => p.size === 'sm' ? '6px 10px' : '8px 14px'};
  font-size: var(--ds-fs-md);
  background: ${p => p.variant === 'primary' ? 'var(--ds-primary)' : 'var(--ds-bg)'};
  color: ${p => p.variant === 'primary' ? '#fff' : 'var(--ds-fg)'};
  &:hover { filter: brightness(0.98); }
  &:focus-visible { outline: 2px solid var(--ds-focus); outline-offset: 2px; }
`;
