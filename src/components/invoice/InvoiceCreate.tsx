import { Controller, useForm } from "react-hook-form";
import { ClientInputs } from "../clients/ClientPage";
import { ItemInputs } from "../inventory/InventryPage";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getAllClientsApi } from "@/api/client";
import { getAllItemsApi } from "@/api/item";
import { Button } from "../ui/button";
import { createInvoiceApi, updateInvoiceApi } from "@/api/invoice";
import { toast } from "react-toastify";
import { VscLoading } from "react-icons/vsc";
import { getInvoiceIdApi } from "@/api/settings";

import { Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { InvoiceInput } from "./InvoiceList";

export interface ItemConfig {
  itemId: string;
  itemName: string;
  amount: string;
  tax: string;
  remainingQuantity: string;
  sellingPrice: string;
  quantity: string;
  actualTax: string;
}

type Invoice = {
  id: string;
  invoiceId: string;
  date: string;
  dueDate: string;
  discount: string;
  status: string;
  total: number;
  pendingAmount: number;
  clientId: string;
  Client: Client;
  items: ItemConfig[];
};

type Client = {
  id: string;
  name: string;
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
};

export default function InvoiceCreate({
  setSection,
  invoiceToEdit,
  setInvoiceToEdit,
}: {
  setSection: any;
  invoiceToEdit?: InvoiceInput;
  setInvoiceToEdit?: any;
}) {
  const [formStatus, setFormStatus] = useState<"edit" | "create">("create");
  const [invoiceIdExists, setInvoiceIdExists] = useState(false);
  const [clientData, setClientData] = useState<ClientInputs[]>([]);
  const [selectedItems, setSelectedItems] = useState<ItemConfig[]>([]);
  const [itemData, setItemData] = useState<ItemInputs[]>([]);
  const [discountTotal, setDiscountTotal] = useState("0");
  const [total, setTotal] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [itemConfig, setItemConfig] = useState({
    itemId: "",
    itemName: "",
    quantity: "",
    remainingQuantity: "",
    amount: "",
    tax: "",
    actualTax: "",
    sellingPrice: "",
  });
  const [quantityError, setQuantityError] = useState(false);

  useEffect(() => {
    if (
      parseInt(itemConfig.remainingQuantity) < parseInt(itemConfig.quantity)
    ) {
      setQuantityError(true);
      return;
    } else {
      setQuantityError(false);
    }
    if (itemConfig) {
      const amount =
        parseFloat(itemConfig.sellingPrice) * parseFloat(itemConfig.quantity);
      const tax = (amount * parseFloat(itemConfig.actualTax)) / 100;
      setItemConfig({
        ...itemConfig,
        amount: amount ? amount.toString() : "0",
        tax: tax ? tax.toString() : "0",
      });
    }
  }, [itemConfig.quantity]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<Invoice>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (invoiceToEdit) {
      setFormStatus("edit");
      setValue("id", invoiceToEdit.id);
      setValue("invoiceId", invoiceToEdit.invoiceId);
      setValue(
        "date",
        new Date(invoiceToEdit.date).toISOString().split("T")[0],
      );
      setValue(
        "dueDate",
        new Date(invoiceToEdit.dueDate).toISOString().split("T")[0],
      );
      setValue("Client.GSTIN", invoiceToEdit.Client.GSTIN);
      setValue("Client.address", invoiceToEdit.Client.address);
      setValue("Client.contactNumber", invoiceToEdit.Client.contactNumber);
      setValue("Client.email", invoiceToEdit.Client.email);
      setValue("Client.id", invoiceToEdit.Client.id);
      setValue("status", invoiceToEdit.status);
      setValue("discount", invoiceToEdit.discount);
      setValue("Client.name", invoiceToEdit.Client.id);

      setSelectedItems([]);
      const mappedItems = invoiceToEdit.ItemInvoice.map((iteminvoice: any) => {
        const item: ItemConfig = {
          itemId: iteminvoice.itemId,
          itemName: iteminvoice.item.itemName,
          quantity: iteminvoice.quantity,
          sellingPrice: iteminvoice.item.sellingPrice,
          tax: iteminvoice.tax,
          remainingQuantity: iteminvoice.item.quantity,
          amount: iteminvoice.amount,
          actualTax: iteminvoice.item.tax,
        };
        return item;
      });

      setSelectedItems(mappedItems);
    }
  }, [invoiceToEdit, clientData]);

  useEffect(() => {
    if (invoiceId) {
      const now = new Date();
      const invoice = `INV-${invoiceId}/${now.getMonth() + 1}/${now.getFullYear().toString().substring(2)}`;
      setValue("invoiceId", invoice);
    }
  }, [invoiceId]);

  const discount = watch("discount");

  useEffect(() => {
    if (discount && selectedItems) {
      const total = selectedItems
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
        .toFixed(2);
      const newTotal = parseFloat(total) * (parseFloat(discount) / 100);
      setDiscountTotal(newTotal.toFixed(2));
      setTotal((parseFloat(total) - newTotal).toString());
    } else if (selectedItems) {
      const subtotal = selectedItems
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
        .toFixed(2);

      setTotal(subtotal);
    }
  }, [discount, selectedItems]);

  const setClientInput = (client: ClientInputs) => {
    setValue("Client.address", client.address);
    setValue("Client.GSTIN", client.GSTIN);
    setValue("Client.contactNumber", client.contactNumber);
    setValue("Client.email", client.email);
    setValue("Client.id", client.id);
  };

  const onSubmit = async (data: Invoice) => {
    if (selectedItems.length === 0) {
      toast.error("Please add items");
      return;
    }
    setIsLoading(true);
    data.items = selectedItems;
    data.total = parseFloat(total);
    if (formStatus === "create") {
      const response = await createInvoiceApi(data);
      if (response && response.status === 200) {
        toast.success("Invoice created successfully");
        reset();
        setSection({
          invoice: true,
          quote: false,
          createQuote: false,
          createInvoice: false,
        });
      } else if (response && response.status === 203) {
        setInvoiceIdExists(true);
        setTimeout(() => {
          setInvoiceIdExists(false);
        }, 3000);
      } else {
        toast.error("Failed to create invoice");
      }
    } else if (formStatus === "edit") {
      const response = await updateInvoiceApi(data);
      if (response && response.status === 200) {
        toast.success("Invoice updated successfully");
        reset();
        setInvoiceToEdit ? setInvoiceToEdit() : null;
        setFormStatus("create");
        setSection({
          invoice: true,
          quote: false,
          createQuote: false,
          createInvoice: false,
        });
      } else {
        toast.error("Failed to update invoice");
      }
    }
    setIsLoading(false);
  };

  const addItemsHandler = () => {
    (setSelectedItems((prev) => [...prev, itemConfig]),
      setItemConfig({
        itemId: "",
        amount: "",
        tax: "",
        remainingQuantity: "",
        sellingPrice: "",
        quantity: "",
        actualTax: "",
        itemName: "",
      }));
  };

  async function getClients() {
    const response = await getAllClientsApi();
    if (response && response.status === 200) {
      setClientData(response.data.data);
    }
  }

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response && response.status === 200) {
      const items = response.data.data;

      // const filteredItems = items.filter((item: any) => item.Invoice === null);
      setItemData(items);
    }
  }

  async function getInvoiceId() {
    const response = await getInvoiceIdApi();
    if (response && response.status === 200) {
      setInvoiceId(response.data.data);
    }
  }

  useEffect(() => {
    getClients();
    getAllItems();
    if (!invoiceToEdit) {
      getInvoiceId();
    }
  }, []);

  return (
    <section>
      <h3 className="text-secondary pb-5 text-2xl font-medium">
        {formStatus === "create" ? "Create" : "Update"} Invoice
      </h3>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full flex-wrap justify-between gap-5">
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Invoice#</label>
            <input
              type="text"
              className="border-primary rounded-md border p-2"
              {...register("invoiceId", { required: true })}
              readOnly
            />
            {errors.invoiceId && (
              <p className="text-red-500">Invoice ID is required</p>
            )}
            {invoiceIdExists && (
              <p className="text-red-500">Invoice ID already exists</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Date</label>
            <input
              type="date"
              className="border-primary rounded-md border p-2"
              {...register("date", { required: true })}
            />
            {errors.date && <p className="text-red-500">Date is required</p>}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Due Date</label>
            <input
              type="date"
              className="border-primary rounded-md border p-2"
              {...register("dueDate", { required: true })}
            />
            {errors.dueDate && (
              <p className="text-red-500">Due Date is required</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Customer Name</label>
            <Controller
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(clientId) => {
                    field.onChange(clientId);
                    const selected = clientData.find((c) => c.id === clientId);
                    if (selected) setClientInput(selected);
                  }}
                >
                  <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                    <SelectValue
                      placeholder="Select Client"
                      className="data-placeholder:text-black"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clientData.map((client) => (
                      <SelectItem value={client.id} key={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              name="Client.name"
              control={control}
              rules={{ required: true }}
            />
            {errors?.Client?.name && (
              <p className="text-red-500">Customer Name is required</p>
            )}
          </div>
          <div className="flex w-[65%] flex-col gap-2">
            <label className="font-medium">Customer Address</label>
            <input
              type="text"
              className="border-primary cursor-not-allowed rounded-md border p-2"
              {...register("Client.address", { required: true })}
              readOnly
            />
            {errors?.Client?.address && (
              <p className="text-red-500">Customer Address is required</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Customer GSTIN</label>
            <input
              type="text"
              className="border-primary cursor-not-allowed rounded-md border p-2"
              {...register("Client.GSTIN", { required: true })}
              readOnly
            />
            {errors?.Client?.GSTIN && (
              <p className="text-red-500">Customer GSTIN is required</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Contact Number</label>
            <input
              type="text"
              className="border-primary cursor-not-allowed rounded-md border p-2"
              {...register("Client.contactNumber", {
                required: true,
              })}
              readOnly
            />
            {errors?.Client?.contactNumber && (
              <p className="text-red-500">Customer Number is required</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Email ID</label>
            <input
              type="text"
              className="border-primary cursor-not-allowed rounded-md border p-2"
              {...register("Client.email", { required: true })}
              readOnly
            />
            {errors?.Client?.email && (
              <p className="text-red-500">Email ID is required</p>
            )}
          </div>
          <div className="flex w-full flex-col">
            <p className="pb-3 font-medium">Item Table</p>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-primary border font-[500]">Sl no.</th>
                  <th className="border-primary border font-[500]">
                    Item Details
                  </th>
                  <th className="border-primary border font-[500]">Quantity</th>
                  <th className="border-primary border font-[500]">Price</th>
                  <th className="border-primary border font-[500]">
                    Tax %/ Tax Amount
                  </th>
                  <th className="border-primary border font-[500]">Amount</th>
                  <th className="border-primary border font-[500]">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-primary border text-center"></td>
                  <td className="border-primary border">
                    <Select
                      onValueChange={(val) => {
                        const isExist = selectedItems.find(
                          (item) => item.itemId === val,
                        );
                        if (isExist) {
                          toast.warning("Item already exists");
                          return;
                        }
                        const item = itemData.find((item) => item.id === val);
                        if (item) {
                          setItemConfig((prev) => ({
                            ...prev,
                            itemId: item?.id,
                            remainingQuantity: item?.quantity.toString(),
                            actualTax: item?.tax,
                            sellingPrice: item?.sellingPrice.toString(),
                            itemName: item?.itemName,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-none shadow-none data-[placeholder]:text-black">
                        <SelectValue
                          placeholder="Type here or select an item"
                          className="text-black"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {itemData.map((item) => (
                          <SelectItem value={item.id} key={item.id}>
                            {item.itemName}
                          </SelectItem>
                        ))}
                        {itemData.length === 0 && (
                          <SelectItem value="0">No items available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border-primary border p-1 text-center">
                    <div>
                      <input
                        className="border-primary rounded-md border px-2"
                        placeholder="0"
                        value={itemConfig.quantity}
                        onChange={(e) =>
                          setItemConfig({
                            ...itemConfig,
                            quantity: e.target.value,
                          })
                        }
                      />{" "}
                      / {itemConfig.remainingQuantity}
                    </div>
                    {quantityError && (
                      <p className="text-sm text-red-500">
                        Quantity cannot be greater than remaining quantity
                      </p>
                    )}
                  </td>
                  <td className="border-primary border text-center">
                    INR {itemConfig.sellingPrice}
                  </td>
                  <td className="border-primary border text-center">
                    {itemConfig.tax}
                  </td>
                  <td className="border-primary border text-center">
                    {itemConfig.amount}
                  </td>
                  <td className="border-primary border text-center">
                    <Button
                      className="m-0 border-none p-0"
                      variant={"outline"}
                      onClick={addItemsHandler}
                      type="button"
                    >
                      <Plus />
                    </Button>
                  </td>
                </tr>
                {selectedItems?.map((item, i) => (
                  <tr key={i}>
                    <td className="border-primary border py-2 text-center">
                      {i + 1}
                    </td>
                    <td className="border-primary border px-3">
                      {item.itemName}
                    </td>
                    <td className="border-primary border text-center">
                      {item.quantity}
                    </td>
                    <td className="border-primary border text-center">
                      {item.sellingPrice}
                    </td>
                    <td className="border-primary border text-center">
                      {item.tax}
                    </td>
                    <td className="border-primary border text-center">
                      {item.amount}
                    </td>
                    <td className="border-primary justify-items-center border">
                      <RiDeleteBin6Line
                        size={20}
                        color="red"
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedItems(
                            selectedItems.filter(
                              (i) => i.itemId !== item.itemId,
                            ),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-primary flex flex-col items-end gap-2 border-r border-b border-l px-5 py-1 text-sm font-medium">
              <p>
                SubTotal INR{" "}
                {selectedItems
                  .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                  .toFixed(2)}
              </p>
              <div className="flex gap-5">
                <p>Discount</p>
                <input
                  type="text"
                  className="w-15 rounded border px-2"
                  placeholder="0%"
                  {...register("discount", {
                    required: true,
                    min: 0,
                    max: 100,
                  })}
                  maxLength={5}
                />
                <p>INR {discountTotal}</p>
              </div>
              {errors.discount && (
                <p className="text-red-500">Discount is required</p>
              )}
            </div>
            <div className="border-primary flex justify-end border-r border-b border-l px-2 py-1 text-sm font-medium">
              <p className="w-fit">Total INR {total}</p>
            </div>
          </div>
          <div className="flex w-full justify-end gap-5">
            <Button
              className="border-primary rounded-xl px-7"
              variant={"outline"}
              type="button"
              onClick={() => [
                setSection({
                  invoice: true,
                  quote: false,
                  createQuote: false,
                  createInvoice: false,
                }),
                reset(),
                setInvoiceToEdit ? setInvoiceToEdit() : null,
                setFormStatus("create"),
              ]}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button className="rounded-xl px-7" disabled={isLoading}>
              {isLoading ? (
                <VscLoading size={24} className="animate-spin" />
              ) : formStatus === "create" ? (
                "Create Invoice"
              ) : (
                "Update Invoice"
              )}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
