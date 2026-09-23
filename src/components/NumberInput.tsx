import type { KeyboardEvent } from 'react';

type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  label?: string;
  className?: string;
};

export default function NumberInput({
  value,
  onChange,
  onSubmit,
  autoFocus,
  label,
  className = '',
}: NumberInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ''));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmit?.();
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1 text-sm text-[#1B2A4A]/80">{label}</label>
      )}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className="w-24 rounded border border-[#D9D6CE] bg-white px-3 py-2 text-center text-2xl tabular-nums text-[#1B2A4A] outline-none transition-colors focus:border-[#2F5FD0] focus:ring-2 focus:ring-[#2F5FD0]/20"
      />
    </div>
  );
}
