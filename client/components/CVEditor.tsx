'use client';

import { useState } from 'react';
import { CVData } from '@/types/cv';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface CVEditorProps {
  cvData: CVData;
  onUpdateCV: (data: CVData) => void;
}

export default function CVEditor({ cvData, onUpdateCV }: CVEditorProps) {
  const [editedCV, setEditedCV] = useState<CVData>(cvData);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCV(prev => ({
      ...prev,
      header: { ...prev.header, [name]: value }
    }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCV(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newExperience = [...editedCV.experience];
    const experienceItem = newExperience[index] as any;
    experienceItem[name] = value;
    setEditedCV(prev => ({ ...prev, experience: newExperience }));
  };
  
  const handleExperienceResponsibilitiesChange = (expIndex: number, respIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExperience = [...editedCV.experience];
    newExperience[expIndex].responsibilities[respIndex] = value;
    setEditedCV(prev => ({ ...prev, experience: newExperience }));
  };

  const addExperience = () => {
    setEditedCV(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', startDate: '', endDate: '', responsibilities: [''] }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    const newExperience = [...editedCV.experience];
    newExperience.splice(index, 1);
    setEditedCV(prev => ({ ...prev, experience: newExperience }));
  };
  
  const addResponsibility = (expIndex: number) => {
    const newExperience = [...editedCV.experience];
    newExperience[expIndex].responsibilities.push('');
    setEditedCV(prev => ({ ...prev, experience: newExperience }));
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const newExperience = [...editedCV.experience];
    newExperience[expIndex].responsibilities.splice(respIndex, 1);
    setEditedCV(prev => ({ ...prev, experience: newExperience }));
  };

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newEducation = [...editedCV.education];
    const educationItem = newEducation[index] as any;
    educationItem[name] = value;
    setEditedCV(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setEditedCV(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', year: '' }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    const newEducation = [...editedCV.education];
    newEducation.splice(index, 1);
    setEditedCV(prev => ({ ...prev, education: newEducation }));
  };

  const handleSkillsChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newSkills = [...editedCV.skills];
    newSkills[index] = e.target.value;
    setEditedCV(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setEditedCV(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index: number) => {
    const newSkills = [...editedCV.skills];
    newSkills.splice(index, 1);
    setEditedCV(prev => ({ ...prev, skills: newSkills }));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`https://resume-formatter-7rc4.onrender.com/api/cv/${editedCV._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedCV),
      });
      if (!res.ok) throw new Error('Failed to save CV');
      const updatedData = await res.json();
      onUpdateCV(updatedData);
      alert('CV saved successfully!');
    } catch (err) {
      console.error('Error saving CV:', err);
      alert('Error saving CV.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Header</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input name="name" value={editedCV.header.name} onChange={handleHeaderChange} placeholder="Name" />
          <Input name="title" value={editedCV.header.title} onChange={handleHeaderChange} placeholder="Title" />
          <Input name="email" value={editedCV.header.email} onChange={handleHeaderChange} placeholder="Email" />
          <Input name="phone" value={editedCV.header.phone} onChange={handleHeaderChange} placeholder="Phone" />
          <Input name="linkedin" value={editedCV.header.linkedin} onChange={handleHeaderChange} placeholder="LinkedIn URL" />
          <Input name="website" value={editedCV.header.website} onChange={handleHeaderChange} placeholder="Website URL" />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <Textarea value={editedCV.summary} onChange={handleSummaryChange} placeholder="Professional Summary" />
      </div>

      {/* Experience */}
      <div className="p-4 bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Experience</h3>
        {editedCV.experience.map((exp, expIndex) => (
          <div key={expIndex} className="space-y-2 border-b pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="title" value={exp.title} onChange={e => handleExperienceChange(expIndex, e)} placeholder="Job Title" />
              <Input name="company" value={exp.company} onChange={e => handleExperienceChange(expIndex, e)} placeholder="Company" />
              <Input name="startDate" value={exp.startDate} onChange={e => handleExperienceChange(expIndex, e)} placeholder="Start Date" />
              <Input name="endDate" value={exp.endDate} onChange={e => handleExperienceChange(expIndex, e)} placeholder="End Date" />
            </div>
            <h4 className="font-semibold">Responsibilities:</h4>
            {exp.responsibilities.map((resp, respIndex) => (
              <div key={respIndex} className="flex items-center gap-2">
                <Input value={resp} onChange={e => handleExperienceResponsibilitiesChange(expIndex, respIndex, e)} placeholder="Responsibility" />
                <Button variant="ghost" size="icon" onClick={() => removeResponsibility(expIndex, respIndex)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button onClick={() => addResponsibility(expIndex)}>Add Responsibility</Button>
            <Button variant="destructive" onClick={() => removeExperience(expIndex)}>Remove Experience</Button>
          </div>
        ))}
        <Button onClick={addExperience}>Add Experience</Button>
      </div>

      {/* Education */}
      <div className="p-4 bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Education</h3>
        {editedCV.education.map((edu, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-2">
            <Input name="degree" value={edu.degree} onChange={e => handleEducationChange(index, e)} placeholder="Degree" />
            <Input name="institution" value={edu.institution} onChange={e => handleEducationChange(index, e)} placeholder="Institution" />
            <Input name="year" value={edu.year} onChange={e => handleEducationChange(index, e)} placeholder="Year" />
            <Button variant="destructive" onClick={() => removeEducation(index)}>Remove Education</Button>
          </div>
        ))}
        <Button onClick={addEducation}>Add Education</Button>
      </div>

      {/* Skills */}
      <div className="p-4 bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Skills</h3>
        <div className="grid grid-cols-3 gap-4">
          {editedCV.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={skill} onChange={e => handleSkillsChange(index, e)} placeholder="Skill" />
              <Button variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button onClick={addSkill} className="mt-2">Add Skill</Button>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full">Save Changes</Button>
    </div>
  );
}
