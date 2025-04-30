'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string; // Added to manage state
}

interface SettingsCardProps {
  title: string;
  description: string;
  fields: SettingsField[];
  initialValues: Record<string, string>; // Initial values for the fields
  onSubmit: (values: Record<string, string>) => void; // Placeholder submit handler
  submitButtonText?: string;
}

export function SettingsCard({
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitButtonText = 'Save Changes',
}: SettingsCardProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
    // In a real app, you might show a success message or handle errors here
    console.log('Submitted values:', values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                disabled={field.disabled}
                value={values[field.id] || ''} // Controlled component
                onChange={handleChange}
              />
              {/* Optional: Add description or help text for the field */}
            </div>
          ))}
          <Button type="submit">{submitButtonText}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
