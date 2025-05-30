interface ConfirmButtonProps {
  onConfirm: () => void;
}

const ConfirmButton = ({ onConfirm }: ConfirmButtonProps) => (
  <button
    onClick={onConfirm}
    className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg"
  >
    Confirm
  </button>
);

export default ConfirmButton;
