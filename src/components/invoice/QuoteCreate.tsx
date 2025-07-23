import { Controller, useForm } from "react-hook-form";

import { ClientInputs } from "../clients/ClientPage";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ItemInputs } from "../inventory/InventryPage";
import { createQuoteApi, updateQuoteApi } from "@/api/quotes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getAllClientsApi } from "@/api/client";
import { getAllItemsApi } from "@/api/item";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button } from "../ui/button";
import { VscLoading } from "react-icons/vsc";
import { getQuotationIdApi } from "@/api/settings";
import { Plus } from "lucide-react";
import { QuoteInputs } from "./QuotationList";

type QuoteInput = {
  id: string;
  quoteId: string;
  date: string; // ISO format string
  dueDate: string; // ISO format string
  amount: number;
  clientId: string;
  items: ItemConfig[];
  Client: Client;
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

interface ItemConfig {
  itemId: string;
  itemName: string;
  amount: string;
  tax: string;
  sellingPrice: string;
  quantity: string;
  actualTax: string;
}

export default function QuoteCreate({
  setSection,
  quoteToEdit,
  setQuoteToEdit,
}: {
  setSection: any;
  quoteToEdit?: QuoteInputs;
  setQuoteToEdit?: any;
}) {
  const [selectedItems, setSelectedItems] = useState<ItemConfig[]>([]);
  const [quoteIdExists, setQuoteIdExists] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [clientData, setClientData] = useState<ClientInputs[]>([]);
  const [itemData, setItemData] = useState<ItemInputs[]>([]);
  const [quotationId, setQuotationId] = useState("");
  const [formStatus, setFormStatus] = useState<"edit" | "create">("create");
  const [itemConfig, setItemConfig] = useState({
    itemId: "",
    itemName: "",
    quantity: "",
    amount: "",
    tax: "",
    actualTax: "",
    sellingPrice: "",
  });
  const [total, setTotal] = useState("0");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<QuoteInput>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const resetInputs = () => {
    reset();
    setSelectedItems([]);
  };

  useEffect(() => {
    if (quoteToEdit) {
      setFormStatus("edit");
      setValue("id", quoteToEdit.id);
      setValue("quoteId", quoteToEdit.quoteId);
      setValue("date", new Date(quoteToEdit.date).toISOString().split("T")[0]);
      setValue(
        "dueDate",
        new Date(quoteToEdit.dueDate).toISOString().split("T")[0],
      );
      setValue("Client.id", quoteToEdit.Client.id);
      setValue("Client.address", quoteToEdit.Client.address);
      setValue("Client.GSTIN", quoteToEdit.Client.GSTIN);
      setValue("Client.contactNumber", quoteToEdit.Client.contactNumber);
      setValue("Client.email", quoteToEdit.Client.email);
      setValue("amount", quoteToEdit.amount);
      setValue("Client.name", quoteToEdit.Client.id);

      setSelectedItems([]);
      const mappedItems = quoteToEdit.QuoteItem.map((iteminvoice: any) => {
        const item: ItemConfig = {
          itemId: iteminvoice.itemId,
          itemName: iteminvoice.item.itemName,
          quantity: iteminvoice.quantity,
          sellingPrice: iteminvoice.item.sellingPrice,
          tax: iteminvoice.tax,
          amount: iteminvoice.amount,
          actualTax: iteminvoice.item.tax,
        };
        return item;
      });

      setSelectedItems(mappedItems);
    }
  }, [quoteToEdit, clientData]);

  useEffect(() => {
    if (selectedItems) {
      const subtotal = selectedItems
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
        .toFixed(2);

      setTotal(subtotal);
    }
  }, [selectedItems]);

  useEffect(() => {
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

  const addItemsHandler = () => {
    (setSelectedItems((prev) => [...prev, itemConfig]),
      setItemConfig({
        itemId: "",
        amount: "",
        tax: "",
        sellingPrice: "",
        quantity: "",
        actualTax: "",
        itemName: "",
      }));
  };

  const setClientInput = (client: ClientInputs) => {
    setValue("Client.address", client.address);
    setValue("Client.GSTIN", client.GSTIN);
    setValue("Client.contactNumber", client.contactNumber);
    setValue("Client.email", client.email);
    setValue("Client.id", client.id);
  };

  const onQuoteSubmit = async (data: QuoteInput) => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setIsloading(true);

    data.amount = parseFloat(total);
    data.items = selectedItems;
    if (formStatus === "create") {
      const response = await createQuoteApi(data);
      if (response && response.status === 200) {
        toast.success("Quote created successfully");
        resetInputs();
        setSection({
          invoice: false,
          quote: true,
          createQuote: false,
          createInvoice: false,
        });
      } else if (response && response.status === 203) {
        setQuoteIdExists(true);
        setTimeout(() => {
          setQuoteIdExists(false);
        }, 3000);
      } else {
        toast.error("Failed to create quote");
      }
    } else if (formStatus === "edit") {
      const response = await updateQuoteApi(data);
      if (response && response.status === 200) {
        toast.success("Quote updated successfully");
        resetInputs();
        setQuoteToEdit();
        setSection({
          invoice: false,
          quote: true,
          createQuote: false,
          createInvoice: false,
        });
      } else {
        toast.error("Failed to update quote");
      }
    }
    setIsloading(false);
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
      setItemData(items);
    }
  }
  async function getQuotationId() {
    const response = await getQuotationIdApi();
    if (response && response.status === 200) {
      setQuotationId(response.data.data);
    }
  }
  useEffect(() => {
    const now = new Date();
    const formattedQuoteId = `QT-${quotationId}/${now.getMonth() + 1}/${now.getFullYear().toString().substring(2)}`;
    if (!quoteToEdit) {
      setValue("quoteId", formattedQuoteId);
    }
  }, [quotationId]);

  useEffect(() => {
    getClients();
    getAllItems();
    if (!quoteToEdit) {
      getQuotationId();
    }
  }, []);

  return (
    <section>
      <h3 className="text-secondary pb-5 text-2xl font-medium">
        {formStatus === "create" ? "Create" : "Update"} Quote
      </h3>
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(onQuoteSubmit)}
      >
        <div className="flex w-full flex-wrap justify-between gap-5">
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Quote#</label>
            <input
              type="text"
              className="border-primary rounded-md border p-2"
              {...register("quoteId", { required: true })}
              readOnly
            />
            {errors.quoteId && (
              <p className="text-red-500">Quote ID is required</p>
            )}
            {quoteIdExists && (
              <p className="text-red-500">Quote ID already exists</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Date</label>
            <input
              type="date"
              className="border-primary rounded-md border p-2"
              {...register("date", { required: true })}
            />
            {errors.date && (
              <p className="text-red-500">Please enter a vaild date</p>
            )}
          </div>
          <div className="flex w-[30%] flex-col gap-2">
            <label className="font-medium">Due date</label>
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
                      />
                    </div>
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
            <div className="border-primary flex justify-end border-r border-b border-l px-5 py-1">
              <p className="text-sm">Total INR {total}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-5">
          <Button
            type="button"
            className="border-primary text-primary rounded-xl px-7"
            variant={"outline"}
            onClick={() => [
              setQuoteToEdit(),
              resetInputs(),
              setSection({
                createQuote: false,
                invoice: false,
                quote: true,
                createInvoice: false,
              }),
            ]}
            disabled={isloading}
          >
            Back
          </Button>
          <Button className="rounded-xl px-7" disabled={isloading}>
            {isloading ? (
              <VscLoading size={24} className="animate-spin" />
            ) : formStatus === "create" ? (
              "Create Quote"
            ) : (
              "Update Quote"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
