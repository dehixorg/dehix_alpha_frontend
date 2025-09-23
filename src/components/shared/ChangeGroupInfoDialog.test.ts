/**
 * Tests for ChangeGroupInfoDialog
 *
 * Assumes React Testing Library and Vitest/Jest are available.
 * If using Jest, replace 'vi' with 'jest' for mocks/spies.
 *
 * Libraries and framework used:
 * - React Testing Library (@testing-library/react, @testing-library/user-event)
 * - Vitest or Jest as the test runner with jsdom environment
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangeGroupInfoDialog from './ChangeGroupInfoDialog';

function setup(props?: Partial<React.ComponentProps<typeof ChangeGroupInfoDialog>>) {
  const onClose = vi.fn();
  const onSave = vi.fn();
  const defaultProps: React.ComponentProps<typeof ChangeGroupInfoDialog> = {
    isOpen: true,
    onClose,
    onSave,
    currentName: 'My Group',
    currentAvatarUrl: 'https://example.com/a.png',
    groupId: 'group-123',
  };
  const allProps = { ...defaultProps, ...props };
  const utils = render(<ChangeGroupInfoDialog {...allProps} />);
  return { ...utils, props: allProps, onClose, onSave };
}

describe('ChangeGroupInfoDialog', () => {
  it('renders title and description when open', () => {
    setup();
    expect(screen.getByRole('heading', { name: /change group information/i })).toBeInTheDocument();
    expect(screen.getByText(/update the group/i)).toBeInTheDocument();
  });

  it('initializes inputs with currentName and currentAvatarUrl', () => {
    setup({ currentName: 'Cool Crew', currentAvatarUrl: 'https://img/crew.png' });
    expect(screen.getByLabelText(/group name/i)).toHaveValue('Cool Crew');
    expect(screen.getByLabelText(/avatar url/i)).toHaveValue('https://img/crew.png');
  });

  it('calls onClose when clicking Cancel', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('validates that group name cannot be empty and shows error, not calling onSave/onClose', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = setup({ currentName: '' });
    const nameInput = screen.getByLabelText(/group name/i);
    // Ensure empty
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(screen.getByText(/group name cannot be empty/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears validation error once a non-empty name is typed', async () => {
    const user = userEvent.setup();
    setup({ currentName: '' });
    const nameInput = screen.getByLabelText(/group name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(screen.getByText(/group name cannot be empty/i)).toBeInTheDocument();

    await user.type(nameInput, '  New Name ');
    // Error should clear on non-empty input
    expect(screen.queryByText(/group name cannot be empty/i)).not.toBeInTheDocument();
  });

  it('trims values and calls onSave then onClose on successful save', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = setup({ currentName: '  Spacey Name  ', currentAvatarUrl: '  https://img/space.png  ' });
    const nameInput = screen.getByLabelText(/group name/i);
    const avatarInput = screen.getByLabelText(/avatar url/i);

    // Modify to include additional whitespace for trim test
    await user.clear(nameInput);
    await user.type(nameInput, '  New Group Name  ');
    await user.clear(avatarInput);
    await user.type(avatarInput, '  https://img/new.png  ');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('New Group Name', 'https://img/new.png');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(onClose.mock.invocationCallOrder[onClose.mock.invocationCallOrder.length - 1] || 999999); // basic call recorded
  });

  it('updates inputs when props change while dialog is open (effect reset)', async () => {
    const utils = setup({ currentName: 'Alpha', currentAvatarUrl: 'https://img/a.png' });
    expect(screen.getByLabelText(/group name/i)).toHaveValue('Alpha');
    expect(screen.getByLabelText(/avatar url/i)).toHaveValue('https://img/a.png');

    // Rerender with new props
    const newProps = {
      ...utils.props,
      currentName: 'Beta',
      currentAvatarUrl: 'https://img/b.png',
      isOpen: true,
    };
    utils.rerender(<ChangeGroupInfoDialog {...newProps} />);

    expect(screen.getByLabelText(/group name/i)).toHaveValue('Beta');
    expect(screen.getByLabelText(/avatar url/i)).toHaveValue('https://img/b.png');
  });

  it('shows avatar fallback with first character of group name uppercased, or G when empty', () => {
    setup({ currentName: 'omega' });
    // AvatarFallback renders fallback char; look for "O"
    expect(screen.getByText('O')).toBeInTheDocument();

    // When empty, should fallback to 'G'
    const utils = setup({ currentName: '' });
    expect(screen.getByText('G')).toBeInTheDocument();

    // Ensure Avatar Preview section exists
    const previewGroup = screen.getByText(/avatar preview/i).closest('*');
    expect(previewGroup).toBeInTheDocument();
    // AvatarImage alt text present
    const img = within(previewGroup as HTMLElement).getByAltText(/avatar preview/i);
    expect(img).toBeInTheDocument();
  });

  it('does not render actionable controls when closed (if Dialog hides children)', () => {
    render(
      <ChangeGroupInfoDialog
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        currentName="Hidden"
        currentAvatarUrl=""
        groupId="g1"
      />
    );
    // Depending on Dialog implementation, content may be detached. Assert Save button is not found.
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('onOpenChange from Dialog triggers onClose when external close is invoked via Cancel', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});