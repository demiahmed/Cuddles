'use client';
import React from 'react';
import { FlowType } from '@/types';

const DROP_PATH = 'M12 3.5c-.6 1-4 6.5-4 9.5a4 4 0 008 0c0-3-3.4-8.5-4-9.5z';

interface FlowConfig {
  value: FlowType;
  label: string;
  fill: string;
  outlined: boolean;
}

const FLOW_OPTIONS: FlowConfig[] = [
  { value: 'none',     label: 'None',     fill: '#d1d5db', outlined: true  },
  { value: 'spotting', label: 'Spotting', fill: '#fbb6ce', outlined: false },
  { value: 'light',    label: 'Light',    fill: '#f472b6', outlined: false },
  { value: 'medium',   label: 'Medium',   fill: '#ec4899', outlined: false },
  { value: 'heavy',    label: 'Heavy',    fill: '#9f1239', outlined: false },
];

interface FlowOptionsProps {
  selectedFlow: FlowType;
  onFlowSelect: (flow: FlowType) => void;
}

export default function FlowOptions({ selectedFlow, onFlowSelect }: FlowOptionsProps) {
  return (
    <div className="flex gap-1.5 justify-between">
      {FLOW_OPTIONS.map(({ value, label, fill, outlined }) => (
        <button
          key={value}
          type="button"
          onClick={() => onFlowSelect(value)}
          className={`flex flex-col items-center gap-1.5 flex-1 py-2.5 px-1 rounded-xl border-2 transition-all ${
            selectedFlow === value
              ? 'border-pink-500 bg-pink-50 shadow-sm'
              : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50'
          }`}
        >
          <svg viewBox="0 0 24 24" width="22" height="26" fill="none">
            {outlined ? (
              <>
                <circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="1.8" />
                <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
              </>
            ) : (
              <path d={DROP_PATH} fill={fill} />
            )}
          </svg>
          <span className={`text-[10px] font-semibold leading-none ${
            selectedFlow === value ? 'text-pink-600' : 'text-gray-500'
          }`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
