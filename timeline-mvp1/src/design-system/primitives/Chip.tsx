import styled from 'styled-components';

export const Chip = styled.button<{ selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--ds-radius-pill);
  border: 1px solid var(--ds-border);
  background: ${p => p.selected ? '#eef2ff' : 'var(--ds-bg-subtle)'};
  &:hover { background: #eef2f7; }
`;
