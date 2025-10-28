import React from 'react';
import { Button } from '../../design-system/primitives/Button';
import { TextField } from '../../design-system/primitives/TextField';
import { Chip } from '../../design-system/primitives/Chip';
import { Popover } from '../../design-system/primitives/Popover';

export default {
  title: 'Design System/Primitives',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/...'
    }
  }
};

export const ButtonVariants = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
  </div>
);

export const TextFieldExample = () => (
  <div style={{ width: '300px' }}>
    <TextField placeholder="Enter text..." />
  </div>
);

export const ChipVariants = () => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <Chip>Default Chip</Chip>
    <Chip selected>Selected Chip</Chip>
    <Chip>📅 Date</Chip>
    <Chip selected>🏥 Medical Entity</Chip>
  </div>
);

export const PopoverExample = () => (
  <Popover
    id="popover-example"
    trigger={<Button>Open Popover</Button>}
  >
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Popover Content</h3>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--ds-muted)' }}>
        This is popover content with design system styling.
      </p>
    </div>
  </Popover>
);
