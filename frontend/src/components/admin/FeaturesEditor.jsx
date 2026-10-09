import { Card } from "./AdminUI.jsx";
import ListManager from "./ListManager.jsx";

const FIELDS = [
  {
    key: "icon",
    label: "Icon",
    type: "select",
    options: [
      { value: "type", label: "Keyboard" },
      { value: "mic", label: "Microphone" },
      { value: "camera", label: "Camera" },
    ],
  },
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
];

// `items`/`onChange` are lifted up to the dashboard so edits survive
// switching tabs (this component can unmount/remount as tabs change).
export default function FeaturesEditor({ features, onChange }) {
  return (
    <Card title="Features" description="The three (or more) ways someone can translate with Kabya.">
      <ListManager
        listName="features"
        items={features}
        fields={FIELDS}
        emptyItem={{ icon: "type", title: "New feature", description: "" }}
        onChange={onChange}
      />
    </Card>
  );
}
