import { Card } from "./AdminUI.jsx";
import ListManager from "./ListManager.jsx";

const FIELDS = [
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
];

// State is lifted to the dashboard so edits survive switching tabs.
export default function HowItWorksEditor({ steps, onChange }) {
  return (
    <Card title="How it works" description="Shown as a numbered sequence, so keep these in order.">
      <ListManager
        listName="howItWorks"
        items={steps}
        fields={FIELDS}
        emptyItem={{ title: "New step", description: "" }}
        onChange={onChange}
      />
    </Card>
  );
}
