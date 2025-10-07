import styled from 'styled-components';

export const TextField = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--ds-radius-lg);
  border: 1px solid var(--ds-border);
  background: var(--ds-bg);
  &::placeholder { color: var(--ds-muted); }
  &:focus-visible { outline: 2px solid var(--ds-focus); }
`;
