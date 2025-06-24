import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLocalMultipleEntries } from '../../Redux/features/answersSlice';

const MultipleEntriesComponent = ({ 
  question, 
  existingAnswer, 
  onDataChange 
}) => {
  const dispatch = useDispatch();

  // Define fields for each type of information
  const getFieldsConfig = (type) => {
    const configs = {
      'medications': [
        { name: 'medicationName', label: 'שם התרופה', type: 'text', required: true },
        { name: 'dosage', label: 'מינון', type: 'text', required: true },
        { name: 'times', label: 'זמני נטילה', type: 'text', required: true },
        { name: 'notes', label: 'הערות', type: 'textarea', required: false }
      ],
      'allergies': [
        { name: 'allergen', label: 'חומר אלרגני', type: 'text', required: true },
        { name: 'reaction', label: 'סוג התגובה', type: 'text', required: true },
        { name: 'severity', label: 'חומרה', type: 'select', options: ['קלה', 'בינונית', 'חמורה'], required: true },
        { name: 'notes', label: 'הערות', type: 'textarea', required: false }
      ],
      'seizures': [
        { name: 'seizureType', label: 'סוג התקף', type: 'text', required: true },
        { name: 'frequency', label: 'תדירות', type: 'text', required: true },
        { name: 'triggers', label: 'טריגרים', type: 'textarea', required: false },
        { name: 'medications', label: 'תרופות רלוונטיות', type: 'text', required: false },
        { name: 'notes', label: 'הערות נוספות', type: 'textarea', required: false }
      ]
    };
    return configs[type] || [];
  };

  // Define UI config for each type
  const getUIConfig = (type) => {
    const configs = {
      'medications': {
        title: 'פירוט תרופות',
        addButtonText: 'הוסף תרופה',
        icon: '💊',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'allergies': {
        title: 'פירוט אלרגיות ורגישויות',
        addButtonText: 'הוסף אלרגיה',
        icon: '⚠️',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'seizures': {
        title: 'פירוט התקפים/אפילפסיה',
        addButtonText: 'הוסף פירוט',
        icon: '🩺',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    };
    return configs[type] || { title: type, addButtonText: 'הוסף פריט', icon: '📝', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  };

  const fields = getFieldsConfig(question.multipleEntryType);
  const uiConfig = getUIConfig(question.multipleEntryType);

  // Create an empty entry
  const createEmptyEntry = () => {
    const entry = {};
    fields.forEach(field => {
      entry[field.name] = '';
    });
    return entry;
  };

  // Loading existing data or creating the first entry
  const initializeEntries = () => {
    if (existingAnswer?.multipleEntries) {
      try {
        const parsed = JSON.parse(existingAnswer.multipleEntries);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createEmptyEntry()];
      } catch (e) {
        console.error('Error parsing existing multiple entries:', e);
        return [createEmptyEntry()];
      }
    }
    return [createEmptyEntry()];
  };

  const [entries, setEntries] = useState(initializeEntries);

  // Update when existing data changes
  useEffect(() => {
    setEntries(initializeEntries());
  }, [existingAnswer]);

  // Function to update an entry
  const updateEntry = (index, fieldName, value) => {
    const newEntries = entries.map((entry, entryIndex) => {
      if (entryIndex === index) {
        return { ...entry, [fieldName]: value };
      }
      return entry;
    });
    
    setEntries(newEntries);
    
    dispatch && dispatch(updateLocalMultipleEntries({
      questionNo: question.questionNo,
      multipleEntries: newEntries
    }));
    
    onDataChange && onDataChange(newEntries);
  };

  // Adding a new item
  const addEntry = () => {
    const newEntries = [...entries, createEmptyEntry()];
    setEntries(newEntries);
    
    dispatch(updateLocalMultipleEntries({
      questionNo: question.questionNo,
      multipleEntries: newEntries
    }));
    
    onDataChange && onDataChange(newEntries);
  };

  // Remove item
  const removeEntry = (index) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
      
      dispatch && dispatch(updateLocalMultipleEntries({
        questionNo: question.questionNo,
        multipleEntries: newEntries
      }));
      
      onDataChange && onDataChange(newEntries);
    }
  };

  // Render single field
  const renderField = (field, entryIndex, value) => {
    const inputProps = {
      value: value || '',
      onChange: (e) => updateEntry(entryIndex, field.name, e.target.value),
      className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      placeholder: `הזן ${field.label.toLowerCase()}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={3}
            className={`${inputProps.className} resize-none`}
          />
        );
      case 'select':
        return (
          <select {...inputProps}>
            <option value="">בחר {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return <input type={field.type || 'text'} {...inputProps} />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 mt-4 ${uiConfig.bgColor} ${uiConfig.borderColor}`} dir="rtl">
      {/* Headline */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{uiConfig.icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{uiConfig.title}</h3>
      </div>

      {/* List of items */}
      <div className="space-y-4">
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
            {/* Item headline */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">
                פריט {entryIndex + 1}
              </span>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entryIndex)}
                  className="text-red-500 hover:text-red-700 text-sm bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                >
                  🗑️ הסר
                </button>
              )}
            </div>

            {/* Item fields*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  {renderField(field, entryIndex, entry[field.name])}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={addEntry}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
      >
        <span>➕</span>
        {uiConfig.addButtonText}
      </button>

      {/* Summary of information */}
      {entries.length > 0 && entries.some(entry => Object.values(entry).some(val => val && val.toString().trim())) && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">מידע שנשמר:</h4>
          <div className="text-xs text-green-700">
            {entries.filter(entry => Object.values(entry).some(val => val && val.toString().trim())).length} פריטים עם מידע
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleEntriesComponent;