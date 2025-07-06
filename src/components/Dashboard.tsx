import { HiOutlineCurrencyRupee } from "react-icons/hi";import { PiUsersThree } from "react-icons/pi";
import { PiHandbagSimpleBold } from "react-icons/pi";
import { FaRegClock } from "react-icons/fa6";

export default function Dashboard() {
  return (
    <section>
      <div className="flex gap-10">
        <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <HiOutlineCurrencyRupee size={36} className="text-primary"/>
            </div>
            <div className="font-medium">
              <p className="text-muted ">Total Invoicing value</p>
              <p className="text-xl text-[#007E3B]">
                INR{" "}
                {/* {billData.reduce((acc, bill) => acc + bill.subTotal, 0).toFixed(2)} */}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <PiHandbagSimpleBold size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted ">Total Purchase Value</p>
              <p className="text-xl text-[#007E3B]">INR </p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <PiUsersThree size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted ">Customers</p>
              <p className="text-xl text-[#007E3B]">10</p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <FaRegClock size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted text-sm">Pending payments</p>
              <p className="text-xl text-[#007E3B]">INR </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
