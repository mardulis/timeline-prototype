import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box;}
  body{
    margin:0;background:var(--ds-bg);color:var(--ds-fg);
    font-family:var(--ds-font-body);line-height:var(--ds-lh-normal);
  }
  a{color:var(--ds-accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
`;
