import { describe, it, expect } from "vitest";

import {
  renderInputField,
  renderTextareaField,
  renderSelectField,
  renderCheckboxField,
  renderDateField,
  renderDefaultField,
  renderForm,
} from "../scripts/frontend/generate-inputs";

describe("Form Field Renderers", () => {
  const mockField = {
    name: "test",
    label: "Test Label",
    type: "text",
    required: true,
    placeholder: "Enter text",
  };

  it("renders input field correctly", () => {
    const html = renderInputField(mockField);
    expect(html).toContain("<Input");
    expect(html).toContain('name="test"');
  });

  it("renders textarea field correctly", () => {
    const html = renderTextareaField({ ...mockField, type: "textarea" });
    expect(html).toContain("<Textarea");
    expect(html).toContain('name="test"');
  });

  it("renders select field correctly", () => {
    const field = {
      ...mockField,
      type: "select",
      options: [
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
      ],
    };
    const html = renderSelectField(field);
    expect(html).toContain("<Select");
    expect(html).toContain(
      `<SelectItem key=\"1\" value=\"1\">One</SelectItem>`
    );
  });

  it("renders checkbox field correctly", () => {
    const html = renderCheckboxField({ ...mockField, type: "checkbox" });
    //html.join("");
    expect(html.ignoreWhitespace()).toBe(
      `<div className="mb-4"><Checkbox id="test" name="test" isSelected={!!formState["test"]} onValueChange={(checked) => handleChange("test", checked)}>
        Test Label
      </Checkbox>
      </div>`.ignoreWhitespace()
    );
  });

  it("renders date field correctly", () => {
    const html = renderDateField({ ...mockField, type: "date" });
    expect(html).toContain("<DatePicker");
    expect(html).toContain('name="test"');
  });

  it("renders default field correctly", () => {
    const html = renderDefaultField({ ...mockField, type: "custom" });
    expect(html).toContain("<Input");
  });
});

describe("renderForm", () => {
  it("generates a complete form component", () => {
    const schema = {
      title: "TestForm",
      description: "Test form description",
      fields: [],
      submitButtonText: "Send",
    };

    const componentCode = renderForm(
      schema,
      "const handleSubmit = () => {};",
      "<Input />"
    );

    expect(componentCode).toContain("TestForm");
    expect(componentCode).toContain("<Form");
    expect(componentCode).toContain("Send");
    expect(componentCode).toContain("Test form description");
  });
});
