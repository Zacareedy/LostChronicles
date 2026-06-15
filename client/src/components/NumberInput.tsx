import React, { useRef, useState, useCallback } from 'react';

interface NumberInputProps {
  onSuccess: (vals: number[]) => void;
  onWrong: (vals: number[], special: string | null) => void;
}

const CORRECT = [4, 8, 15, 16, 23, 42];

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--bd)',
  background: 'var(--panel)',
  padding: '16px 20px',
  display: 'inline-block',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'VT323', monospace",
  fontSize: '9px',
  letterSpacing: '5px',
  textTransform: 'uppercase',
  color: 'var(--ph-dim)',
  marginBottom: '12px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const buttonStyle: React.CSSProperties = {
  fontFamily: "'VT323', monospace",
  border: '1px solid var(--bd2)',
  color: 'var(--ph)',
  background: 'var(--panel)',
  padding: '6px 24px',
  marginTop: '12px',
  cursor: 'pointer',
  borderRadius: 0,
};

const NumberInput: React.FC<NumberInputProps> = ({ onSuccess, onWrong }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [fieldClasses, setFieldClasses] = useState<string[]>(Array(6).fill('nf'));
  const [rowClass, setRowClass] = useState<string>('');
  const [btnHover, setBtnHover] = useState(false);

  const clearFields = useCallback(() => {
    inputRefs.current.forEach((el) => {
      if (el) el.value = '';
    });
  }, []);

  const handleChange = (index: number) => {
    const el = inputRefs.current[index];
    if (!el) return;
    // enforce maxLength 2
    if (el.value.length > 2) {
      el.value = el.value.slice(0, 2);
    }
    if (el.value.length === 2 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      validate();
    }
  };

  const validate = useCallback(() => {
    const rawVals = inputRefs.current.map((el) => (el ? el.value.trim() : ''));
    if (rawVals.some((v) => v === '')) return;

    const vals = rawVals.map(Number);

    const applyAndClear = (
      classes: string[],
      classToAdd: string,
      flashMs: number,
      shakeRow: boolean,
      callback: () => void,
    ) => {
      if (shakeRow) {
        setRowClass('num-row-shake');
        setTimeout(() => setRowClass(''), 400);
      }
      setFieldClasses(classes.map(() => `nf ${classToAdd}`));
      setTimeout(() => {
        setFieldClasses(Array(6).fill('nf'));
        clearFields();
        callback();
      }, flashMs);
    };

    if (vals.every((v) => v === 0)) {
      applyAndClear(vals, 'flash-err', 800, true, () => onWrong(vals, 'null_sequence'));
      return;
    }

    if (vals[0] === 42 && vals[5] === 4) {
      applyAndClear(vals, 'flash-err', 800, true, () => onWrong(vals, 'inverted'));
      return;
    }

    const isCorrect = vals.every((v, i) => v === CORRECT[i]);

    if (isCorrect) {
      applyAndClear(vals, 'flash-ok', 800, false, () => onSuccess(vals));
    } else {
      applyAndClear(vals, 'flash-err', 800, true, () => onWrong(vals, null));
    }
  }, [clearFields, onSuccess, onWrong]);

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>EXECUTE PROTOCOL 23</div>
      <div className={rowClass} style={rowStyle}>
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            id={`n${i + 1}`}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="number"
            className={fieldClasses[i]}
            placeholder="—"
            onChange={() => handleChange(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>
      <button
        style={
          btnHover
            ? { ...buttonStyle, color: 'var(--ph)', borderColor: 'var(--ph)' }
            : buttonStyle
        }
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        onClick={validate}
      >
        EXECUTE
      </button>
    </div>
  );
};

export default NumberInput;
