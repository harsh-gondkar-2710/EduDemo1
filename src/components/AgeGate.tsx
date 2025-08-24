
'use client';

import { useState } from 'react';
import { usePerformance } from '@/hooks/use-performance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AgeGate() {
  const { age, setAge, isAgeGateOpen, setAgeGateOpen } = usePerformance();
  const [ageInput, setAgeInput] = useState('');

  const handleSave = () => {
    const newAge = parseInt(ageInput, 10);
    if (!isNaN(newAge) && newAge > 0) {
      setAge(newAge);
    }
  };

  return (
    <Dialog open={isAgeGateOpen} onOpenChange={setAgeGateOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to EduSmart!</DialogTitle>
          <DialogDescription>
            To personalize your learning experience, please enter your age.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
