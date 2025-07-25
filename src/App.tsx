import "./App.css";
import { Routes, Route } from "react-router";
import Login from "./components/Login";
import Home from "./Home";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { emit } from "@tauri-apps/api/event";

async function autoUpdater() {
  try {
    const update = await check();
    if (update) {
      toast.success(`Update available: ${update.version}`);
      emit("tauri://update-request");
      await update.downloadAndInstall();
      await relaunch();
    } else {
      toast.info("No update available");
    }
  } catch (err) {
    toast.error("Update check failed");
  }
}

function App() {
  useEffect(() => {
    autoUpdater().catch(console.error);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
