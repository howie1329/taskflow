"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfile = useMutation(api.profiles.updateMyProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Profile Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel>First Name</FieldLabel>
          <Input
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter your first name"
            disabled={isSubmitting}
            required
          />
          <FieldDescription>Max 50 characters</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Last Name</FieldLabel>
          <Input
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Enter your last name"
            disabled={isSubmitting}
            required
          />
          <FieldDescription>Max 50 characters</FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel>Contact Email</FieldLabel>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter your contact email"
          disabled={isSubmitting}
          required
        />
        <FieldDescription>
          Used for notifications and contact purposes
        </FieldDescription>
      </Field>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-24 motion-safe:active:scale-[0.97]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
