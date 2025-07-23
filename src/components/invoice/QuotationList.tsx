import { LuSearch } from "react-icons/lu";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

import { MdOutlineAdd } from "react-icons/md";
import {
  deleteQuoteApi,
  getAllQuotesApi,
  sendQuoteMailApi,
} from "@/api/quotes";
import { motion } from "motion/react";
import QuoteTemplate from "./QuoteTemplate";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SettingsInputs } from "../settings/Settings";
import { getSettingsApi } from "@/api/settings";
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

import { toast } from "react-toastify";
import { VscLoading } from "react-icons/vsc";

export type QuoteInputs = {
  id: string;
  quoteId: string;
  date: string; // ISO format string
  dueDate: string; // ISO format string
  amount: number;
  clientId: string;
  QuoteItem: QuoteItem[];
  Client: Client;
};

type QuoteItem = {
  id: string;
  quoteId: string;
  itemId: string;
  amount: number;
  quantity: number;
  tax: string; 
  item: Item;
};

type Item = {
  id: string;
  itemName: string;
  category: string;
  supplerName: string;
  sellingPrice: number;
  measurement: string;
  quantity: number;
  tax: string;
  description: string;
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



const getMailGreeting =
  "Please find attached the Quotation with the following details.";

export default function Quotation({
  setSection,
  setQouteToEdit,
}: {
  setSection: any;
  setQouteToEdit: any;
}) {
  const [search, setSearch] = useState("");
  const [quoteData, setQuoteData] = useState<QuoteInputs[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteInputs[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteInputs>();
  const [settingsData, setSettingsData] = useState<SettingsInputs>();
  const [attachment, setAttachment] = useState<Blob>();
  const [isOpen, setIsOpen] = useState(false);
  const [emailIds, setEmailIds] = useState("");
  const [mailGreeting, setMailGreeting] = useState(getMailGreeting);
  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {
    const delay = setTimeout(() => {
      const text = search.trim().toLowerCase();
      if (!text) {
        setFilteredQuotes(quoteData);
        return;
      }
      const filtered = quoteData.filter((quote) =>
        [quote.quoteId, quote.Client.name]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(text))
      );
      setFilteredQuotes(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, quoteData]);

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

    const baseQuoteData = {
      mailBody: mailGreeting,
      settings: settingsData,
      quoteId: selectedQuote?.quoteId,
    };

    setIsLoading(true);

    try {
      const emailPromises = emails.map(async (email) => {
        const formData = new FormData();
        formData.append("file", attachment, "quotation.pdf");
        formData.append("quotationData", JSON.stringify(baseQuoteData));

        const response = await sendQuoteMailApi(email, formData);

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

  const getPdfFile = async () => {
    const pdfFile = await pdf(
      <QuoteTemplate quote={selectedQuote} settings={settingsData} />,
    ).toBlob();
    setAttachment(pdfFile);
  };

  const onDeleteQuoteHandler = async () => {
    if (!selectedQuote) {
      return;
    }
    const response = await deleteQuoteApi(selectedQuote.id);
    if (response && response.status === 200) {
      toast.success("Quote deleted successfully");
      setShowPreview(false);
      getAllQuotes();
    } else {
      toast.error("Failed to delete quote");
    }
  };

  async function getAllQuotes() {
    const response = await getAllQuotesApi();
    if (response && response.status === 200) {
      setQuoteData(response.data.data);
      setFilteredQuotes(response.data.data);
      console.log(response.data.data);
    }
  }

  async function getSettingsData() {
    const response = await getSettingsApi();
    if (response && response.status === 200) {
      setSettingsData(response.data.data);
    }
  }

  useEffect(() => {
    getAllQuotes();
    getSettingsData();
  }, []);
  return (
    <section className="flex gap-5">
      <motion.div
        animate={{ width: showPreview ? "50%" : "100%" }}
        transition={{ duration: 0.3 }}
        className={`flex h-fit max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-md border bg-[#FAFAFA] p-5 shadow-md ${showPreview ? "text-sm" : ""}`}
      >
        <div className={`flex items-center justify-between`}>
          <p className="text-xl font-medium text-[#007E3B]">Quotes</p>
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
                  invoice: true,
                  quote: false,
                  createQuote: false,
                  createInvoice: false,
                })
              }
            >
              <MdOutlineAdd size={24} />
              Invoice
            </Button>
            <Button
              className="rounded-xl px-7"
              onClick={() => [
                setSection({
                  invoice: false,
                  quote: false,
                  createQuote: true,
                  createInvoice: false,
                }),
              ]}
            >
              <MdOutlineAdd size={24} />
              Create Quote
            </Button>
          </div>
        </div>
        <table className={`w-full`}>
          <thead>
            <tr>
              <th className="text-muted text-start font-medium">
                <div className="flex items-center gap-2">
                  <p>Quotes #</p>
                </div>
              </th>
              <th className="text-muted text-start font-medium">
                <div className="flex items-center gap-2">
                  <p>Customer Name</p>
                </div>
              </th>
              <th className="text-muted flex items-center gap-2 text-start font-medium">
                <p>Quote Date</p>
              </th>
              <th className="text-muted text-start font-medium">
                Total Quote Value
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr
                key={quote.id}
                className="hover:bg-accent cursor-pointer"
                onClick={() => [setSelectedQuote(quote), setShowPreview(true)]}
              >
                <td className="py-2">{quote.quoteId}</td>
                <td className="py-2">{quote.Client.name}</td>
                <td className="py-2">
                  {new Date(quote.date).toLocaleDateString()}
                </td>
                <td className="py-2">INR {quote.amount}</td>
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
        className="hidden h-full flex-col gap-5 rounded-lg border bg-[#FAFAFA] p-5 shadow-md"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-secondary text-2xl font-medium">
            {selectedQuote?.quoteId}
          </h3>
          <div className="flex items-center gap-5">
            <Button
              variant={"outline"}
              className="text-primary border-primary rounded-full px-7"
            >
              Convert to Invoice
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
                  setEmailIds(selectedQuote?.Client?.email!),
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
                    <p>Quote details for - {selectedQuote?.quoteId}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    Hi {selectedQuote?.Client.name},
                    <textarea
                      value={mailGreeting}
                      onChange={(e) => setMailGreeting(e.target.value)}
                      className="h-20"
                    ></textarea>
                    <div>
                      <p>Shipment Details:</p>
                      <p>Invoice#: {selectedQuote?.quoteId}</p>
                      <p>Customer Name: {selectedQuote?.Client.name}</p>
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
                          QT #{selectedQuote?.quoteId}
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
                        disabled={isLoading}
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
                setSection({ invoice: false, quote: false, createQuote: true }),
                setQouteToEdit(selectedQuote),
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
                  Are you sure you want to delete this Quote? This action is
                  permanent and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                  onClick={() => onDeleteQuoteHandler()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {
          <PDFViewer className="h-[70vh] w-full">
            <QuoteTemplate quote={selectedQuote} settings={settingsData} />
          </PDFViewer>
        }
      </motion.div>
    </section>
  );
}
