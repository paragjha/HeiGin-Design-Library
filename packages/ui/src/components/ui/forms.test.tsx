import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "../../../../../tests/setup/axe";
import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { SearchInput } from "./search-input";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { RadioGroup } from "./radio-group";
import { Select } from "./select";

describe("Field + Input", () => {
  it("connects label, description and error to the control", () => {
    render(
      <Field label="Email" description="We never share it." error="Enter a valid email" required>
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
  });

  it("disables the control through the Field", () => {
    render(
      <Field label="Company" disabled>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Company")).toBeDisabled();
  });

  it("validates on submit (example flow)", async () => {
    function Form() {
      const [error, setError] = React.useState<string>();
      return (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("phone") as string;
            setError(/^\+?\d{10,13}$/.test(value) ? undefined : "Enter a 10-digit mobile number");
          }}
        >
          <Field label="Phone" error={error}>
            <Input name="phone" />
          </Field>
          <button type="submit">Save</button>
        </form>
      );
    }
    render(<Form />);
    await userEvent.type(screen.getByLabelText("Phone"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByLabelText("Phone")).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(screen.getByLabelText("Phone"));
    await userEvent.type(screen.getByLabelText("Phone"), "9876543210");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByLabelText("Phone")).not.toHaveAttribute("aria-invalid");
  });

  it("textarea and read-only input render", () => {
    render(
      <>
        <Field label="Notes">
          <Textarea />
        </Field>
        <Field label="ID">
          <Input readOnly value="L-1024" />
        </Field>
      </>,
    );
    expect(screen.getByLabelText("Notes").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("ID")).toHaveAttribute("readonly");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <form>
        <Field label="Name" description="As on GST invoice">
          <Input />
        </Field>
        <Field label="Email" error="Required">
          <Input />
        </Field>
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("SearchInput", () => {
  function Harness({ onSearch }: { onSearch?: (v: string) => void }) {
    const [value, setValue] = React.useState("");
    return <SearchInput aria-label="Search leads" value={value} onValueChange={setValue} onSearch={onSearch} />;
  }

  it("clears with the clear button and Escape, and searches on Enter", async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "Search leads" });
    await userEvent.type(input, "Mehta{Enter}");
    expect(onSearch).toHaveBeenCalledWith("Mehta");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    await userEvent.type(input, "abc{Escape}");
    expect(input).toHaveValue("");
  });
});

describe("Checkbox / Switch / RadioGroup", () => {
  it("checkbox toggles with click and Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Send WhatsApp updates" onCheckedChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Send WhatsApp updates" });
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("checkbox supports indeterminate", () => {
    render(<Checkbox aria-label="Select all" indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("switch toggles", async () => {
    render(<Switch label="Auto-assign leads" />);
    const sw = screen.getByRole("switch", { name: "Auto-assign leads" });
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("radio group selects with arrow keys", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Channel"
        defaultValue="whatsapp"
        onValueChange={onChange}
        options={[
          { value: "whatsapp", label: "WhatsApp" },
          { value: "email", label: "Email" },
          { value: "call", label: "Call" },
        ]}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Channel" })).toBeInTheDocument();
    const whatsapp = screen.getByRole("radio", { name: "WhatsApp" });
    expect(whatsapp).toHaveAttribute("aria-checked", "true");
    whatsapp.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("email"));
  });

  it("choices have no axe violations", async () => {
    const { container } = render(
      <div>
        <Checkbox label="Remember me" />
        <Switch label="Notifications" />
        <RadioGroup label="Plan" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("Select", () => {
  it("opens, selects an option and reports the value", async () => {
    const onChange = vi.fn();
    render(
      <Field label="Stage">
        <Select
          onValueChange={onChange}
          placeholder="Choose stage"
          options={[
            { value: "new", label: "New" },
            { value: "qualified", label: "Qualified" },
            { value: "won", label: "Won" },
          ]}
        />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Stage" });
    expect(trigger).toHaveTextContent("Choose stage");
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Qualified" }));
    expect(onChange).toHaveBeenCalledWith("qualified");
    await waitFor(() => expect(trigger).toHaveTextContent("Qualified"));
  });
});
