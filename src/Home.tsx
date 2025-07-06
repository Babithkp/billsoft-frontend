import { useState } from "react";import logo from "./assets/logobillsoft.png";
import { HiHome } from "react-icons/hi";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdOutlineInventory2 } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";
import { PiBagSimpleBold } from "react-icons/pi";
import { RiSettingsLine } from "react-icons/ri";
import Header from "./Header";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router";
import Dashboard from "./components/Dashboard";
import ClientPage from "./components/clients/ClientPage";
import InventryPage from "./components/inventory/InventryPage";
import Settings from "./components/settings/Settings";
import InvoicePage from "./components/invoice/InvoicePage";
import Expense from "./components/expenses/Expense";

interface Sections {
  dashboard: boolean;
  client: boolean;
  inventory: boolean;
  invoice: boolean;
  expenses: boolean;
  settings: boolean;
}

export default function Home() {
  const [version, setVersion] = useState("");
  const [sections, setSections] = useState({
    dashboard: true,
    client: false,
    inventory: false,
    invoice: false,
    expenses: false,
    settings: false,
  });
  let navigate = useNavigate();

  const sectionChangeHandler = (section: keyof Sections) => {
    setSections({
      dashboard: section === "dashboard",
      client: section === "client",
      inventory: section === "inventory",
      invoice: section === "invoice",
      expenses: section === "expenses",
      settings: section === "settings",
    });
  };

  const onLogoutHandler = () => {
    navigate("/");
  };
  return (
    <main className="flex h-screen ">
      <nav className="flex h-screen w-[20rem] flex-col justify-between gap-10 overflow-y-auto bg-[#FAFAFA] p-3 shadow-md ">
        <div className="flex w-full justify-center">
          <img src={logo} alt="logo" className="w-[16rem]" />
        </div>
        <div className="flex h-full flex-col items-start gap-5 max-xl:text-sm">
          <button
            className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white"
            onClick={() => sectionChangeHandler("dashboard")}
          >
            <HiHome size={24} color={sections.dashboard ? "black" : ""} />
            <p className={`${sections.dashboard ? "text-black" : ""}`}>Home</p>
          </button>
          <div className="w-full">
            <button
              className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white "
              onClick={() => sectionChangeHandler("client")}
            >
              <HiOutlineUsers size={24} color={sections.client ? "black" : ""} />
              <p className={`${sections.client ? "text-black" : ""}`}>Client Management</p>
            </button>
          </div>
          <div className="w-full">
            <button
              className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white"
              onClick={() => sectionChangeHandler("inventory")}
            >
              <MdOutlineInventory2 size={24} color={sections.inventory ? "black" : ""} />
              <p className={`${sections.inventory ? "text-black" : ""}`}>Inventory</p>
            </button>
          </div>
          <div className="w-full">
            <button
              className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white"
              onClick={() => sectionChangeHandler("invoice")}
            >
              <TbInvoice size={24} color={sections.invoice ? "black" : ""} />
              <p className={`${sections.invoice ? "text-black" : ""}`}>Invoice</p>
            </button>
          </div>
          <div className="w-full">
            <button
              className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white"
              onClick={() => sectionChangeHandler("expenses")}
            >
              <PiBagSimpleBold size={24} color={sections.expenses ? "black" : ""} />
              <p className={`${sections.expenses ? "text-black" : ""}`}>Expenses</p>
            </button>
          </div>
          <div className="w-full">
            <button
              className="hover:bg-muted-foreground text-muted flex w-full cursor-pointer gap-3 rounded-md p-2 font-medium hover:text-white"
              onClick={() => sectionChangeHandler("settings")}
            >
              <RiSettingsLine size={24} color={sections.settings ? "black" : ""} />
              <p className={`${sections.settings ? "text-black" : ""}`}>Settings</p>
            </button>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <Button
            className="bg-primary rounded-2xl px-20 text-white"
            onClick={onLogoutHandler}
          >
            Logout
          </Button>
          {version && <p>v{version}</p>}
        </div>
      </nav>
      <section className="flex h-full w-full flex-col gap-5 overflow-y-auto p-5">
        <Header title={sections} />
        {sections.dashboard && <Dashboard />}
        {sections.client && <ClientPage />}
        {sections.inventory && <InventryPage />}
        {sections.settings && <Settings />}
        {sections.invoice && <InvoicePage />}
        {sections.expenses && <Expense />}
      </section>
    </main>
  );
}
