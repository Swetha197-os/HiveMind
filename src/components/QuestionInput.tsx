import React from 'react';
import { HelpCircle } from 'lucide-react';

interface QuestionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const QUICK_PROMPTS = [
  'What is polymorphism in Java?',
  'Compare React and Vue state management.',
  'Explain recursion in programming with an analogy.',
  'What is a REST API and how does it work?'
];

export const QuestionInput: React.FC<QuestionInputProps> = ({
  value,
  onChange,
  placeholder = 'Type your inquiry here...'
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-lg font-medium text-butter flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-butter" />
          <span>Ask the Hive Mind</span>
        </label>
        <span className="text-xs text-gray-400">
          {value.length} characters
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-36 p-4 rounded-xl glass-input text-white text-base placeholder-gray-500 resize-none font-light leading-relaxed focus:ring-1 focus:ring-butter/50"
      />

      <div className="space-y-2">
        <span className="text-xs text-gray-400 block">Or try a quick sample prompt:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(prompt)}
              className="text-xs px-3 py-1.5 rounded-full glass-card hover:bg-butter hover:text-darkgreen transition-all duration-300 text-gray-300 font-light border-butter/10 hover:border-butter"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default QuestionInput;
