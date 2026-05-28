
import React from 'react';
import { Skill } from '../types';

interface SkillSelectorProps {
  skills: Skill[];
  selectedSkill: string | null;
  onSelectSkill: (skill: string) => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({ skills, selectedSkill, onSelectSkill }) => {
  return (
    <section className="text-center">
      <h2 className="text-3xl font-bold text-white mb-3">What new skill do you want to learn?</h2>
      <p className="text-white/70 mb-10 font-light">Select a skill to get AI-powered, sustainable travel recommendations.</p>
      <div className="flex flex-wrap justify-center gap-4">
        {skills.map((skill) => {
          const isSelected = skill.name === selectedSkill;
          return (
            <button
              key={skill.name}
              onClick={() => onSelectSkill(skill.name)}
              className={`
                flex flex-col items-center justify-center p-4 w-32 h-32 rounded-2xl backdrop-blur-md transition-all duration-300 transform 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-transparent
                border
                ${isSelected 
                  ? 'bg-brand-secondary/90 text-brand-dark border-brand-secondary scale-105 shadow-[0_0_20px_rgba(255,193,7,0.4)]' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 hover:scale-105'
                }
              `}
            >
              <skill.icon className={`w-10 h-10 mb-3 ${isSelected ? 'text-brand-dark' : 'text-brand-secondary'}`} />
              <span className="font-semibold tracking-wide">{skill.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SkillSelector;
