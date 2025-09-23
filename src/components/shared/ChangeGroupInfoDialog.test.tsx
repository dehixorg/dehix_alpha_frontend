/**
 * Tests for ChangeGroupInfoDialog
 *
 * Framework/Libraries:
 * - React Testing Library (render, screen, within, fireEvent/userEvent)
 * - Jest or Vitest (whichever the repo uses; this test uses standard syntax compatible with both)
 * - jest-dom matchers assumed if configured globally (toBeInTheDocument, toHaveAttribute, etc.)
 *
 * Scenarios covered:
 * - Renders when open with correct title/description and initial values
 * - Validation prevents saving empty/whitespace name and shows error
 * - Error clears when user types a valid name after validation error
 * - Successful save calls onSave with trimmed values and then calls onClose
 * - Cancel button triggers onClose
 * - Avatar fallback character from groupName's first letter uppercased; defaults to "G" when empty
 * - Resets internal state when props change while dialog is open
 * - Updates avatar image src as user types URL
 */
 
import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangeGroupInfoDialog from './ChangeGroupInfoDialog';
 
function setup(props?: Partial<React.ComponentProps<typeof ChangeGroupInfoDialog>>) {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const defaultProps: React.ComponentProps<typeof ChangeGroupInfoDialog> = {
    isOpen: true,
    onClose,
    onSave,
    currentName: 'Alpha team',
    currentAvatarUrl: 'https://example.com/a.png',
    groupId: 'group-1',
  };
  const allProps = { ...defaultProps, ...props };
  const ui = render(<ChangeGroupInfoDialog {...allProps} />);
  return { onClose, onSave, props: allProps, ...ui };
}
 
describe('ChangeGroupInfoDialog', () => {
  test('renders title, description, and initial field values when open', () => {
    setup();
 
    // Title and description
    expect(
      screen.getByRole('heading', { name: /change group information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/update the group's name and avatar url\./i)
    ).toBeInTheDocument();
 
    // Inputs populated from props
    const nameInput = screen.getByLabelText(/group name/i) as HTMLInputElement;
    const avatarInput = screen.getByLabelText(/avatar url/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Alpha team');
    expect(avatarInput.value).toBe('https://example.com/a.png');
  });
 
  test('does not render dialog content when closed', () => {
    render(
      <ChangeGroupInfoDialog
        isOpen={false}
        onClose={jest.fn()}
        onSave={jest.fn()}
        currentName="Closed Group"
        currentAvatarUrl=""
        groupId="g2"
      />
    );
    expect(
      screen.queryByRole('heading', { name: /change group information/i })
    ).not.toBeInTheDocument();
  });
 
  test('validation: prevents saving empty or whitespace-only name and shows error', async () => {
    const user = userEvent.setup();
    const { onClose, onSave } = setup({ currentName: 'Start Name' });
 
    const nameInput = screen.getByLabelText(/group name/i) as HTMLInputElement;
 
    // Make name empty and try to save
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
 
    expect(
      screen.getByText(/group name cannot be empty\./i)
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
 
    // Make name whitespace and try again
    await user.type(nameInput, '   ');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
 
    expect(
      screen.getByText(/group name cannot be empty\./i)
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
 
  test('error clears when user types a valid name after validation error', async () => {
    const user = userEvent.setup();
    setup({ currentName: 'Valid Name' });
 
    const nameInput = screen.getByLabelText(/group name/i) as HTMLInputElement;
 
    // Trigger validation error first
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(
      screen.getByText(/group name cannot be empty\./i)
    ).toBeInTheDocument();
 
    // Now type a valid value; component should clear error on change
    await user.type(nameInput, 'New Group');
    expect(
      screen.queryByText(/group name cannot be empty\./i)
    ).not.toBeInTheDocument();
    expect(nameInput.value).toBe('New Group');
  });
 
  test('successful save calls onSave with trimmed values and then onClose', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = setup({
      currentName: 'Alpha team',
      currentAvatarUrl: ' https://avatar.io/p.png ',
    });
 
    const nameInput = screen.getByLabelText(/group name/i) as HTMLInputElement;
    const avatarInput = screen.getByLabelText(/avatar url/i) as HTMLInputElement;
 
    // Edit fields with surrounding whitespace to test .trim()
    await user.clear(nameInput);
    await user.type(nameInput, '  New Name  ');
    await user.clear(avatarInput);
    await user.type(avatarInput, '   https://cdn.example.com/x.png   ');
 
    await user.click(screen.getByRole('button', { name: /save changes/i }));
 
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('New Name', 'https://cdn.example.com/x.png');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
 
  test('cancel button triggers onClose without calling onSave', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = setup();
 
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
 
  test('avatar fallback uses first letter of group name uppercased; defaults to "G"', async () => {
    // With a name "Alpha team", fallback should be "A"
    setup({ currentName: 'Alpha team', currentAvatarUrl: '' });
 
    // The fallback character should be visible
    expect(screen.getByText('A')).toBeInTheDocument();
 
    // Rerender with empty name to pick default "G"
    const onClose = jest.fn();
    const onSave = jest.fn();
    const { rerender } = render(
      <ChangeGroupInfoDialog
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentName=""
        currentAvatarUrl=""
        groupId="g3"
      />
    );
 
    // Effect runs on isOpen/currentName/currentAvatarUrl change, so state resets
    expect(screen.getByText('G')).toBeInTheDocument();
  });
 
  test('avatar image src updates as user types URL in the Avatar URL input', async () => {
    const user = userEvent.setup();
    setup({ currentAvatarUrl: '' });
 
    const avatarInput = screen.getByLabelText(/avatar url/i) as HTMLInputElement;
 
    await user.type(avatarInput, 'https://img.example.com/1.png');
 
    // AvatarImage uses alt="Avatar Preview"
    const image = screen.getByAltText('Avatar Preview') as HTMLImageElement;
    expect(image).toHaveAttribute('src', 'https://img.example.com/1.png');
  });
 
  test('resets input values when props change while dialog is open', async () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    const { rerender } = render(
      <ChangeGroupInfoDialog
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentName="Team One"
        currentAvatarUrl="https://one.png"
        groupId="g4"
      />
    );
 
    // Change internal inputs away from prop values
    const nameInput = await screen.findByLabelText(/group name/i) as HTMLInputElement;
    const avatarInput = screen.getByLabelText(/avatar url/i) as HTMLInputElement;
    await act(async () => {
      nameInput.focus();
      nameInput.setSelectionRange(0, nameInput.value.length);
      document.execCommand?.('insertText', false, 'Edited Name'); // best-effort; ignore if not supported
    });
    // Fallback if execCommand is unavailable, use fireEvent via userEvent
    if (nameInput.value !== 'Edited Name') {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Edited Name');
    }
    await userEvent.clear(avatarInput);
    await userEvent.type(avatarInput, 'https://edited.png');
 
    expect(nameInput.value).toBe('Edited Name');
    expect(avatarInput.value).toBe('https://edited.png');
 
    // Update props; effect should reset internal state back to new props
    rerender(
      <ChangeGroupInfoDialog
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentName="Team Two"
        currentAvatarUrl="https://two.png"
        groupId="g4"
      />
    );
 
    expect((await screen.findByLabelText(/group name/i)).value).toBe('Team Two');
    expect((screen.getByLabelText(/avatar url/i) as HTMLInputElement).value).toBe('https://two.png');
  });
});