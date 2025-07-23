import { RxCube } from "react-icons/rx";
import { TbInvoice } from "react-icons/tb";
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

import { VscLoading } from "react-icons/vsc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { MdOutlineAdd } from "react-icons/md";
import { Button } from "../ui/button";
import {
  createItemApi,
  createPurchaseApi,
  deleteItemApi,
  getAllItemsApi,
  getAllPurchasesApi,
  updateItemApi,
} from "@/api/item";
import { RiDeleteBin6Line, RiEditBoxLine } from "react-icons/ri";
import { HiOutlineCurrencyRupee } from "react-icons/hi";

export interface ItemInputs {
  id: string;
  itemName: string;
  category: string;
  supplerName: string;
  sellingPrice: number;
  measurement: number;
  tax: string;
  description: string;
  quantity: number;
}

export interface PurchaseInputs {
  id: string;
  itemName: string;
  date: string;
  purchasePrice: string;
  quantity: number;
  amount: number;
  paymentType: string;
  transactionId: string;
  item: ItemInputs;
}

export default function InventryPage({ data }: { data: ItemInputs[] }) {
  const [search, setSearch] = useState("");
  const [formStatus, setFormStatus] = useState<"create" | "edit">("create");
  const [itemCreateModal, setItemCreateModal] = useState(false);
  const [purchaseCreateModal, setPurchaseCreateModal] = useState(false);
  const [itemData, setItemData] = useState<ItemInputs[]>(data ?? []);
  const [filteredItem, setFilteredItem] = useState<ItemInputs[]>(data ?? []);
  const [itemDetailsModal, setItemDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemInputs | null>();
  const [isloading, setIsloading] = useState(false);
  const [isItemNameExists, setIsItemNameExists] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseInputs[]>([]);
  const [section, setSection] = useState({
    invoice: true,
    purchase: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ItemInputs>();

  const {
    register: registerPurchase,
    handleSubmit: handlePurchaseSubmit,
    reset: resetPurchase,
    setValue: setValuePurchase,
    control: controlPurchase,
    formState: { errors: errorsPurchase },
  } = useForm<PurchaseInputs>();

  useEffect(() => {
    const delay = setTimeout(() => {
      const text = search.trim().toLowerCase();

      if (!text) {
        setFilteredItem(itemData);
        return;
      }

      const filtered = itemData.filter((item) => {
        const fieldsToSearch: (string | number | undefined | null)[] = [
          item.itemName,
          item.supplerName,
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

      setFilteredItem(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, itemData]);

  const resetInputs = () => {
    (setFormStatus("create"), setSelectedItem(null), reset());
  };

  const setValuesToInputs = (item: ItemInputs) => {
    setFormStatus("edit");
    setItemDetailsModal(false);
    setValue("id", item.id);
    setValue("itemName", item.itemName);
    setValue("category", item.category);
    setValue("supplerName", item.supplerName);
    setValue("sellingPrice", item.sellingPrice);
    setValue("measurement", item.measurement);
    setValue("tax", item.tax);
    setValue("description", item.description);
  };

  const deleteItem = async () => {
    if (!selectedItem) {
      return;
    }
    setIsloading(true);
    const response = await deleteItemApi(selectedItem!.id);
    if (response && response.status === 200) {
      toast.success("Item deleted successfully");
      setItemDetailsModal(false);
      getAllItems();
    } else {
      toast.error("Item deletion failed");
    }
    setIsloading(false);
  };

  const onSubmitPurchase = async (data: PurchaseInputs) => {
    setIsloading(true);
    if (formStatus === "create") {
      const response = await createPurchaseApi(data);
      if (response && response.status === 200) {
        toast.success("Purchase created successfully");
        setPurchaseCreateModal(false);
        resetPurchase();
        getAllItems();
      } else {
        toast.error("Failed to create purchase");
      }
    }
    setIsloading(false);
  };

  const onSubmit = async (data: ItemInputs) => {
    setIsloading(true);
    if (formStatus === "create") {
      const response = await createItemApi(data);
      if (response && response.status === 200) {
        toast.success("Item created successfully");
        setItemCreateModal(false);
        reset();
        getAllItems();
      } else if (response && response.status === 202) {
        setIsItemNameExists(true);
        setTimeout(() => {
          setIsItemNameExists(false);
        }, 3000);
      } else {
        toast.error("Failed to create item");
      }
    } else if (formStatus === "edit") {
      const response = await updateItemApi(data);
      if (response && response.status === 200) {
        toast.success("Item updated successfully");
        setItemCreateModal(false);
        resetInputs();
        getAllItems();
      } else {
        toast.error("Item update failed");
      }
    }
    setIsloading(false);
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response && response.status === 200) {
      setItemData(response.data.data);
      setFilteredItem(response.data.data);
    }
  }

  async function getAllPurchases() {
    const response = await getAllPurchasesApi();
    if (response && response.status === 200) {
      setPurchaseData(response.data.data);
    }
  }
  useEffect(() => {
    getAllItems();
    getAllPurchases();
  }, []);

  return (
    <>
      <section>
        <div className="flex gap-10">
          <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <RxCube size={36} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted">Total inventory value</p>
                <p className="text-xl text-[#007E3B]">INR 0.00</p>
              </div>
            </div>
          </div>
          <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <HiOutlineCurrencyRupee size={30} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted">Total pending payment</p>
                <p className="text-xl text-[#007E3B]">INR {0}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <TbInvoice size={30} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted">Total tax paid</p>
                <p className="text-xl text-[#007E3B]">INR {0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {
        <section
          className={`flex h-fit max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-md bg-[#FAFAFA] p-5 shadow-md`}
        >
          <div className={`flex items-center justify-between`}>
            <p className="text-xl font-medium text-[#007E3B]">Inventory</p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 rounded-full bg-[#F4F7FE] p-3 px-5 shadow">
                <LuSearch size={18} />
                <input
                  placeholder="Search"
                  className="outline-none placeholder:font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="border-primary rounded-lg"
                variant={"outline"}
                onClick={() => setSection({ invoice: false, purchase: true })}
              >
                View Purchases
              </Button>
              <Dialog
                open={purchaseCreateModal}
                onOpenChange={setPurchaseCreateModal}
              >
                <DialogTrigger
                  className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-3 text-sm font-medium text-white"
                  onClick={resetInputs}
                >
                  <MdOutlineAdd size={20} />
                  Record Purchase
                </DialogTrigger>
                <DialogContent className="min-w-7xl">
                  <DialogHeader>
                    <DialogTitle className="text-secondary">
                      {formStatus === "create"
                        ? "New Purchase"
                        : "Update Purchase"}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <div>
                    <form
                      onSubmit={handlePurchaseSubmit(onSubmitPurchase)}
                      className="flex flex-wrap justify-between gap-5"
                    >
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Item Name</label>
                          <Controller
                            name="itemName"
                            control={controlPurchase}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                                  <SelectValue
                                    placeholder="Select item"
                                    className="data-placeholder:text-black"
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {itemData.map((item) => (
                                    <SelectItem value={item.id}>
                                      {item.itemName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {errorsPurchase.itemName && (
                          <p className="text-red-500">Item Name is required</p>
                        )}
                      </div>
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Date</label>
                          <input
                            type="date"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...registerPurchase("date", { required: true })}
                          />
                        </div>
                        {errorsPurchase.date && (
                          <p className="text-red-500">Date is required</p>
                        )}
                      </div>
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">
                            Purchase Price/unit
                          </label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...registerPurchase("purchasePrice", {
                              required: true,
                            })}
                          />
                        </div>
                        {errorsPurchase.purchasePrice && (
                          <p className="text-red-500">
                            Purchase Price is required
                          </p>
                        )}
                      </div>
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Purchase Qty</label>
                          <input
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...registerPurchase("quantity", {
                              required: true,
                            })}
                          />
                        </div>
                        {errorsPurchase.quantity && (
                          <p className="text-red-500">quantity is required</p>
                        )}
                      </div>
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Amount</label>
                          <input
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...registerPurchase("amount", { required: true })}
                          />
                        </div>
                        {errorsPurchase.amount && (
                          <p className="text-red-500">Amount is required</p>
                        )}
                      </div>
                      <div className="w-[49%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Payment type</label>
                          <Controller
                            name="paymentType"
                            control={controlPurchase}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                                  <SelectValue
                                    placeholder="Select payment type"
                                    className="data-placeholder:text-black"
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="IMPS">IMPS</SelectItem>
                                  <SelectItem value="RTGS">RTGS</SelectItem>
                                  <SelectItem value="NEFT">NEFT</SelectItem>
                                  <SelectItem value="Cheque">Cheque</SelectItem>
                                  <SelectItem value="Others">Others</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {errorsPurchase.paymentType && (
                          <p className="text-red-500">
                            Payment type is required
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">
                            Transaction Reference number
                          </label>
                          <input
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...registerPurchase("transactionId", {
                              required: true,
                            })}
                          />
                        </div>
                        {errorsPurchase.transactionId && (
                          <p className="text-red-500">
                            Transaction Id is required
                          </p>
                        )}
                      </div>
                      <div className="flex w-full justify-end">
                        <Button
                          className="rounded-xl px-7"
                          disabled={isloading}
                        >
                          {isloading ? (
                            <VscLoading size={24} className="animate-spin" />
                          ) : formStatus === "create" ? (
                            "Record Purchase"
                          ) : (
                            "Update Purchase"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={itemCreateModal} onOpenChange={setItemCreateModal}>
                <DialogTrigger
                  className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-3 font-medium text-white"
                  onClick={resetInputs}
                >
                  <MdOutlineAdd size={20} />
                  Create Item
                </DialogTrigger>
                <DialogContent className="min-w-7xl">
                  <DialogHeader>
                    <DialogTitle className="text-secondary">
                      {formStatus === "create" ? "Add Item" : "Update Item"}
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
                          <label className="font-medium">Item Name</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("itemName", { required: true })}
                          />
                        </div>
                        {errors.itemName && (
                          <p className="text-red-500">Item Name is required</p>
                        )}
                        {isItemNameExists && (
                          <p className="text-red-500">
                            Item name already exists
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Supplier Name</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("supplerName", { required: true })}
                          />
                        </div>
                        {errors.supplerName && (
                          <p className="text-red-500">
                            Supplier Name is required
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Category</label>
                          <input
                            type="text"
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("category", { required: true })}
                          />
                        </div>
                        {errors.category && (
                          <p className="text-red-500">Category is required</p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Selling price</label>
                          <input
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("sellingPrice", { required: true })}
                          />
                        </div>
                        {errors.sellingPrice && (
                          <p className="text-red-500">
                            Selling Price is required
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">
                            Unit of measurement
                          </label>
                          <input
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("measurement", { required: true })}
                          />
                        </div>
                        {errors.measurement && (
                          <p className="text-red-500">
                            Unit of measurement is required
                          </p>
                        )}
                      </div>
                      <div className="w-[30%]">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">Tax %</label>
                          <Controller
                            name="tax"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                                  <SelectValue
                                    placeholder="Select tax"
                                    className="data-placeholder:text-black"
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="12">12</SelectItem>
                                  <SelectItem value="18">18</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {errors.tax && (
                          <p className="text-red-500">Tax is required</p>
                        )}
                      </div>
                      <div className="w-full">
                        <div className="flex flex-col gap-2">
                          <label className="font-medium">
                            Product description
                          </label>
                          <textarea
                            className="border-primary rounded-md border p-1 py-2 pl-2"
                            {...register("description", { required: true })}
                          />
                        </div>
                        {errors.description && (
                          <p className="text-red-500">
                            description is required
                          </p>
                        )}
                      </div>
                      <div className="flex w-full justify-end">
                        <Button
                          className="rounded-xl px-7"
                          disabled={isloading}
                        >
                          {isloading ? (
                            <VscLoading size={24} className="animate-spin" />
                          ) : formStatus === "create" ? (
                            "Add Item"
                          ) : (
                            "Update Item"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {section.purchase && (
            <table className={`w-full`}>
              <thead>
                <tr>
                  <th className="text-muted text-start font-medium">
                    <div className="flex items-center gap-2">
                      <p>Item name</p>
                    </div>
                  </th>
                  <th className="text-muted text-start font-medium">
                    Purchase Date
                  </th>
                  <th className="text-muted flex items-center text-start font-medium">
                    Purchase Qty
                  </th>
                  <th className="text-muted text-start font-medium">
                    Purchase Price (per unit)
                  </th>
                  <th className="text-muted text-start font-medium">
                    Total Purchase value
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.map((item) => (
                  <tr key={item.id} className="hover:bg-accent cursor-pointer">
                    <td className="py-2">{item.item.itemName}</td>
                    <td className="py-2">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{item.purchasePrice}</td>
                    <td className="py-2">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {section.invoice && (
            <table className={`w-full`}>
              <thead>
                <tr>
                  <th className="text-muted text-start font-medium">
                    <div className="flex items-center gap-2">
                      <p>Item name</p>
                    </div>
                  </th>
                  <th className="text-muted text-start font-medium">
                    Bought from
                  </th>
                  <th className="text-muted flex items-center text-start font-medium">
                    Qty (in stock)
                  </th>
                  <th className="text-muted text-start font-medium">
                    Selling price (per unit)
                  </th>
                  <th className="text-muted text-start font-medium">
                    Taxable amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItem.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-accent cursor-pointer"
                    onClick={() => [
                      setSelectedItem(item),
                      setItemDetailsModal(true),
                    ]}
                  >
                    <td className="py-2">{item.itemName}</td>
                    <td className="py-2">{item.supplerName}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{item.sellingPrice}</td>
                    <td className="py-2">
                      {item.sellingPrice * (parseInt(item.tax) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      }
      <Dialog open={itemDetailsModal} onOpenChange={setItemDetailsModal}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl">
          <DialogHeader className="flex">
            <DialogTitle className="text-secondary flex justify-between">
              <span>{selectedItem?.itemName}</span>
              <div className="mr-10 flex gap-3">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setValuesToInputs(selectedItem!),
                    setItemCreateModal(true),
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
                        Are you sure you want to remove this Item? This action
                        is permanent and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                        onClick={deleteItem}
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
          <div className="grid grid-cols-4 gap-5">
            <div className="flex items-center gap-5">
              <label className="font-medium">Category</label>
              <p>{selectedItem?.category}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Stock Left</label>
              <p>{selectedItem?.quantity}</p>
            </div>
            <div className="col-span-2 flex items-center gap-5">
              <label className="font-medium">Units</label>
              <p>{selectedItem?.measurement}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Tax paid (per unit)</label>
              <p>{selectedItem?.tax}</p>
            </div>
            <div className="flex items-start gap-2">
              <label className="font-medium">Selling price</label>
              <p>INR {selectedItem?.sellingPrice}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Supplier Name</label>
              <p>{selectedItem?.supplerName}</p>
            </div>
            <div className="col-span-full flex flex-col gap-2">
              <label className="font-medium">Product Description</label>
              <p>{selectedItem?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
