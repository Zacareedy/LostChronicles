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
  letterSpacing: 5,
  textTransform: 'uppercase',
  color: 'var(--ph-dim)',
  marginBottom: 12,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const buttonStyle: React.CSSProperties = {
  fontFamily: "'VT323', monospace",
  fontSize: '18px',
  padding: '6px 20px',
  border: '1px solid var(--bd)',
  background: 'var(--panel)',
  color: 'var(--ph-dim)',
  cursor: 'pointer',
  marginTop: 12,
  letterSpacing: 3,
};

const NumberInput: React.FC<NumberInputProps> = ({ onSuccess, onWrong }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [vals, setVals] = useState<string[]>(['', '', '', '', '', '']);
  const [fieldClasses, setFieldClasses] = useState<string[]>(Array(6).fill('nf'));

  const clearFields = useCallback(() => {
    setVals(['', '', '', '', '', '']);
  }, []);

  const flashFields = useCallback((cls: string) => {
    setFieldClasses(Array(6).fill(`nf ${cls}`));
    setTimeout(() => {
      setFieldClasses(Array(6).fill('nf'));
    }, 600);
  }, []);

  const handleChange = (index: number, raw: string) => {
    // Strip non-numeric characters and limit to 2 digits
    const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 2);
    setVals((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned.length === 2 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && vals[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      validate();
    }
  };

  const validate = useCallback(() => {
    const parsed = vals.map((v) => (v === '' ? NaN : parseInt(v, 10)));
    if (parsed.some((v) => isNaN(v))) return;
    const nums = parsed as number[];

    if (nums.every((v) => v === 0)) {
      flashFields('flash-err');
      const row = rowRef.current;
      if (row) {
        row.classList.add('num-row-shake');
        setTimeout(() => row.classList.remove('num-row-shake'), 500);
      }
      setTimeout(() => {
        clearFields();
        onWrong(nums, 'null_sequence');
      }, 600);
      return;
    }

    if (nums[0] === 42 && nums[5] === 4) {
      flashFields('flash-err');
      const row = rowRef.current;
      if (row) {
        row.classList.add('num-row-shake');
        setTimeout(() => row.classList.remove('num-row-shake'), 500);
      }
      setTimeout(() => {
        clearFields();
        onWrong(nums, 'inverted');
      }, 600);
      return;
    }

    const isCorrect = nums.every((v, i) => v === CORRECT[i]);

    if (isCorrect) {
      flashFields('flash-ok');
      setTimeout(() => {
        clearFields();
        onSuccess(nums);
      }, 600);
    } else {
      flashFields('flash-err');
      const row = rowRef.current;
      if (row) {
        row.classList.add('num-row-shake');
        setTimeout(() => row.classList.remove('num-row-shake'), 500);
      }
      setTimeout(() => {
        clearFields();
        onWrong(nums, null);
      }, 600);
    }
  }, [vals, clearFields, flashFields, onSuccess, onWrong]);

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>EXECUTE PROTOCOL 23</div>
      <div id="numRow" className="num-row" ref={rowRef} style={rowStyle}>
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            id={`n${i + 1}`}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="number"
            className={fieldClasses[i]}
            placeholder="—"
            value={vals[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>
      <button style={buttonStyle} onClick={validate}>
        EXECUTE
      </button>
    </div>
  );
};

export default NumberInput;
