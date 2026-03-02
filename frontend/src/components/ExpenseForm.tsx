import React, { useEffect, useState } from "react";
import { ExpenseFormData } from "../types";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { TextField, SelectBox, Button, Modal } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { createCategory, fetchCategories } from "../services/api";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({ initialData, onSubmit, onCancel, submitLabel = "Add Expense" }: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useExpenseForm({
    initialData,
    onSubmit,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        if (categories && categories.length > 0) {
          setCategoryOptions(
            categories
              .map((category) => ({
                value: category.name,
                label: category.name,
              }))
              .sort((a, b) => a.label.localeCompare(b.label)),
          );
        } else {
          setCategoryOptions(
            EXPENSE_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoryOptions(
          EXPENSE_CATEGORIES.map((category) => ({
            value: category,
            label: category,
          })),
        );
      }
    };

    loadCategories();
  }, []);

  const handleOpenCategoryModal = () => {
    setNewCategoryName("");
    setNewCategoryError("");
    setIsCategoryModalOpen(true);
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setNewCategoryError("Category name is required");
      return;
    }

    // Avoid duplicates in the select list
    const exists = categoryOptions.some((option) => option.label.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      setNewCategoryError("Category already exists");
      return;
    }

    try {
      await createCategory(trimmedName);

      const updatedOptions = [...categoryOptions, { value: trimmedName, label: trimmedName }].sort((a, b) =>
        a.label.localeCompare(b.label),
      );

      setCategoryOptions(updatedOptions);
      handleChange("category", trimmedName);
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
      setNewCategoryError("Failed to create category");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <SelectBox
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={errors.category}
            fullWidth
            required
          />
        </div>

        <Button type="button" variant="primary" onClick={handleOpenCategoryModal}>
          Add
        </Button>
      </div>

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        required
      />

      <div style={buttonGroupStyle}>
        <Button type="submit" variant="primary" disabled={isSubmitting} fullWidth>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add Category">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextField
            label="Category name"
            type="text"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value);
              if (newCategoryError) {
                setNewCategoryError("");
              }
            }}
            error={newCategoryError}
            fullWidth
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Button type="button" variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleCreateCategory}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
