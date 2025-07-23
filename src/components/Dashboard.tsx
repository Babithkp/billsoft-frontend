import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { PiUsersThree } from "react-icons/pi";
import { PiHandbagSimpleBold } from "react-icons/pi";
import { FaRegClock } from "react-icons/fa6";
import { ClientInputs } from "./clients/ClientPage";
import { PurchaseInputs } from "./inventory/InventryPage";
import {
  LineChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { ExpensesInputs } from "./expenses/Expense";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { motion } from "motion/react";
import { getPaymentsApi } from "@/api/payments";
import { getAllInvoicesApi, getInvoiceByDateApi } from "@/api/invoice";
import {  getAllPurchasesApi } from "@/api/item";
import { InvoiceInput } from "./invoice/InvoiceList";
import { getAllClientsApi } from "@/api/client";
import { getAllExpensesApi } from "@/api/expense";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6E97",
  "#6EE7B7",
  "#FF6699",
  "#FFB347",
  "#B19CD9",
  "#8DD1E1",
  "#83A6ED",
  "#FF7F50",
  "#FFA07A",
  "#20B2AA",
  "#9370DB",
  "#40E0D0",
  "#6495ED",
  "#D2691E",
  "#DA70D6",
];

interface GraphPoint {
  date: string;
  totalInvoice: number;
}

