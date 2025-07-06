import { LuSearch } from "react-icons/lu";
import { MdOutlineAdd } from "react-icons/md";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  deleteInvoiceApi,
  getAllInvoicesApi,
  sendInvoiceMailApi,
} from "@/api/invoice";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBin6Line, RiEditBoxLine } from "react-icons/ri";
import { SettingsInputs } from "../settings/Settings";
import { getSettingsApi } from "@/api/settings";
import { motion } from "motion/react";
import FormData from "form-data";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { toast } from "react-toastify";
import { VscLoading } from "react-icons/vsc";
import { ClientInputs } from "../clients/ClientPage";
import { ItemInputs } from "../inventory/InventryPage";
import InvoiceTemplate from "./InvoiceTemplate";
import { PiRecord } from "react-icons/pi";
import { Controller, useForm } from "react-hook-form";
import { convertToINRWords } from "@/lib/utils";
import { createPaymentApi, deletePaymentApi, updatePaymentApi } from "@/api/payments";

export interface InvoiceInputs {
  id: string;
  invoiceId: string;
  date: string;
  dueDate: string;
  Client: ClientInputs;
  discount: string;
  subTotal: number;
  total: number;
  items: ItemInputs[];
  clientId: string;
  status: string;
  pendingAmount: number;
  payments: RecordPaymentInputs[];
}

export interface RecordPaymentInputs {
  id: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  amount: number;
  amountInWords: string;
  pendingAmount: number;
  transactionId: string;
  paymentMode: string;
  remarks: string;
  invoiceId: string;
}

const getMailGreeting =
  "Greetings from Asian Best Eeco Traders, \nPlease find attached the Invoice";

