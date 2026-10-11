import { useState } from "react";
import { RadioGroup } from "@heigin/ui";

export default function RadioGroupBasic() {
  const [channel, setChannel] = useState("whatsapp");
  return (
    <RadioGroup
      label="Preferred channel"
      value={channel}
      onValueChange={setChannel}
      options={[
        { value: "whatsapp", label: "WhatsApp", description: "Fastest replies" },
        { value: "email", label: "Email" },
        { value: "call", label: "Phone call" },
        { value: "sms", label: "SMS", disabled: true },
      ]}
    />
  );
}
