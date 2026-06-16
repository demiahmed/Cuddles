import { useState, useCallback, useEffect } from 'react';
import FlowOptions from '@/components/period/FlowOptions';
import { Entry, FlowType, ProtectionType } from '@/types';
import { WellnessEntry } from '@/types/wellness';
import { saveEntry, deleteEntry } from '@/utils/api';
import { isFutureDate, formatDate } from '@/utils/date';
import '@/styles/rating.css';

interface EntryModalProps {
  date: string;
  entries: Entry[];
  onClose: () => void;
  onSave: (deletedEntryId?: string) => Promise<void>;
  onOpenWellness?: () => void;
  wellnessLog?: WellnessEntry | null;
  onDeleteWellness?: () => Promise<void>;
}

export default function EntryModal({ date, entries, onClose, onSave, onOpenWellness, wellnessLog, onDeleteWellness }: EntryModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [flow, setFlow] = useState<FlowType>('none');
  const [periodEntryType, setPeriodEntryType] = useState<'period_start' | 'period_end'>('period_start');
  const [addSex, setAddSex] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number>(0);
  const [protection, setProtection] = useState<ProtectionType>(null);
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingWellness, setDeletingWellness] = useState(false);

  useEffect(() => {
    // Use local timezone to prevent date shift
    const dateObj = new Date(date);
    if (isFutureDate(dateObj)) {
      setMessage('Cannot create entries for future dates');
      return;
    }

    // Keep date in YYYY-MM-DD format without timezone conversion
    const formattedDate = date;
    console.log('Modal opened for date:', formattedDate);
    // Normalize dates to handle timezone issues
    const normalizedDate = formattedDate.split('T')[0];  // Get only the YYYY-MM-DD part
    const currentEntries = entries.filter(e => e.date.split('T')[0] === normalizedDate);
    console.log('Current entries:', currentEntries);
    
    const periodEntry = currentEntries.find(e => e.entry_type === 'period_start' || e.entry_type === 'period_end');
    
    // Reset all form states when modal opens
    if (!editingEntry) {
      // Set period form state from existing entry
      if (periodEntry) {
        console.log('Setting period entry:', periodEntry);
        setFlow(periodEntry.flow || 'none');
        setPeriodEntryType(periodEntry.entry_type as 'period_start' | 'period_end');
      } else {
        setFlow('none');
        setPeriodEntryType('period_start');
      }

      // Reset sex form state
      setAddSex(false);
      setProtection(null);
      setTimeOfDay('');
      setSatisfaction(0);
    }

    setIsVisible(true);
  }, [date, entries]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Basic validation
      const dateObj = new Date(date);
      if (isFutureDate(dateObj)) {
        throw new Error('Cannot create entries for future dates');
      }

      // Check for duplicates
      const currentEntries = entries.filter(e => e.date === date);
      const existingPeriodEntry = currentEntries.find(e => ['period_start', 'period_end'].includes(e.entry_type));
      const existingSexEntry = currentEntries.find(e => e.entry_type === 'sex');

      if (!editingEntry) {
        if (existingPeriodEntry && flow !== 'none') {
          throw new Error('Period entry already exists for this date');
        }

        // Only close if no action is needed
        if (flow === 'none' && !addSex) {
          onClose();
          return;
        }
      }

      // If we're editing an existing entry
      if (editingEntry) {
        if (editingEntry.entry_type === 'sex') {
          if (!protection) {
            throw new Error('Protection type is required for sex entries');
          }
          if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
            throw new Error('Satisfaction rating is required (1-5 stars)');
          }

          const updatedEntry = {
            id: editingEntry.id,
            date: editingEntry.date,
            entry_type: 'sex' as const,
            protected: protection,
            time_of_day: timeOfDay || null,
            satisfaction,
          };

          await saveEntry(updatedEntry);
          // Reset form state after successful save
          setEditingEntry(null);
          setAddSex(false);
          setSatisfaction(0);
          setProtection(null);
          setTimeOfDay('');
        }
      } else {
        // Handle period entry
        // Find all period entries for this date
        const periodEntries = entries.filter(e => 
          ['period_start', 'period_end'].includes(e.entry_type) && 
          e.date.split('T')[0] === date.split('T')[0]
        );
        
        if (flow === 'none' && periodEntries.length > 0) {
          console.log('Found period entries to delete:', periodEntries);
          
          // Delete all period entries for this date
          for (const entry of periodEntries) {
            console.log(`Attempting to delete ${entry.entry_type} entry ${entry.id}`);
            try {
              const result = await deleteEntry(entry.entry_type, entry.id!.toString());
              if (!result.success) {
                console.error(`Failed to delete ${entry.entry_type} entry:`, result.error);
                throw new Error(result.error || 'Failed to delete entry');
              }
              console.log(`Successfully deleted ${entry.entry_type} entry ${entry.id}`);
            } catch (error) {
              console.error(`Failed to delete ${entry.entry_type} entry:`, error);
              throw error; // Re-throw to be caught by outer try-catch
            }
          }
        } else if (flow !== 'none') {
          // Create or update entry only if flow is not none
          const periodEntry = {
            date,
            entry_type: periodEntryType,
            flow,
            ...(existingPeriodEntry ? { id: existingPeriodEntry.id } : {}),
          };
          await saveEntry(periodEntry);
        }

        // Handle sex entry if enabled
        if (addSex) {
          if (!protection) {
            throw new Error('Protection type is required for sex entries');
          }
          if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
            throw new Error('Satisfaction rating is required (1-5 stars)');
          }

          const sexEntry = {
            date,
            entry_type: 'sex' as const,
            protected: protection,
            time_of_day: timeOfDay || null,
            satisfaction,
          };

          await saveEntry(sexEntry);
        }
      }

      setMessage('Entries saved successfully!');
      onSave();

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save entries');
    } finally {
      setIsSubmitting(false);
    }
  }, [date, periodEntryType, flow, addSex, protection, timeOfDay, satisfaction, onClose, onSave]);

  if (!isVisible) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-md transform scale-95 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Log entry</p>
            <h2 className="text-lg font-bold text-gray-800">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="entry-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Menstruation */}
            <fieldset>
              <div className="flex justify-between items-center mb-3">
                <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Menstruation
                </legend>
                {entries.some(e => ['period_start', 'period_end'].includes(e.entry_type) && e.date.split('T')[0] === date.split('T')[0]) && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this period entry?')) {
                        try {
                          const periodEntries = entries.filter(e =>
                            ['period_start', 'period_end'].includes(e.entry_type) &&
                            e.date.split('T')[0] === date.split('T')[0]
                          );
                          
                          for (const entry of periodEntries) {
                            console.log(`Deleting ${entry.entry_type} entry ${entry.id}`);
                            await deleteEntry(entry.entry_type, entry.id!.toString());
                          }
                          
                          onSave();
                          setMessage('Period entry deleted successfully');
                          setTimeout(() => {
                            onClose();
                          }, 800);
                        } catch (error) {
                          setMessage(error instanceof Error ? error.message : 'Failed to delete entry');
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete Entry
                  </button>
                )}
              </div>
              <FlowOptions
                selectedFlow={flow}
                onFlowSelect={(flow) => {
                  setFlow(flow);
                  setPeriodEntryType(flow === 'none' ? 'period_end' : 'period_start');
                }}
              />
            </fieldset>

              {/* Intimacy */}
            <fieldset className="border-t border-gray-100 pt-4">
              <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 flex justify-between items-center w-full">
                <span>Intimacy</span>
                {!editingEntry && entries.filter(e => e.date.split('T')[0] === date.split('T')[0] && e.entry_type === 'sex').length > 0 && !addSex && (
                  <button
                    type="button"
                    onClick={() => setAddSex(true)}
                    className="text-sm font-normal text-pink-600 hover:text-pink-700 ml-4"
                  >
                    Add Another Entry
                  </button>
                )}
              </legend>                {/* Existing sex entries section */}
                <div id="existing-sex-entries" className="space-y-4 mb-4">
                  {(() => {
                    const sexEntries = entries.filter(e => e.date.split('T')[0] === date.split('T')[0] && e.entry_type === 'sex');
                    console.log('🔍 Modal Debug - All entries for date:', entries.filter(e => e.date.split('T')[0] === date.split('T')[0]));
                    console.log('🔍 Modal Debug - Filtered sex entries:', sexEntries);
                    return sexEntries;
                  })().map((entry, index) => (
                      <div 
                        key={entry.id} 
                        className="bg-gray-50 p-3 rounded-lg space-y-2" 
                        data-entry-id={entry.id} 
                        data-index={index}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Entry #{index + 1}</span>
                          <div className="space-x-2">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (editingEntry?.id === entry.id) {
                                  // Reset editing state
                                  setEditingEntry(null);
                                  setProtection(null);
                                  setTimeOfDay('');
                                  setSatisfaction(0);
                                  setAddSex(false); // Reset addSex to prevent duplicate form
                                } else {
                                  // Set editing state
                                  setEditingEntry(entry);
                                  setProtection(entry.protected || null);
                                  setTimeOfDay(entry.time_of_day || '');
                                  setSatisfaction(entry.satisfaction || 0);
                                  setAddSex(false); // Ensure add form is hidden while editing
                                }
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              {editingEntry?.id === entry.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                console.log('🗑️ Frontend - About to delete entry:', {
                                  id: entry.id,
                                  entry_type: entry.entry_type,
                                  fullEntry: entry
                                });
                                if (confirm('Delete this entry?')) {
                                  try {
                                    const result = await deleteEntry(entry.entry_type, entry.id!.toString());
                                    if (result.success) {
                                      // Pass the deleted entry ID to handleEntrySaved for immediate state update
                                      await onSave(entry.id!.toString());
                                      setMessage('Entry deleted successfully!');
                                      // Close modal after showing success message
                                      setTimeout(() => {
                                        onClose();
                                      }, 800);
                                    } else {
                                      throw new Error(result.error || 'Failed to delete entry');
                                    }
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    setMessage(error instanceof Error ? error.message : 'Failed to delete entry');
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editingEntry?.id === entry.id ? (
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">Protection</label>
                              <div className="flex items-center space-x-6">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name="protection"
                                    value="protected"
                                    checked={protection === 'protected'}
                                    onChange={(e) => setProtection(e.target.value as 'protected' | 'unprotected')}
                                    className="form-radio"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Protected</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name="protection"
                                    value="unprotected"
                                    checked={protection === 'unprotected'}
                                    onChange={(e) => setProtection(e.target.value as 'protected' | 'unprotected')}
                                    className="form-radio"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Unprotected</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                              <input
                                type="time"
                                value={timeOfDay}
                                onChange={(e) => setTimeOfDay(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Satisfaction</label>
                              <div className="star-rating flex flex-row-reverse justify-end text-2xl">
                                {[5, 4, 3, 2, 1].map((value) => (
                                  <div key={value}>
                                    <input
                                      type="radio"
                                      id={`satisfaction_edit_${value}`}
                                      name="satisfaction"
                                      value={value}
                                      checked={satisfaction === value}
                                      onChange={(e) => setSatisfaction(Number(e.target.value))}
                                    />
                                    <label htmlFor={`satisfaction_edit_${value}`} title={`${value} star${value !== 1 ? 's' : ''}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!protection) {
                                  setMessage('Protection type is required');
                                  return;
                                }
                                if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
                                  setMessage('Satisfaction rating is required (1-5 stars)');
                                  return;
                                }
                                try {
                                  const updatedEntry = {
                                    id: entry.id,
                                    date: entry.date,
                                    entry_type: 'sex' as const,
                                    protected: protection,
                                    time_of_day: timeOfDay || null,
                                    satisfaction,
                                  };
                                  await saveEntry(updatedEntry);
                                  setMessage('Entry updated successfully!');
                                  onSave();
                                  setEditingEntry(null);
                                } catch (error) {
                                  setMessage(error instanceof Error ? error.message : 'Failed to update entry');
                                }
                              }}
                              className="w-full bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-pink-700 transition"
                            >
                              Save Changes
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Protection</label>
                              <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`protection_view_${entry.id}`}
                                    value="protected"
                                    checked={entry.protected === 'protected'}
                                    disabled
                                    className="form-radio"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Protected</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`protection_view_${entry.id}`}
                                    value="unprotected"
                                    checked={entry.protected === 'unprotected'}
                                    disabled
                                    className="form-radio"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Unprotected</span>
                                </label>
                              </div>
                            </div>
                            {entry.time_of_day && (
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Time</label>
                                <input
                                  type="time"
                                  value={entry.time_of_day}
                                  disabled
                                  className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 font-medium"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Satisfaction</label>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className={`w-5 h-5 ${i < (entry.satisfaction || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>              {!editingEntry && entries.filter(e => e.date.split('T')[0] === date.split('T')[0] && e.entry_type === 'sex').length === 0 && !addSex && (
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="add-sex" className="text-sm font-medium text-gray-700">
                    Add Sexual Activity?
                  </label>
                  <input
                    type="checkbox"
                    id="add-sex"
                    checked={addSex}
                    onChange={(e) => setAddSex(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                </div>
              )}

              {(addSex && !editingEntry) && (
                <div className="space-y-4 mt-6">
                  {/* Protection */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Protection
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${protection === 'protected' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="protection"
                            value="protected"
                            checked={protection === 'protected'}
                            onChange={(e) => setProtection(e.target.value as 'protected' | 'unprotected')}
                            className="hidden"
                          />
                          <span className="text-sm font-medium text-gray-900">Protected</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${protection === 'protected' ? 'border-pink-600 bg-pink-600' : 'border-gray-300'}`}>
                          {protection === 'protected' && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                              <path fill="currentColor" d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                            </svg>
                          )}
                        </div>
                      </label>
                      <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${protection === 'unprotected' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="protection"
                            value="unprotected"
                            checked={protection === 'unprotected'}
                            onChange={(e) => setProtection(e.target.value as 'protected' | 'unprotected')}
                            className="hidden"
                          />
                          <span className="text-sm font-medium text-gray-900">Unprotected</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${protection === 'unprotected' ? 'border-pink-600 bg-pink-600' : 'border-gray-300'}`}>
                          {protection === 'unprotected' && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                              <path fill="currentColor" d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-semibold text-black mb-1"
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full p-2 border-2 border-gray-600 rounded-lg shadow-sm text-black bg-gray-50 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  {/* Satisfaction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satisfaction (required)
                    </label>
                    <div className="star-rating text-2xl" role="radiogroup" aria-label="Satisfaction rating">
                      {[5, 4, 3, 2, 1].map((value) => (
                        <div key={value}>
                          <input
                            type="radio"
                            id={`satisfaction_${value}`}
                            name="satisfaction"
                            value={value}
                            checked={satisfaction === value}
                            onChange={(e) => setSatisfaction(Number(e.target.value))}
                          />
                          <label 
                            htmlFor={`satisfaction_${value}`} 
                            title={`${value} star${value !== 1 ? 's' : ''}`}
                            onClick={() => setSatisfaction(value)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </fieldset>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            type="submit"
            form="entry-form"
            disabled={isSubmitting}
            className="w-full bg-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
          {message && (
            <p className={`text-xs mt-2 text-center ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          {onOpenWellness && (
            wellnessLog ? (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={onOpenWellness}
                  className="flex-1 text-sm text-pink-500 hover:text-pink-700 font-medium text-center py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  ✏️ Modify wellness
                </button>
                <button
                  type="button"
                  disabled={deletingWellness}
                  onClick={async () => {
                    if (!confirm('Delete this wellness log? This cannot be undone.')) return;
                    setDeletingWellness(true);
                    await onDeleteWellness?.();
                    setDeletingWellness(false);
                  }}
                  className="flex-1 text-sm text-red-400 hover:text-red-600 font-medium text-center py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingWellness ? 'Deleting…' : '🗑 Delete wellness'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenWellness}
                className="w-full mt-3 text-sm text-pink-500 hover:text-pink-700 font-medium text-center py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
              >
                📓 Log wellness for this day →
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}