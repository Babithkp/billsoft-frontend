import { useState } from "react";
import logo from "../assets/logobillsoft.png";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineLock } from "react-icons/md";
import { Button } from "./ui/button";
import { VscLoading } from "react-icons/vsc";
import tikonaLogo from "../assets/trikona.png";
import { useNavigate } from "react-router";
import { loginApi } from "@/api/admin";
import { toast } from "react-toastify";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState("");
  let navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    const response  = await loginApi(userName, password);
    
    if (response && response.status === 200) {
      setUserName("");
      setPassword("");
      toast.success("Login Successful");
      navigate("/home");
    } else {
      toast.error("Invalid Credentials");
    }
    setIsLoading(false);
  };

  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <section className="grid h-full place-content-center">
        <form className="flex w-[25rem] flex-col items-center gap-10 bg-[#FAFAFA]  rounded-md p-10 shadow-lg">
          <div className="text-center">
            <img src={logo} alt="logo" className="h-[150px] object-cover" />
            <h3 className="text-xl font-medium">Welcome Back!</h3>
          </div>
          <div className="flex w-full flex-col gap-5 text-sm">
            <div className="flex w-full items-center gap-2 rounded-md border border-black p-2 px-3">
              <FaRegUser size={14} />
              <input
                placeholder="Username"
                className="w-full outline-none placeholder:text-black"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="flex w-full items-center gap-2 rounded-md border border-black p-2 px-3">
              <MdOutlineLock size={17} />
              <input
                placeholder="Password"
                className="w-full outline-none placeholder:text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>
          </div>
          <Button
            className="bg-primary w-full cursor-pointer"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <VscLoading size={24} className="animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </section>
      <footer className="bg-primary flex h-[4rem] w-full flex-col items-end justify-center px-10 text-sm text-white">
        <div>{version && <p>v{version}</p>}</div>
        <div className="flex items-center gap-2 font-medium">
          <p>A Product of</p>
          <a href="https://www.trikonatech.com" target="_blank">
            <img src={tikonaLogo} alt="tikona" className="w-8" />
          </a>
          <p>Trikona</p>
        </div>
      </footer>
    </main>
  );
}
