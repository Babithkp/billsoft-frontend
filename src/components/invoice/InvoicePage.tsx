import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { RxCube } from "react-icons/rx";
import { TbInvoice } from "react-icons/tb";

import { useState } from "react";

import Quotation, { QuoteInputs } from "./QuotationList";
import QuoteCreate from "./QuoteCreate";
import InvoiceCreate from "./InvoiceCreate";
import Invoice, { InvoiceInputs } from "./InvoiceList";

export default function InvoicePage() {
  const [quoteToEdit, setQuoteToEdit] = useState<QuoteInputs>();
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceInputs>();

  const [section, setSection] = useState({
    invoice: true,
    quote: false,
    createQuote: false,
    createInvoice: false,
  });

  return (
    <>
      {(section.quote || section.invoice) && (
        <>
          <section>
            <div className="flex gap-10">
              <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
                <div className="flex items-center gap-5">
                  <div className="rounded-full bg-[#F4F7FE] p-3">
                    <TbInvoice size={36} className="text-primary" />
                  </div>
                  <div className="font-medium">
                    <p className="text-muted">Total Invoices</p>
                    <p className="text-xl text-[#007E3B]">121</p>
                  </div>
                </div>
              </div>
              <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
                <div className="flex items-center gap-5">
                  <div className="rounded-full bg-[#F4F7FE] p-3">
                    <RxCube size={30} className="text-primary" />
                  </div>
                  <div className="font-medium">
                    <p className="text-muted">Total invoice value</p>
                    <p className="text-xl text-[#007E3B]">INR 78777</p>
                  </div>
                </div>
              </div>
              <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md">
                <div className="flex items-center gap-5">
                  <div className="rounded-full bg-[#F4F7FE] p-3">
                    <IoCheckmarkCircleSharp
                      size={30}
                      className="text-primary"
                    />
                  </div>
                  <div className="font-medium">
                    <p className="text-muted">Total invoices paid</p>
                    <p className="text-xl text-[#007E3B]">10</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {section.invoice && (
            <Invoice
              setSection={setSection}
              setInvoiceToEdit={setInvoiceToEdit}
            />
          )}
          {section.quote && (
            <Quotation
              setSection={setSection}
              setQouteToEdit={setQuoteToEdit}
            />
          )}
        </>
      )}
      {section.createQuote && (
        <QuoteCreate
          setSection={setSection}
          quoteToEdit={quoteToEdit}
          setQuoteToEdit={setQuoteToEdit}
        />
      )}
      {section.createInvoice && <InvoiceCreate setSection={setSection} invoiceToEdit={invoiceToEdit} setInvoiceToEdit={setInvoiceToEdit} />}
    </>
  );
}
