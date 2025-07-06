import { BiBell } from "react-icons/bi";

interface SectionsState {
  dashboard: boolean;
  client: boolean;
  inventory: boolean;
  invoice: boolean;
  expenses: boolean;
  settings: boolean;
}

const sectionLabels: Record<keyof SectionsState, string> = {
  dashboard: "Home",
  client: "Client Management",
  inventory: "Inventory",
  invoice: "Invoice and Quotes",
  expenses: "Expenses",
  settings: "Settings",
};

export default function Header({ title }: { title: SectionsState }) {
  const activeSection = Object.entries(title).find(
    ([_, isActive]) => isActive
  )?.[0] as keyof SectionsState;
  return (
    <section className="flex w-full justify-between">
      <div>
        <p className="text-3xl font-medium capitalize">
        Billsoft - {sectionLabels[activeSection]}
        </p>
      </div>
      <div className="flex items-center gap-5 rounded-full bg-[#FAFAFA] p-3 px-5">
        <div className="flex items-center gap-2 rounded-full">
          <button>
            <BiBell size={24} color="#A3AED0" />
          </button>
        </div>
      </div>
    </section>
  );
}