export default function Invoice({
  setSection,
  setInvoiceToEdit,
}: {
  setSection: any;
  setInvoiceToEdit: any;
}) {
  const [search, setSearch] = useState("");
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceInputs>();
  const [settingsData, setSettingsData] = useState<SettingsInputs>();
  const [attachment, setAttachment] = useState<Blob>();
  const [isOpen, setIsOpen] = useState(false);
  const [emailIds, setEmailIds] = useState("");
  const [mailGreeting, setMailGreeting] = useState(getMailGreeting);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [formstate, setFormstate] = useState<"edit" | "create">("create");
  const [oldPayment, setOldPayment] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<RecordPaymentInputs>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (showPreview) {
      const timeout = setTimeout(() => {
        setHasAnimated(true);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setHasAnimated(false);
    }
  }, [showPreview]);

  const amount = watch("amount");

  useEffect(() => {
    if (amount && selectedInvoice) {
      const totalAmount = Number(amount);
      const amountInWords = convertToINRWords(totalAmount);
      const pendingAmount = selectedInvoice?.pendingAmount - totalAmount;
      console.log(oldPayment);

      setValue("amountInWords", amountInWords);
      setValue("pendingAmount", oldPayment + pendingAmount);
    } else {
      setValue("amountInWords", convertToINRWords(0));
      setValue("pendingAmount", 0);
    }
  }, [amount, setValue]);

  const deletePaymentRecord = async (id: string) => {
    const response = await deletePaymentApi(id);
    if (response && response.status === 200) {
      toast.success("Payment record deleted successfully");
      setIsRecordModalOpen(false);
      getAllInvoices();
      setShowPreview(false);
    } else {
      toast.error("Failed to delete payment record");
    }
  };

  const setRecordDataToInputBox = (record: RecordPaymentInputs) => {
    setValue("id", record.id);
    setValue("invoiceNumber", record.invoiceId);
    setValue("date", new Date(record.date).toISOString().split("T")[0]);
    setValue("clientName", record.clientName);
    setValue("amount", record.amount);
    setValue("amountInWords", record.amountInWords);
    setValue("pendingAmount", record.pendingAmount);
    setValue("transactionId", record.transactionId);
    setValue("paymentMode", record.paymentMode);
    setValue("remarks", record.remarks);
  };

  const resetData = () => {
    reset();
    setFormstate("create");
    setOldPayment(0);
  };

  const onsendEmailHandler = async () => {
    if (!emailIds) {
      toast.error("Please enter email ids");
      return;
    }
    const emails = emailIds
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email !== "");
    if (emails.length === 0) {
      toast.error("Please provide valid email addresses");
      return;
    }
    const baseInvoiceData = {
      mailBody: mailGreeting,
      settings: settingsData,
      invoiceId: selectedInvoice?.invoiceId,
      Client: selectedInvoice?.Client,
    };
    setIsLoading(true);
    try {
      const emailPromises = emails.map(async (email) => {
        const formData = new FormData();
        formData.append("file", attachment, "invoice.pdf");
        formData.append("invoiceData", JSON.stringify(baseInvoiceData));
        const response = await sendInvoiceMailApi(email, formData);
        if (response?.status === 200) {
          toast.success(`LR Email sent to ${email}`);
        } else {
          toast.error(`Failed to send email to ${email}`);
        }
      });
      await Promise.all(emailPromises);
    } catch (e) {
      toast.error("Failed to send mail");
    }
    setIsLoading(false);
  };

  const selectionHandler = (invoice: InvoiceInputs) => {
    (setSelectedInvoice(invoice), setShowPreview(true));
  };

  const getPdfFile = async () => {
    const pdfFile = await pdf(
      <InvoiceTemplate invoice={selectedInvoice} settings={settingsData} />,
    ).toBlob();
    setAttachment(pdfFile);
  };

  const onDeleteInvoiceHandler = async () => {
    if (!selectedInvoice) {
      return;
    }
    const response = await deleteInvoiceApi(selectedInvoice?.id);
    if (response && response.status === 200) {
      toast.success("Invoice deleted successfully");
      setShowPreview(false);
      getAllInvoices();
    } else {
      toast.error("Failed to delete invoice");
    }
  };

  const onSubmit = async (data: RecordPaymentInputs) => {
    if (!selectedInvoice) {
      return;
    }
    if (data.pendingAmount < 0) {
      toast.error("Pending amount cannot be negative");
      return;
    }
    setIsLoading(true);
    data.invoiceId = selectedInvoice?.id;
    if (formstate === "create") {
      const response = await createPaymentApi(data);
      if (response && response.status === 200) {
        toast.success("Payment Record created successfully");
        setIsRecordModalOpen(false);
        getAllInvoices();
        setShowPreview(false);
        reset();
      } else {
        toast.error("Failed to create payment record");
      }
    } else if (formstate === "edit") {
      const response = await updatePaymentApi(data);
      if (response && response.status === 200) {
        toast.success("Payment Record updated successfully");
        setIsRecordModalOpen(false);
        getAllInvoices();
        setShowPreview(false);
        reset();
      } else {
        toast.error("Failed to update payment record");
      }
    }
    setIsLoading(false);
  };

  const getAllInvoices = async () => {
    const response = await getAllInvoicesApi();
    if (response && response.status === 200) {
      setInvoiceData(response.data.data);
    }
  };

  async function getSettingsData() {
    const response = await getSettingsApi();
    if (response && response.status === 200) {
      setSettingsData(response.data.data);
    }
  }

  useEffect(() => {
    getAllInvoices();
    getSettingsData();
  }, []);

  return (
    <section className="flex gap-5">
      <motion.div
        animate={{ width: showPreview ? "50%" : "100%" }}
        transition={{ duration: 0.3 }}
        className={`flex h-fit max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-md bg-[#FAFAFA] p-5 shadow-md ${showPreview ? "text-sm" : ""}`}
      >
        <div className={`flex items-center justify-between`}>
          <p className="text-xl font-medium text-[#007E3B]">Invoices</p>
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
              className="border-primary text-primary rounded-xl px-7"
              variant={"outline"}
              onClick={() =>
                setSection({
                  invoice: false,
                  quote: true,
                  createQuote: false,
                  createInvoice: false,
                })
              }
            >
              <MdOutlineAdd size={24} />
              Quote
            </Button>
            <Button
              className="rounded-xl px-7"
              onClick={() =>
                setSection({
                  invoice: false,
                  quote: false,
                  createQuote: false,
                  createInvoice: true,
                })
              }
            >
              <MdOutlineAdd size={24} />
              Create Invoice
            </Button>
          </div>
        </div>
        <table className={`w-full`}>
          <thead>
            <tr>
              <th className="text-muted text-start font-medium">
                <div className="flex items-center gap-2">
                  <p>Invoice #</p>
                </div>
              </th>
              <th className="text-muted text-start font-medium">
                <div className="flex items-center gap-2">
                  <p>Customer Name</p>
                </div>
              </th>
              <th className="text-muted flex items-center gap-2 text-start font-medium">
                Invoice Date
              </th>
              <th className="text-muted text-center font-medium">Total</th>
              <th className="text-muted text-center font-medium">
                Pending Amount
              </th>
              <th className="text-muted text-center font-medium">
                Invoice Status
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.map((invoice: any) => (
              <tr
                key={invoice.id}
                className="hover:bg-accent cursor-pointer"
                onClick={() => selectionHandler(invoice)}
              >
                <td className="py-2 text-start">{invoice.invoiceId}</td>
                <td className="text-start">{invoice.Client?.name}</td>
                <td className="text-start">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="text-center">{invoice.total}</td>
                <td className="text-center">{invoice.pendingAmount}</td>
                <td
                  className={`text-center font-medium ${invoice.status === "Paid" ? "text-green-500" : "text-yellow-500"}`}
                >
                  {invoice.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <motion.div
        animate={{
          width: showPreview ? "50%" : "0%",
          display: showPreview ? "flex" : "none",
          opacity: showPreview ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="hidden h-full flex-col gap-5 rounded-lg bg-[#FAFAFA] p-5 shadow-md"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-secondary text-2xl font-medium">
            {selectedInvoice?.invoiceId}
          </h3>
          <div className="flex items-center gap-5">
            <Button
              variant={"outline"}
              className="text-primary border-primary rounded-full px-7"
              onClick={() => [
                setIsRecordModalOpen(true),
                reset(),
                setFormstate("create"),
                setOldPayment(0),
              ]}
            >
              <PiRecord className="size-5" />
              Record payment
            </Button>
            <button className="bg-primary/50 cursor-pointer rounded-full p-1">
              <RxCross2
                size={20}
                color="white"
                onClick={() => setShowPreview(false)}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger
                className="bg-primary cursor-pointer rounded-2xl border p-1 px-4 font-medium text-white"
                onClick={() => [
                  setEmailIds(selectedInvoice?.Client?.email!),
                  getPdfFile(),
                ]}
              >
                Send mail
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] min-w-7xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Send Mail</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
                <div className="flex flex-col gap-5">
                  <div className="flex border-b pb-1 text-sm">
                    <p>To</p>
                    <input
                      type="text"
                      className="w-[90%] pl-2"
                      value={emailIds}
                      onChange={(e) => setEmailIds(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-5 border-b pb-1 text-sm">
                    <p>Subject</p>
                    <p>Quote details for - {selectedInvoice?.invoiceId}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p>Hi {selectedInvoice?.Client.name},</p>
                    <textarea
                      value={mailGreeting}
                      onChange={(e) => setMailGreeting(e.target.value)}
                      className="h-20"
                    ></textarea>
                    <div>
                      <p>Shipment Details:</p>
                      <p>Invoice#: {selectedInvoice?.invoiceId}</p>
                      <p>Customer Name: {selectedInvoice?.Client.name}</p>
                    </div>

                    <div>
                      <p>Warm Regards,</p>
                      <p>Sethu Narayanan</p>
                      <p>CEO</p>
                      <p>Asian Best Eco Traders</p>
                      <p>Website: {settingsData?.website}</p>
                      <p className="w-100">{settingsData?.address}</p>
                    </div>
                    <div>
                      <p className="text-sm">Attachments</p>
                      <div className="my-1 flex w-[30%] items-center justify-between rounded-md bg-[#E9EDF7] px-5 py-1">
                        <p className="flex items-center gap-5">
                          IN #{selectedInvoice?.invoiceId}
                          <span className="text-sm text-[#A3AED0]">
                            ({attachment?.size.toString().substring(0, 3)}kb)
                          </span>
                        </p>
                        <RxCross2 size={15} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-5">
                      <Button
                        variant={"outline"}
                        className="border-primary text-primary"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => [onsendEmailHandler()]}
                        disabled={isLoading || !attachment}
                      >
                        {isLoading ? (
                          <VscLoading size={20} className="animate-spin" />
                        ) : (
                          "Send Mail"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="text-primary border-primary rounded-full px-7"
              variant={"outline"}
              onClick={() => [
                setSection({
                  invoice: false,
                  quote: false,
                  createQuote: false,
                  createInvoice: true,
                }),
                setInvoiceToEdit(selectedInvoice),
              ]}
            >
              Edit Details
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger className="cursor-pointer">
              <RiDeleteBin6Line size={20} color="red" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alert!</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-black">
                  Are you sure you want to delete this Invoice? This action is
                  permanent and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                  onClick={onDeleteInvoiceHandler}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {hasAnimated && (
          <PDFViewer className="h-[70vh] w-full">
            <InvoiceTemplate
              invoice={selectedInvoice}
              settings={settingsData}
            />
          </PDFViewer>
        )}
      </motion.div>
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-7xl">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle className="text-2xl">
              Record Payment #{selectedInvoice?.invoiceId}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap justify-between gap-5"
          >
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Invoice#</label>
                <input
                  type="text"
                  className="border-primary cursor-not-allowed rounded-md border p-2"
                  {...register("invoiceNumber")}
                  value={selectedInvoice?.invoiceId}
                  disabled
                />
              </div>
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Date</label>
                <input
                  type="date"
                  className="border-primary rounded-md border p-2"
                  {...register("date", { required: true })}
                />
                {errors.date && (
                  <p className="text-red-500">Date is required</p>
                )}
              </div>
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Client Name</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-2"
                  {...register("clientName")}
                  value={selectedInvoice?.Client?.name}
                  disabled
                />
              </div>
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Amount</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-2"
                  {...register("amount", { required: true })}
                />
                {errors.amount && (
                  <p className="text-red-500">Amount is required</p>
                )}
              </div>
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Amount In Words (auto-generated)</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-2"
                  {...register("amountInWords", { required: true })}
                />
                {errors.amountInWords && (
                  <p className="text-red-500">Amount is required</p>
                )}
              </div>
            </div>
            <div className="w-[30%]">
              <div className="flex flex-col gap-2">
                <label>Pending Amount</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-2"
                  {...register("pendingAmount")}
                />
              </div>
            </div>
            <div className="w-[49%]">
              <div className="flex flex-col gap-2">
                <label>Transaction ID/ Cheque Number</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-2"
                  {...register("transactionId", { required: true })}
                />
                {errors.transactionId && (
                  <p className="text-red-500">Transaction Number is required</p>
                )}
              </div>
            </div>
            <div className="w-[49%]">
              <div className="flex flex-col gap-2">
                <label>Payment Mode</label>
                <Controller
                  name="paymentMode"
                  control={control}
                  defaultValue={""}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className="w-full"
                        style={{ border: "1px solid #4CAF7A" }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="IMPS">IMPS</SelectItem>
                        <SelectItem value="RTGS">RTGS</SelectItem>
                        <SelectItem value="NEFT">NEFT</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Nill">Nill</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paymentMode && (
                  <p className="text-red-500">Payment Method is required</p>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-col gap-2">
                <label>Remarks</label>
                <input
                  className="border-primary rounded-md border p-2"
                  {...register("remarks", { required: true })}
                />
              </div>
              {errors.remarks && (
                <p className="text-red-500">Remarks is required</p>
              )}
            </div>
            {selectedInvoice?.payments &&
              selectedInvoice?.payments?.length > 0 && (
                <div className="w-full">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="bg-primary/20 px-4">
                        Recent Payments
                      </AccordionTrigger>
                      <AccordionContent className="bg-primary/20 max-h-[30vh] overflow-y-auto rounded-b-md px-2">
                        <table className="w-full rounded-md bg-white px-2">
                          <thead>
                            <tr>
                              <th className="p-1 font-medium">Sl no</th>
                              <th className="font-medium">Amount Received</th>
                              <th className="font-medium">Date</th>
                              <th className="font-medium">Payment mode</th>
                              <th className="font-medium">
                                Trans. ID/Cheque Number
                              </th>
                              <th className="font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInvoice?.payments?.map((record, index) => (
                              <tr
                                className="hover:bg-accent text-center"
                                key={record.id}
                              >
                                <td className="p-2">{index + 1}</td>
                                <td>{record.amount}</td>
                                <td>
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td>{record.paymentMode}</td>
                                <td>{record.transactionId}</td>
                                <td className="flex justify-center gap-2">
                                  <button
                                    className="cursor-pointer"
                                    type="button"
                                    onClick={() => [
                                      setRecordDataToInputBox(record),
                                      setFormstate("edit"),
                                      setOldPayment(record.amount),
                                    ]}
                                  >
                                    <RiEditBoxLine size={20} />
                                  </button>

                                  {
                                    <AlertDialog>
                                      <AlertDialogTrigger className="cursor-pointer">
                                        <RiDeleteBin6Line
                                          size={20}
                                          color="red"
                                        />
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Alert!
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="font-medium text-black">
                                            Are you sure you want to delete this
                                            Payment Record? This action is
                                            permanent and cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                                            onClick={() =>
                                              deletePaymentRecord(
                                                record.id,
                                              )
                                            }
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

            <div className="flex w-full justify-end gap-5">
              <Button
                type="button"
                variant={"outline"}
                className="border-primary text-primary"
                onClick={() => setIsRecordModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {formstate === "edit" && (
                <Button
                  type="button"
                  variant={"outline"}
                  className="border-primary text-primary"
                  onClick={resetData}
                  disabled={isLoading}
                >
                  Rest All
                </Button>
              )}
              <Button className="rounded-xl px-7" disabled={isLoading}>
                {isLoading ? (
                  <VscLoading size={24} className="animate-spin" />
                ) : formstate === "create" ? (
                  "Record Payment"
                ) : (
                  "Update Payment"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
