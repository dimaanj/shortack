"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
} from "react";
import type { DestinationInfo } from "@shortack/monitor-core";
import styles from "./SearchableSelect.module.css";

type SearchableSelectProps = {
  options: DestinationInfo[];
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string, label: string) => void;
};

export function SearchableSelect({
  options,
  value,
  placeholder,
  disabled = false,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const triggerId = useId();

  const selectedOption = options.find((o) => o.id === value);
  const displayText = selectedOption?.name ?? placeholder;
  const isPlaceholder = !selectedOption;

  const filtered = query.trim()
    ? options.filter((o) =>
        o.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : options;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, close]);

  const handleSelect = (opt: DestinationInfo) => {
    onChange(opt.id, opt.name);
    close();
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        id={triggerId}
        type="button"
        className={styles.trigger}
        data-placeholder={isPlaceholder ? "" : undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={styles.triggerText}>{displayText}</span>
        <span className={styles.icon} aria-hidden>
          ▼
        </span>
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          className={styles.content}
          aria-labelledby={triggerId}
        >
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              e.stopPropagation();
            }}
            aria-autocomplete="list"
            aria-controls={listId}
          />
          <ul className={styles.list} role="group">
            {filtered.length === 0 ? (
              <li className={styles.empty}>No matches</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={opt.id === value}
                  className={styles.item}
                  onClick={() => handleSelect(opt)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(opt);
                    }
                  }}
                >
                  {opt.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
