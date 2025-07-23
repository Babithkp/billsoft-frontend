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
import { LuSearch } from "react-icons/lu";
import { useEffect, useState } from "react";
import { MdOutlineAdd } from "react-icons/md";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import {
  createExpenseApi,
  deleteExpenseApi,
  getAllExpensesApi,
  updateExpenseApi,
} from "@/api/expense";
import { RiDeleteBin6Line, RiEditBoxLine } from "react-icons/ri";
import { getExpenseIdApi } from "@/api/settings";
import { convertToINRWords } from "@/lib/utils";

export interface ExpensesInputs {
  id: string;
  expenseId: number;
  title: string;
  date: Date;
  category: string;
  amount: number;
  amountInWords: string;
  paymentType: string;
  transactionId: string;
  description: string;
}

export default function Expense({data}:{data?:ExpensesInputs[]}) {
  const [search, setSearch] = useState("");
  const [formStatus, setFormStatus] = useState<"create" | "edit">("create");
  const [CreateExpenseModal, setCreateExpenseModal] = useState(false);
  const [isExpenseIdExists, setIsExpenseIdExists] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [filteredExpense, setFilteredExpense] = useState<ExpensesInputs[]>(data ??[]);
  const [expenseData, setExpenseData] = useState<ExpensesInputs[]>(data ?? []);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpensesInputs | null>();
  const [expenseDetailsModal, setExpenseDetailsModal] = useState(false);
  const [expenseId, setExpenseId] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<ExpensesInputs>();

  useEffect(() => {
    const delay = setTimeout(() => {
      const text = search.trim().toLowerCase();

      if (!text) {
        setFilteredExpense(expenseData);
        return;
      }

      const filtered = expenseData.filter((expense) => {
        const fieldsToSearch: (string | number | undefined | null)[] = [
          expense.expenseId,
          expense.title,
          expense.amount,
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

      setFilteredExpense(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, expenseData]);

  const watchAmount = watch("amount");

  useEffect(() => {
    if (watchAmount) {
      setValue(
        "amountInWords",
        convertToINRWords(parseFloat(String(watchAmount || "0"))),
      );
    }
  }, [watchAmount]);

  const deleteExpense = async () => {
    if (!selectedExpense) {
      return;
    }
    setIsloading(true);
    const response = await deleteExpenseApi(selectedExpense!.id);
    if (response && response.status === 200) {
      toast.success("Expense deleted successfully");
      setExpenseDetailsModal(false);
      getAllExpenses();
    } else {
      toast.error("Expense deletion failed");
    }
    setIsloading(false);
  };

  const setValuesToInputs = (expense: ExpensesInputs) => {
    const formattedDate = new Date(expense.date).toISOString().split("T")[0];
    setFormStatus("edit");
    setExpenseDetailsModal(false);
    setValue("id", expense.id);
    setValue("expenseId", expense.expenseId);
    setValue("title", expense.title);
    setValue("date", formattedDate as any);
    setValue("category", expense.category);
    setValue("amount", expense.amount);
    setValue("amountInWords", expense.amountInWords);
    setValue("paymentType", expense.paymentType);
    setValue("transactionId", expense.transactionId);
    setValue("description", expense.description);
  };

  const onSubmit = async (data: ExpensesInputs) => {
    setIsloading(true);
    if (formStatus === "create") {
      const response = await createExpenseApi(data);
      if (response && response.status === 200) {
        toast.success("Expense created successfully");
        reset();
        setCreateExpenseModal(false);
        getAllExpenses();
      } else if (response && response.status === 203) {
        setIsExpenseIdExists(true);
        setTimeout(() => {
          setIsExpenseIdExists(false);
        }, 3000);
      } else {
        toast.error("Expense creation failed");
      }
    } else if (formStatus === "edit") {
      const response = await updateExpenseApi(data);
      if (response && response.status === 200) {
        toast.success("Expense updated successfully");
        resetInputs();
        setCreateExpenseModal(false);
        getAllExpenses();
      } else {
        toast.error("Expense update failed");
      }
    }
    setIsloading(false);
  };

  const resetInputs = () => {
    setFormStatus("create");
    setSelectedExpense(null);
    reset();
  };

  async function getAllExpenses() {
    const response = await getAllExpensesApi();
    if (response && response.status === 200) {
      setExpenseData(response.data.data);
      setFilteredExpense(response.data.data);
    }
  }

  async function getExpenseId() {
    const response = await getExpenseIdApi();
    if (response && response.status === 200) {
      setExpenseId(response.data.data);
    }
  }

  useEffect(() => {
    getAllExpenses();
  }, []);
  return (
    <>
      <section>
        <div className="flex gap-10">
          <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md border">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <TbInvoice size={36} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted">Total Expenses</p>
                <p className="text-xl text-[#007E3B]">{expenseData.length}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full rounded-xl bg-[#FAFAFA] p-5 shadow-md border">
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-[#F4F7FE] p-3">
                <RxCube size={30} className="text-primary" />
              </div>
              <div className="font-medium">
                <p className="text-muted">Total expense value</p>
                <p className="text-xl text-[#007E3B]">
                  INR {expenseData.reduce((acc, curr) => acc + curr.amount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className={`flex h-fit max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-md bg-[#FAFAFA] p-5 shadow-md border`}
      >
        <div className={`flex items-center justify-between`}>
          <p className="text-xl font-medium text-[#007E3B]">Expenses</p>
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
            <Dialog
              open={CreateExpenseModal}
              onOpenChange={setCreateExpenseModal}
            >
              <DialogTrigger
                className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-3 font-medium text-white"
                onClick={() => [resetInputs(), getExpenseId()]}
              >
                <MdOutlineAdd size={24} />
                Create new
              </DialogTrigger>
              <DialogContent className="min-w-[90rem]">
                <DialogHeader>
                  <DialogTitle className="text-secondary">
                    {formStatus === "create" ? "Add Item" : "Update Item"}
                  </DialogTitle>
                  <DialogDescription></DialogDescription>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-wrap justify-between gap-5"
                  >
                    <div className="w-[23%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Expense ID</label>
                        <input
                          type="text"
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("expenseId", { required: true })}
                          value={expenseId}
                          readOnly
                        />
                      </div>
                      {errors.expenseId && (
                        <p className="text-red-500">Expense ID is required</p>
                      )}
                      {isExpenseIdExists && (
                        <p className="text-red-500">
                          Expense ID already exists
                        </p>
                      )}
                    </div>
                    <div className="w-[23%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Expense Title</label>
                        <input
                          type="text"
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("title", { required: true })}
                        />
                      </div>
                      {errors.title && (
                        <p className="text-red-500">
                          Expense title is required
                        </p>
                      )}
                    </div>
                    <div className="w-[23%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Date</label>
                        <input
                          type="date"
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("date", { required: true })}
                        />
                      </div>
                      {errors.date && (
                        <p className="text-red-500">Expense Date is required</p>
                      )}
                    </div>
                    <div className="w-[23%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Category</label>
                        <Controller
                          name="category"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                                <SelectValue
                                  placeholder="Select Category"
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
                      {errors.category && (
                        <p className="text-red-500">Category is required</p>
                      )}
                    </div>
                    <div className="w-[30%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Amount</label>
                        <div className="border-primary flex items-center rounded-md border pl-2">
                          <p className="text-xs font-medium">INR</p>
                          <input
                            type="text"
                            placeholder="00000.00"
                            className="w-full p-2 outline-none"
                            {...register("amount", {
                              required: true,
                            })}
                          />
                        </div>
                      </div>
                      {errors.amount && (
                        <p className="text-red-500">amount is required</p>
                      )}
                    </div>
                    <div className="w-[30%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">
                          Amount in words (auto-generated)
                        </label>
                        <input
                          type="text"
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("amountInWords", { required: true })}
                        />
                      </div>
                      {errors.amountInWords && (
                        <p className="text-red-500">Amount is required</p>
                      )}
                    </div>
                    <div className="w-[30%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Payment type</label>
                        <Controller
                          name="paymentType"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="border-primary w-full py-5 data-placeholder:text-black">
                                <SelectValue
                                  placeholder="Select Payment Type"
                                  className="data-placeholder:text-black"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="IMPS">IMPS</SelectItem>
                                <SelectItem value="RTGS">RTGS</SelectItem>
                                <SelectItem value="NEFT">NEFT</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      {errors.paymentType && (
                        <p className="text-red-500">Payment type is required</p>
                      )}
                    </div>
                    <div className="w-[49%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">
                          Transaction Reference number
                        </label>
                        <input
                          type="text"
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("transactionId", { required: true })}
                        />
                      </div>
                      {errors.transactionId && (
                        <p className="text-red-500">
                          Transaction / reference number is required
                        </p>
                      )}
                    </div>
                    <div className="w-[49%]">
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">Description</label>
                        <textarea
                          className="border-primary rounded-md border p-1 py-2 pl-2"
                          {...register("description", { required: true })}
                        />
                      </div>
                      {errors.description && (
                        <p className="text-red-500">Description is required</p>
                      )}
                    </div>
                    <div className="flex w-full justify-end gap-5">
                      <Button
                        variant={"outline"}
                        className="border-primary rounded-xl px-10"
                      >
                        Cancel
                      </Button>
                      <Button className="rounded-xl px-7" disabled={isloading}>
                        {isloading ? (
                          <VscLoading size={24} className="animate-spin" />
                        ) : formStatus === "create" ? (
                          "Record Expense"
                        ) : (
                          "Update Expense"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <table className={`w-full`}>
          <thead>
            <tr>
              <th className="text-muted text-start font-medium">
                <p>Expense ID</p>
              </th>
              <th className="text-muted  font-medium">
                <p>Title</p>
              </th>
              <th className="text-muted   font-medium">
                <p>Total Purchase Value</p>
              </th>
              <th className="text-muted text-center font-medium">
                Amount Paid
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpense.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-accent cursor-pointer"
                onClick={() => [
                  setSelectedExpense(expense),
                  setExpenseDetailsModal(true),
                ]}
              >
                <td className="py-2">{expense.expenseId}</td>
                <td className="py-2 text-center">{expense.title}</td>
                <td className="py-2 text-center">{expense.amount}</td>
                <td className="py-2 text-center">{expense.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Dialog open={expenseDetailsModal} onOpenChange={setExpenseDetailsModal}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl">
          <DialogHeader className="flex">
            <DialogTitle className="text-secondary flex justify-between">
              <span>Expense - {selectedExpense?.expenseId}</span>
              <div className="mr-10 flex gap-3">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setValuesToInputs(selectedExpense!),
                    setCreateExpenseModal(true),
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
                        Are you sure you want to remove this Expense? This
                        action is permanent and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                        onClick={deleteExpense}
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
              <label className="font-medium">Expense ID</label>
              <p>{selectedExpense?.expenseId}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Title</label>
              <p>{selectedExpense?.title}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Date</label>
              <p>
                {new Date(selectedExpense?.date as Date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Category</label>
              <p>{selectedExpense?.category}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Amount</label>
              <p>{selectedExpense?.amount}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Amount in words</label>
              <p>{selectedExpense?.amountInWords}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Payment type</label>
              <p>{selectedExpense?.paymentType}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Transaction ID</label>
              <p>{selectedExpense?.transactionId}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Description</label>
              <p>{selectedExpense?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
