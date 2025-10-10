import { FlowType } from '@/types';
import { ICONS, FLOW_LABELS } from '@/constants/icons';

interface FlowOptionsProps {
  selectedFlow: FlowType;
  onFlowSelect: (flow: FlowType) => void;
}

export default function FlowOptions({ selectedFlow, onFlowSelect }: FlowOptionsProps) {
  return (
    <div className="flex justify-around items-center">
      {Object.entries(ICONS.flow).map(([level, icon]) => (
        <button
          key={level}
          type="button"
          className={`flow-option p-2 border-2 rounded-full text-pink-500 hover:text-pink-600 transition duration-150 ${selectedFlow === level ? 'selected border-pink-500 bg-pink-50' : 'border-transparent'}`}
          title={FLOW_LABELS[level as FlowType]}
          onClick={() => onFlowSelect(level as FlowType)}
        >
          <span className="text-pink-500" dangerouslySetInnerHTML={{ __html: icon }} />
        </button>
      ))}
    </div>
  );
}