export default function Dashboard() {
  const [invoice, setInvoice] = useState<InvoiceInput[]>([]);
  const [clients, setClients] = useState<ClientInputs[]>([]);
  const [date, setDate] = useState<DateRange | undefined>();
  const [payments, setPayments] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInputs[]>([]);
  const [expenses, setExpenses] = useState<ExpensesInputs[]>([]);


const purchasePercentage = useMotionValue(0);
const revenuePercentage = useMotionValue(0);

// Smooth animations
const smoothPurchase = useSpring(purchasePercentage, { stiffness: 100, damping: 20 });
const smoothRevenue = useSpring(revenuePercentage, { stiffness: 100, damping: 20 });

// Animated width strings for styling
const purchasePercentageWidth = useTransform(smoothPurchase, (val) => `${val}%`);
const revenuePercentageWidth = useTransform(smoothRevenue, (val) => `${val}%`);

// Raw totals
const expenseSum = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
const purchaseSum = purchases?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
const invoiceSum = invoice?.reduce((acc, curr) => acc + curr.total, 0) || 0;

// Calculate relative percentages (base: expenseSum = 100%)
const purchasePercent = expenseSum > 0 ? (purchaseSum / expenseSum) * 100 : 0;
const revenuePercent = expenseSum > 0 ? (invoiceSum / expenseSum) * 100 : 0;

// Set motion values (can be used in useEffect or directly if values are updated on render)
purchasePercentage.set(purchasePercent);
revenuePercentage.set(revenuePercent);







  async function getInvoiceByDate() {
    if (date && !date.from && !date.to) {
      return;
    }

    const response = await getInvoiceByDateApi(date?.from, date?.to);
    if (response && response.status === 200) {
      setInvoice(response.data.data);
    }
  }

  useEffect(() => {
    if (
      date &&
      date.from &&
      date.to &&
      date.from.getTime() !== date.to.getTime()
    ) {
      getInvoiceByDate();
    } else {
      setInvoice(invoice);
    }
  }, [date]);

  

  const getClientPieChart = (data: InvoiceInput[]) => {
    const totalsByClient: Record<string, number> = {};

    data.forEach((invoice) => {
      const clientName = invoice.Client.name;
      const total = invoice.total;

      if (!totalsByClient[clientName]) {
        totalsByClient[clientName] = 0;
      }

      totalsByClient[clientName] += total;
    });

    const chartData = Object.entries(totalsByClient).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    return chartData;
  };

  const formatGraphDataFromInvoices = (
    invoices: InvoiceInput[],
  ): GraphPoint[] => {
    const monthlyData: Record<string, { date: string; totalInvoice: number }> =
      {};

    const getMonthKey = (date: string) => {
      const [year, month] = date.slice(0, 10).split("-");
      return `${year}-${month}`;
    };

    invoices.forEach((invoice) => {
      const date = invoice.date.slice(0, 10);
      const key = getMonthKey(date);

      if (!monthlyData[key]) {
        monthlyData[key] = {
          date: key,
          totalInvoice: 0,
        };
      }

      // Add invoice subTotal to totalInvoice
      monthlyData[key].totalInvoice += invoice.total;
    });

    const result: GraphPoint[] = Object.values(monthlyData)
      .map((item) => ({
        date: item.date,
        totalInvoice: parseFloat(item.totalInvoice.toFixed(2)) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  };

  async function getPayments() {
    const response = await getPaymentsApi();
    if (response && response.status === 200) {
      setPayments(response.data.data);
    }
  }

  async function getAllPurchases() {
    const response = await getAllPurchasesApi();
    if (response && response.status === 200) {
      setPurchases(response.data.data);
    }
  }
  async function getInvoice() {
    const response = await getAllInvoicesApi();
    if (response && response.status === 200) {
      setInvoice(response.data.data);
    }
  }

  async function getClients() {
    const response = await getAllClientsApi();
    if (response && response.status === 200) {
      setClients(response.data.data);
    }
  }
  async function getExpenses() {
    const response = await getAllExpensesApi();
    if (response && response.status === 200) {
      setExpenses(response.data.data);
    }
  }


  useEffect(() => {
    getPayments();
    getAllPurchases()
    getClients()
    getInvoice()
    getExpenses()
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex gap-10">
        <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <HiOutlineCurrencyRupee size={36} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted">Total Invoicing value</p>
              <p className="text-xl text-[#007E3B]">
                INR{" "}
                {invoice
                  ?.reduce((acc, invoice) => acc + invoice?.total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <PiHandbagSimpleBold size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted">Total Purchase Value</p>
              <p className="text-xl text-[#007E3B]">
                INR{" "}
                {purchaseSum}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <PiUsersThree size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted">Customers</p>
              <p className="text-xl text-[#007E3B]">{clients?.length}</p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#F4F7FE] p-3">
              <FaRegClock size={30} className="text-primary" />
            </div>
            <div className="font-medium">
              <p className="text-muted text-sm">Pending payments</p>
              <p className="text-xl text-[#007E3B]">
                INR{" "}
                {clients
                  ?.reduce((acc, client) => acc + client?.outstanding, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-between gap-5">
        <div
          className={`flex w-full rounded-xl border bg-[#FAFAFA] p-5 shadow-md`}
        >
          <div className="flex w-[20%] flex-col justify-between gap-2 py-5">
            <div className="flex flex-col gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-fit justify-start text-left font-normal text-black`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {date.from.toLocaleDateString()} -{" "}
                          {date.to.toLocaleDateString()}
                        </>
                      ) : (
                        date.from.toLocaleDateString()
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <div className="">
                <p>Invoice Amount</p>
                <p className="text-2xl font-medium">
                  INR{" "}
                  {invoice
                    ?.reduce((acc, curr) => acc + curr.total, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#008EFF]"></div>
              <p className="font-medium text-[#008EFF]">Invoice Amount</p>
            </div>
            {/* <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#FF9090]"></div>
              <p className="font-medium text-[#FF9090]">Freight Amount</p>
            </div> */}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatGraphDataFromInvoices(invoice)}>
              <XAxis dataKey="date" axisLine={false} />
              <YAxis axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalInvoice"
                name="Invoice Total"
                stroke="#008EFF"
                strokeWidth={3}
              />
              <Line
                type="natural"
                dataKey="totalPurchase"
                name="Purchase Total"
                stroke="#FF9090"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div
          className={`flex max-h-[40vh] w-[30%] flex-col overflow-y-auto rounded-xl border bg-[#FAFAFA] p-5 shadow-md`}
        >
          <div className="flex flex-col">
            <p className="font-medium">Branch wise performance</p>
          </div>
          <div className="flex w-full flex-col items-center">
            <PieChart width={190} height={200}>
              <Pie
                cx="50%"
                cy="50%"
                outerRadius={90}
                data={invoice ? getClientPieChart(invoice) : []}
                fill="#8884d8"
                dataKey="value"
              >
                {invoice &&
                  getClientPieChart(invoice).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="flex flex-col gap-1">
              {invoice &&
                getClientPieChart(invoice).map((data, index) => (
                  <div
                    className="flex max-h-[9vh] justify-between gap-8 overflow-y-auto"
                    key={data.name}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-3 rounded-full`}
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <p className="text-sm">{data.name}</p>
                    </div>
                    <p className="text-sm">₹{data.value.toFixed(2)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3 rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
        <p className="text-sm text-slate-500">Expenses vs Revenue</p>

        <div className="relative flex">
          <motion.div
            className="bg-primary z-1 h-8"
            style={{ width:  revenuePercentageWidth}}
          ></motion.div>
          <motion.div
            className="bg-secondary z-1 h-8"
            style={{ width: purchasePercentageWidth }}
          ></motion.div>
          <div className={`absolute h-8 w-full bg-[#9EFFCB]`}></div>
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <div className="size-4 bg-[#9EFFCB] rounded-full"></div><p className="text-sm">Expenses</p><p>{expenseSum.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="size-4 bg-[#28A745] rounded-full"></div><p className="text-sm">Revenue</p> <p>{invoiceSum.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="size-4 bg-[#00791C] rounded-full"></div><p className="text-sm">Purchases</p> <p>{purchaseSum.toFixed(2)}</p>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3 rounded-xl border bg-[#FAFAFA] p-5 shadow-md">
        <p className="text-secondary text-xl font-medium">
          Recent Transactions
        </p>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-start font-[500]">Invoice Number</th>
              <th className="text-start font-[500]">client Name</th>
              <th className="font-[500]">Date</th>
              <th className="font-[500]">Paid</th>
              <th className="font-[500]">Pending Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((invoice) => (
              <tr key={invoice.id}>
                <td className="py-2">{invoice.Invoice.invoiceId}</td>
                <td>{invoice.Invoice?.Client.name}</td>
                <td className="text-center">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="text-center">INR {invoice.amount}</td>
                <td className="text-center capitalize">
                  {invoice.pendingAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
