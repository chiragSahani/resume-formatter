'use client';

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, Phone, Linkedin, Globe, Trash2, PlusCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CVDisplayProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
}

const AutoSaveStatus = ({ isSaving, isSaved }) => {
    if (isSaving) return <p className="text-sm text-muted-foreground">Saving...</p>;
    if (isSaved) return <p className="text-sm text-green-500">Saved!</p>;
    return null;
};

const EditableInput = ({ value, onChange, placeholder, className = '' }) => (
    <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border-none focus:ring-1 focus:ring-primary bg-transparent p-1 h-auto ${className}`}
    />
);

const EditableTextarea = ({ value, onChange, placeholder, className = '' }) => (
    <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border-none focus:ring-1 focus:ring-primary bg-transparent p-1 h-auto resize-none ${className}`}
    />
);

const CVDisplay = React.forwardRef<HTMLDivElement, CVDisplayProps>(({ cvData: initialCvData, setCvData: setParentData }, ref) => {
  const [cvData, setCvData] = useState<CVData>(initialCvData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const debouncedCvData = useDebounce(cvData, 1500); // 1.5-second debounce delay
  const { toast } = useToast();

  // Effect to auto-save the debounced CV data
  useEffect(() => {
    const autoSave = async () => {
      if (debouncedCvData && debouncedCvData._id && JSON.stringify(debouncedCvData) !== JSON.stringify(initialCvData)) {
        setIsSaving(true);
        setIsSaved(false);
        try {
          await api.updateCV(debouncedCvData._id, debouncedCvData);
          setParentData(debouncedCvData); // Update parent state
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000); // Hide "Saved!" message after 2s
        } catch (error) {
          console.error("Autosave failed:", error);
          toast({
            title: 'Autosave Failed',
            description: 'Could not save changes automatically.',
            variant: 'destructive',
          });
        } finally {
          setIsSaving(false);
        }
      }
    };
    autoSave();
  }, [debouncedCvData, initialCvData, setParentData, toast]);

  const handleFieldChange = (section, index, field, value) => {
    const newData = { ...cvData };
    if (index === null) {
      newData[section] = value;
    } else {
      newData[section][index][field] = value;
    }
    setCvData(newData);
  };

  const handleNestedFieldChange = (section, index, subSection, subIndex, field, value) => {
      const newData = { ...cvData };
      newData[section][index][subSection][subIndex] = value;
      setCvData(newData);
  };

  const handleAddItem = (section) => {
    const newItem = {
        experience: { title: '', company: '', startDate: '', endDate: '', responsibilities: [''] },
        education: { degree: '', institution: '', year: '' },
        skills: '',
    }[section];
    const newData = { ...cvData, [section]: [...cvData[section], newItem] };
    setCvData(newData);
  };

  const handleRemoveItem = (section, index) => {
    const newData = { ...cvData, [section]: cvData[section].filter((_, i) => i !== index) };
    setCvData(newData);
  };

  const handleAddResponsibility = (expIndex) => {
    const newData = { ...cvData };
    newData.experience[expIndex].responsibilities.push('');
    setCvData(newData);
  };

  const handleRemoveResponsibility = (expIndex, respIndex) => {
    const newData = { ...cvData };
    newData.experience[expIndex].responsibilities = newData.experience[expIndex].responsibilities.filter((_, i) => i !== respIndex);
    setCvData(newData);
  };

  if (!cvData) return null;

  return (
    <Card ref={ref} className="max-w-4xl mx-auto p-8 shadow-lg bg-card text-card-foreground">
      <div className="flex justify-end">
        <AutoSaveStatus isSaving={isSaving} isSaved={isSaved} />
      </div>
      <CardHeader className="text-center p-0 border-b pb-6 mb-8">
        <EditableInput value={cvData.header.name} onChange={e => setCvData({...cvData, header: {...cvData.header, name: e.target.value}})} placeholder="Your Name" className="text-5xl font-extrabold text-center" />
        <EditableInput value={cvData.header.title} onChange={e => setCvData({...cvData, header: {...cvData.header, title: e.target.value}})} placeholder="Your Title" className="text-2xl text-primary font-medium mt-2 text-center" />
        <div className="flex flex-wrap justify-center items-center gap-4 text-muted-foreground mt-4">
            <EditableInput value={cvData.header.email} onChange={e => setCvData({...cvData, header: {...cvData.header, email: e.target.value}})} placeholder="Email" />
            <EditableInput value={cvData.header.phone} onChange={e => setCvData({...cvData, header: {...cvData.header, phone: e.target.value}})} placeholder="Phone" />
            <EditableInput value={cvData.header.linkedin} onChange={e => setCvData({...cvData, header: {...cvData.header, linkedin: e.target.value}})} placeholder="LinkedIn" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-10">
          <section>
            <h3 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Professional Summary</h3>
            <EditableTextarea value={cvData.summary} onChange={e => setCvData({...cvData, summary: e.target.value})} placeholder="Your professional summary..." />
          </section>

          <section>
            <h3 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Work Experience</h3>
            {cvData.experience.map((item, index) => (
              <div key={index} className="mb-4 p-2 rounded hover:bg-secondary">
                <div className="flex justify-between items-center">
                    <EditableInput value={item.title} onChange={e => handleFieldChange('experience', index, 'title', e.target.value)} placeholder="Job Title" className="text-lg font-semibold" />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('experience', index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <EditableInput value={item.company} onChange={e => handleFieldChange('experience', index, 'company', e.target.value)} placeholder="Company" />
                <div className="flex gap-2">
                    <EditableInput value={item.startDate} onChange={e => handleFieldChange('experience', index, 'startDate', e.target.value)} placeholder="Start Date" className="text-sm" />
                    <span>-</span>
                    <EditableInput value={item.endDate} onChange={e => handleFieldChange('experience', index, 'endDate', e.target.value)} placeholder="End Date" className="text-sm" />
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {item.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex} className="flex items-center">
                      <EditableTextarea value={resp} onChange={e => handleNestedFieldChange('experience', index, 'responsibilities', respIndex, null, e.target.value)} placeholder="Responsibility" className="flex-grow" />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveResponsibility(index, respIndex)}><Trash2 className="h-4 w-4" /></Button>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" onClick={() => handleAddResponsibility(index)} className="mt-2"><PlusCircle className="h-4 w-4 mr-2"/>Add Responsibility</Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => handleAddItem('experience')}><PlusCircle className="h-4 w-4 mr-2"/>Add Experience</Button>
          </section>

          <section>
            <h3 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Education</h3>
            {cvData.education.map((item, index) => (
              <div key={index} className="mb-2 p-2 rounded hover:bg-secondary flex items-center justify-between">
                <div>
                    <EditableInput value={item.degree} onChange={e => handleFieldChange('education', index, 'degree', e.target.value)} placeholder="Degree" className="text-lg font-semibold" />
                    <EditableInput value={item.institution} onChange={e => handleFieldChange('education', index, 'institution', e.target.value)} placeholder="Institution" />
                    <EditableInput value={item.year} onChange={e => handleFieldChange('education', index, 'year', e.target.value)} placeholder="Year" className="text-sm" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('education', index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => handleAddItem('education')}><PlusCircle className="h-4 w-4 mr-2"/>Add Education</Button>
          </section>

          <section>
            <h3 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1">
                    <EditableInput value={skill} onChange={e => handleNestedFieldChange('skills', null, null, index, null, e.target.value)} placeholder="Skill" />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('skills', index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddItem('skills')}><PlusCircle className="h-4 w-4 mr-2"/>Add Skill</Button>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
});

export default CVDisplay;