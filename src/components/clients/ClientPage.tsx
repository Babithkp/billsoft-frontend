import { TbCopy } from "react-icons/tb";import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Button } from "../ui/button";
import { MdOutlineAdd } from "react-icons/md";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { VscLoading } from "react-icons/vsc";
import {
  createClientApi,
  deleteClientApi,
  getAllClientsApi,
  updateClientApi,
} from "@/api/client";
import { toast } from "react-toastify";
import { RiDeleteBin6Line, RiEditBoxLine } from "react-icons/ri";
import { PiUsersThree } from "react-icons/pi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";

export interface ClientInputs {
  id: string;
  name: string;
  branchName: string;
  GSTIN: string;
  contactPerson: string;
  email: string;
  contactNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: number;
  creditLimit: number;
  outstanding: number;
}

export default function ClientPage({data}:{data:ClientInputs[]}) {
  const [search, setSearch] = useState("");
  const [formStatus, setFormStatus] = useState<"create" | "edit">("create");
  const [isClientNameAvailable, setIsClientNameAvailable] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [clientCreateModal, setClientCreateModal] = useState(false);
  const [clientData, setClientData] = useState<ClientInputs[]>(data || []);
  const [filteredClients, setFilteredClients] = useState<ClientInputs[]>(data || []);
  const [clientDetailsModal, setClientDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientInputs | null>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientInputs>();

  useEffect(() => {
    const delay = setTimeout(() => {
      const text = search.trim().toLowerCase();

      if (!text) {
        setFilteredClients(clientData);
        return;
      }

      const filtered = clientData.filter((client) => {
        const fieldsToSearch: (string | number | undefined | null)[] = [
          client.name,
          client.contactPerson,
          client.email,
          client.address,
          client.city,
          client.state,
        ];

        return fieldsToSearch.some((field) => {
          if (typeof field === "string") {
            return field.toLowerCase().includes(text);
          }
          if (typeof field === "number") {
            return field.toString().includes(text);
          }
          return false;
        });
      });

      setFilteredClients(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, clientData]);

  const resetInputs = () => {
    setFormStatus("create"), setSelectedClient(null), reset();
  };

  const setValuesToInputs = (client: ClientInputs) => {
    setFormStatus("edit");
    setClientDetailsModal(false);
    setValue("id", client.id);
    setValue("name", client.name);
    setValue("GSTIN", client.GSTIN);
    setValue("contactPerson", client.contactPerson);
    setValue("email", client.email);
    setValue("contactNumber", client.contactNumber);
    setValue("address", client.address);
    setValue("city", client.city);
    setValue("state", client.state);
    setValue("pincode", client.pincode);
    setValue("creditLimit", client.creditLimit);
  };

  const onDeleteClientSubmit = async () => {
    if (!selectedClient) {
      return;
    }
    setIsloading(true);
    const response = await deleteClientApi(selectedClient!.id);
    if (response && response.status === 200) {
      toast.success("Client deleted successfully");
      setClientDetailsModal(false);
      getClients();
    } else {
      toast.error("Client deletion failed");
    }
    setIsloading(false);
  };

  const onSubmit = async (data: ClientInputs) => {
    if (data.branchName) {
      data.name = data.name.trim() + "-" + data.branchName.trim();
    }
    setIsloading(true);
    if (formStatus === "create") {
      const response = await createClientApi(data);
      if (response && response.status === 200) {
        toast.success("Client created successfully");
        reset();
        setClientCreateModal(false);
        getClients();
      } else if (response && response.status === 202) {
        setIsClientNameAvailable(true);
        setTimeout(() => {
          setIsClientNameAvailable(false);
        }, 3000);
      } else {
        toast.error("Client creation failed");
      }
    } else if (formStatus === "edit") {
      const response = await updateClientApi(data);
      if (response && response.status === 200) {
        toast.success("Client updated successfully");
        resetInputs();
        setClientCreateModal(false);
        getClients();
      } else {
        toast.error("Client update failed");
      }
    }
    setIsloading(false);
  };

  async function getClients() {
    const response = await getAllClientsApi();
    if (response && response.status === 200) {
      setClientData(response.data.data);
      setFilteredClients(response.data.data);
    }
  }

  useEffect(() => {
    getClients();
  }, []);

  return (
    <>
      <section>
        <div className="flex gap-10">
          <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md border">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <PiUsersThree size={36} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted ">Clients</p>
                <p className="text-xl text-[#007E3B]">{clientData.length}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md border">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <HiOutlineCurrencyRupee size={30} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted ">Total pending payment</p>
                <p className="text-xl text-[#007E3B]">INR {clientData?.reduce((acc, curr) => acc + curr?.outstanding, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex gap-5">
          <div
            className={`flex h-fit max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-md bg-[#FAFAFA] p-5 shadow-md`}
          >
            <div className={`flex items-center justify-between`}>
              <p className="text-xl font-medium text-[#007E3B]">Client</p>
              <div className="flex gap-5 items-center">
                <div className="  flex items-center gap-2 rounded-full bg-[#F4F7FE] p-3 px-5 shadow">
                  <LuSearch size={18} />
                  <input
                    placeholder="Search"
                    className="outline-none placeholder:font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog
                  open={clientCreateModal}
                  onOpenChange={setClientCreateModal}
                >
                  <DialogTrigger
                    className="bg-primary hover:bg-primary cursor-pointer flex items-center gap-2 rounded-2xl p-2 px-3 font-medium text-white"
                    onClick={resetInputs}
                  >
                    <MdOutlineAdd size={24} />
                    Create new
                  </DialogTrigger>
                  <DialogContent className="min-w-7xl">
                    <DialogHeader>
                      <DialogTitle className="text-secondary">
                        {formStatus === "create" ? "New Client" : "Edit Client"}
                      </DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                  <div>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex flex-wrap justify-between gap-5"
                    >
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Client Name</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("name", { required: true })}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500">
                            Client Name is required
                          </p>
                        )}
                        {isClientNameAvailable && (
                          <p className="text-red-500">
                            Client Name already exists, please try another one
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Client GSTIN</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("GSTIN", { required: true })}
                          />
                        </div>
                        {errors.GSTIN && (
                          <p className="text-red-500">
                            Client GSTIN is required
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>Branch Name (Optional)</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("branchName")}
                          />
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>Contact Person</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("contactPerson", { required: true })}
                          />
                          {errors.contactPerson && (
                            <p className="mt-1 text-sm text-red-500">
                              Contact Person is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>Email ID</label>
                          <input
                            type="email"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("email", { required: true })}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                              Email ID is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>Contact Number</label>
                          <input
                            type="number"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("contactNumber", {
                              required: true,
                              minLength: 10,
                              maxLength: 10,
                            })}
                          />
                          {errors.contactNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              Contact Number should be 10 digits
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="flex flex-col gap-2">
                          <label>Address</label>
                          <textarea
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("address", { required: true })}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-500">
                              Address is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>City</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("city", { required: true })}
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-500">
                              City is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>State</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("state", { required: true })}
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-red-500">
                              State is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label>Pincode</label>
                          <input
                            type="number"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("pincode", {
                              required: true,
                              minLength: 4,
                            })}
                          />
                          {errors.pincode && (
                            <p className="mt-1 text-sm text-red-500">
                              Pincode is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="flex flex-col gap-2">
                          <label>Credit limit</label>
                          <div className="border-primary flex items-center rounded-md border pl-2">
                            <p className="text-xs font-medium">INR</p>
                            <input
                              type="text"
                              placeholder="00000.00"
                              className="w-full p-2 outline-none"
                              {...register("creditLimit", {
                                required: true,
                              })}
                            />
                          </div>
                          {errors.creditLimit && (
                            <p className="mt-1 text-sm text-red-500">
                              Credit Limit is required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full justify-end">
                        <Button
                          className="rounded-xl px-7"
                          disabled={isloading}
                        >
                          {isloading ? (
                            <VscLoading size={24} className="animate-spin" />
                          ) : formStatus === "create" ? (
                            "Create Client"
                          ) : (
                            "Update Client"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <table className={`w-full`}>
            <thead>
              <tr>
                <th className="text-start font-medium text-muted">
                  <div className="flex items-center gap-2">
                    <p>Client Name</p>
                  </div>
                </th>
                <th className="text-start font-medium text-muted">
                  <div className="flex items-center gap-2">
                    <p>Owner Name</p>
                  </div>
                </th>
                <th className="flex items-center gap-2 text-start font-medium text-muted">
                  <p>Total Bill amount</p>
                </th>
                <th className="text-start font-medium text-muted">
                  Pending payment
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, i) => (
                <tr
                  key={i}
                  className="hover:bg-accent cursor-pointer"
                  onClick={() => [
                    setSelectedClient(client),
                    setClientDetailsModal(true),
                  ]}
                >
                  <td className="py-2">{client.name}</td>
                  <td className="py-2">{client.contactPerson}</td>
                  <td className="flex items-center gap-2 py-2">
                    <p>{client.contactPerson}</p>
                  </td>
                  <td className="py-2">{client.outstanding || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={clientDetailsModal} onOpenChange={setClientDetailsModal}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl">
          <DialogHeader className="flex ">
            <DialogTitle className="text-secondary flex justify-between ">
              <span>Client details</span>
              <div className="mr-10 flex gap-3">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setValuesToInputs(selectedClient!),
                    setClientCreateModal(true),
                  ]}
                >
                  <RiEditBoxLine size={20} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger className="cursor-pointer">
                    <RiDeleteBin6Line size={20} color="red" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Alert!</AlertDialogTitle>
                      <AlertDialogDescription className="font-medium text-black">
                        Are you sure you want to remove this client? This action
                        is permanent and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                        onClick={onDeleteClientSubmit}
                        disabled={isloading}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-5">
            <div className="flex items-center gap-5">
              <label className="font-medium">Client Name</label>
              <p>{selectedClient?.name}</p>
            </div>
            <div className="col-span-2 flex items-center gap-5">
              <label className="font-medium">Client GSTIN</label>
              <p>{selectedClient?.GSTIN}</p>
            </div>

            <div className="flex items-center gap-5">
              <label className="font-medium">Contact Person</label>
              <p>{selectedClient?.contactPerson}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Contact Number</label>
              <p>{selectedClient?.contactNumber.toString()}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Email id</label>
              <p>{selectedClient?.email}</p>
              <Popover>
                <PopoverTrigger className="cursor-pointer">
                  <TbCopy
                    size={20}
                    onClick={() =>
                      navigator.clipboard.writeText(
                        selectedClient!.email.toString()
                      )
                    }
                  />
                </PopoverTrigger>
                <PopoverContent className="w-fit p-2">Copied!</PopoverContent>
              </Popover>
            </div>
            <div className="col-span-full flex flex-col items-start gap-2">
              <label className="font-medium">Address</label>
              <p>{selectedClient?.address}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Pin code</label>
              <p>{selectedClient?.pincode}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">City</label>
              <p>{selectedClient?.city}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">State</label>
              <p>{selectedClient?.state}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Pending payment</label>
              <p>INR {selectedClient?.outstanding || 0}</p>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-5 pr-10">
              <label className="font-medium">Credit Limit</label>
              <p>INR {selectedClient?.creditLimit}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
