import { useEffect, useState } from "react";
import { TbEdit } from "react-icons/tb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { getSettingsApi, updateSettingsApi } from "@/api/settings";
import { Button } from "../ui/button";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";

export interface SettingsInputs {
  address: string;
  contactNumber: string;
  email: string;
  website: string;
  GSTIN: string;
  HSN: string;
  alternateContactNumber: string;
  bankName: string;
  AccountNo: string;
  IFSC: string;
  invoiceSequence: number;
  quotationSequence: number;
  expenseSequence: number;
}

export default function Settings() {
  const [settingsData, setSettingsData] = useState<SettingsInputs | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtherSettingsModalOpen, setIsOtherSettingsModalOpen] =
    useState(false);
  const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsInputs>();

  const onSubmit = async (data: SettingsInputs) => {
    setIsLoading(true);
    const response = await updateSettingsApi(data);
    if (response && response.status === 200) {
      toast.success("Settings updated successfully");
      setIsProfileModalOpen(false);
      setIsOtherSettingsModalOpen(false);
      setIsBankDetailsModalOpen(false);
      getSettingsData();
    } else {
      toast.error("Settings update failed");
    }
    setIsLoading(false);
  };

  async function getSettingsData() {
    const response = await getSettingsApi();
    if (response && response.status === 200) {
      setSettingsData(response.data.data);
      setValue("email", response.data.data.email);
      setValue("contactNumber", response.data.data.contactNumber);
      setValue(
        "alternateContactNumber",
        response.data.data.alternateContactNumber
      );
      setValue("GSTIN", response.data.data.GSTIN);
      setValue("HSN", response.data.data.HSN);
      setValue("website", response.data.data.website);
      setValue("address", response.data.data.address);
      setValue("bankName", response.data.data.bankName);
      setValue("AccountNo", response.data.data.AccountNo);
      setValue("IFSC", response.data.data.IFSC);
      setValue("invoiceSequence", response.data.data.invoiceSequence);
      setValue("quotationSequence", response.data.data.quotationSequence);
      setValue("expenseSequence", response.data.data.expenseSequence);
    }
  }

  useEffect(() => {
    getSettingsData();
  }, []);

  return (
    <>
      <section>
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-medium">Basic Settings</p>
          <div className="flex flex-col gap-3 rounded-md bg-[#FAFAFA] p-5 px-10">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">Profile Details</p>
              <TbEdit
                size={24}
                color="black"
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-5 text-sm">
                <div>
                  <label className="font-medium">Address (regd office)</label>
                  <p className="w-[30%]">{settingsData?.address}</p>
                </div>
                <div>
                  <label className="font-medium">Email ID</label>
                  <p className="w-[20%]">{settingsData?.email}</p>
                </div>
                <div>
                  <label className="font-medium">Company GSTIN</label>
                  <p className="w-[20%]">{settingsData?.GSTIN}</p>
                </div>
              </div>
              <div className="flex w-[50%] flex-col gap-5 text-sm">
                <div>
                  <label className="font-medium">Contact Number</label>
                  <p className="w-[20%]">{settingsData?.contactNumber}</p>
                </div>
                <div>
                  <label className="font-medium">
                    Alternate Contact Number
                  </label>
                  <p className="w-[20%]">
                    {settingsData?.alternateContactNumber}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Website URL</label>
                  <p className="w-[20%]">{settingsData?.website}</p>
                </div>
                <div>
                  <label className="font-medium">HSN/ SAC</label>
                  <p className="w-[20%]">{settingsData?.HSN}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-md bg-[#FAFAFA] p-5 px-10 ">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">Other Settings</p>
              <TbEdit
                size={24}
                color="black"
                onClick={() => setIsOtherSettingsModalOpen(true)}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-3">
                <label className="font-medium">Current Invoice ID:</label>
                <p>{settingsData?.invoiceSequence}</p>
              </div>
              <div className="flex gap-3 ">
                <label className="font-medium">Current Expense ID:</label>
                <p>{settingsData?.expenseSequence}</p>
              </div>
              <div className="flex gap-3 w-[20%]">
                <label className="font-medium">Current Quotation ID:</label>
                <p>{settingsData?.quotationSequence}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-2xl font-medium">Company Settings</p>
            <div className="flex flex-col gap-3 rounded-md bg-[#FAFAFA] p-5 px-10">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">Bank Details</p>
                <TbEdit
                  size={24}
                  color="black"
                  onClick={() => setIsBankDetailsModalOpen(true)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex justify-between pr-30 text-sm">
                <div className="flex w-full justify-between">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Bank Name</label>
                    <p>{settingsData?.bankName}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Account Number</label>
                    <p>{settingsData?.AccountNo}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">IFSC Code</label>
                    <p>{settingsData?.IFSC}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-7xl">
          <DialogHeader>
            <DialogTitle className="text-secondary">
              Profile settings
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap justify-between gap-5"
          >
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Email ID</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500">Email is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Contact Number</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("contactNumber", { required: true })}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-500">Contact Number is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Alternate Contact Number</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("alternateContactNumber", { required: true })}
                />
              </div>
              {errors.alternateContactNumber && (
                <p className="text-red-500">
                  Alternate Contact Number is required
                </p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">GSTIN</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("GSTIN", {
                    required: true,
                    minLength: 15,
                    maxLength: 15,
                  })}
                />
              </div>
              {errors.GSTIN && (
                <p className="text-red-500">
                  GSTIN is required and should be 15 characters
                </p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">HSN</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("HSN", { required: true })}
                />
              </div>
              {errors.HSN && <p className="text-red-500">HSN is required</p>}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Website URL</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("website", {
                    required: true,
                  })}
                />
              </div>
              {errors.website && (
                <p className="text-red-500">Website URL is required</p>
              )}
            </div>

            <div className="w-full">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Address</label>
                <textarea
                  className="border-primary h-[10vh] rounded-md border p-1 py-2 pl-2"
                  {...register("address", { required: true })}
                />
              </div>
              {errors.address && (
                <p className="text-red-500">Address is required</p>
              )}
            </div>

            <div className="flex w-full justify-end">
              <Button className="rounded-xl px-7" disabled={isLoading}>
                {isLoading ? (
                  <VscLoading size={24} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isOtherSettingsModalOpen}
        onOpenChange={setIsOtherSettingsModalOpen}
      >
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-7xl">
          <DialogHeader>
            <DialogTitle className="text-secondary">Other Settings</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap justify-between gap-5"
          >
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Invoice ID</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("invoiceSequence", { required: true })}
                />
              </div>
              {errors.invoiceSequence && (
                <p className="text-red-500">Invoice ID is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Expense ID</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("expenseSequence", { required: true })}
                />
              </div>
              {errors.expenseSequence && (
                <p className="text-red-500">Expense ID is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Quotation ID</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("quotationSequence", { required: true })}
                />
              </div>
              {errors.quotationSequence && (
                <p className="text-red-500">Quotation ID is required</p>
              )}
            </div>
            <div className="flex w-full justify-end">
              <Button className="rounded-xl px-7" disabled={isLoading}>
                {isLoading ? (
                  <VscLoading size={24} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isBankDetailsModalOpen}
        onOpenChange={setIsBankDetailsModalOpen}
      >
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-7xl">
          <DialogHeader>
            <DialogTitle className="text-secondary">Bank Details</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap justify-between gap-5"
          >
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Bank Name</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("bankName", { required: true })}
                />
              </div>
              {errors.bankName && (
                <p className="text-red-500">Bank Name is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Account Number</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("AccountNo", { required: true })}
                />
              </div>
              {errors.AccountNo && (
                <p className="text-red-500">Account Number is required</p>
              )}
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label className="font-medium">IFSC Code</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2"
                  {...register("IFSC", { required: true })}
                />
              </div>
              {errors.IFSC && (
                <p className="text-red-500">IFSC Number is required</p>
              )}
            </div>

            <div className="flex w-full justify-end">
              <Button className="rounded-xl px-7" disabled={isLoading}>
                {isLoading ? (
                  <VscLoading size={24} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
