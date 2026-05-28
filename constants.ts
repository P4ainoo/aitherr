
import React from 'react';
import { Skill } from './types';
import { BookOpenIcon, CameraIcon, GlobeAltIcon, PaintBrushIcon, ScaleIcon, SparklesIcon, WaveIcon } from './components/icons/Icons';

export const SKILLS: Skill[] = [
  { name: 'Cooking', icon: SparklesIcon },
  { name: 'Diving', icon: GlobeAltIcon },
  { name: 'Photography', icon: CameraIcon },
  { name: 'Languages', icon: BookOpenIcon },
  { name: 'Art', icon: PaintBrushIcon },
  { name: 'Yoga', icon: ScaleIcon },
  { name: 'Surfing', icon: WaveIcon },
];
