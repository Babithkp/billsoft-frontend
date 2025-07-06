import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { InvoiceInputs } from "./InvoiceList";
import { SettingsInputs } from "../settings/Settings";
import logo from "@/assets/logobillsoft.png";
import qrImg from "@/assets/qrcode.png";

export default function InvoiceTemplate({
  invoice,
  settings,
}: {
  invoice?: InvoiceInputs;
  settings?: SettingsInputs;
}) {
  return (
    <Document>
      <Page
        size="A4"
        style={{
          paddingHorizontal: 25,
          paddingVertical: 15,
          fontSize: 10,
          backgroundColor: "#ffffff",
          borderTop: "10px solid #4CAF7A",
          justifyContent: "space-between",
          height: "100%",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            height: "90%",
          }}
        >
          <Image src={logo} style={{ width: 600, height: 250, opacity: 0.3 }} />
        </View>
        <View style={{ gap: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>Invoice</Text>
            <Text style={{ fontSize: 20 }}>{invoice?.invoiceId}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            <View style={{ height: "100%" }}>
              <Text>TO:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                {invoice?.Client.name}
              </Text>
              <Text>GSTIN: {invoice?.Client.GSTIN}</Text>
              <Text>{invoice?.Client.address}</Text>
            </View>
            <View style={{ height: "100%" }}>
              <Text>FROM:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                Asian Best Eco Traders
              </Text>
              <Text>GSTIN: {settings?.GSTIN}</Text>
              <Text>{settings?.address}</Text>
              <Text>Contact: {settings?.contactNumber}</Text>
            </View>
            <View style={{ height: "100%" }}>
              <Text>INFO:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                Amount: INR {invoice?.total.toFixed(2)}
              </Text>
              <Text>
                Date: {new Date(invoice?.date ?? "").toLocaleDateString()}
              </Text>
              <Text>
                Due Date:{" "}
                {new Date(invoice?.dueDate ?? "").toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
            }}
          >
            <Text style={{ width: "45%" }}>ITEM DESCRIPTION</Text>
            <Text style={{ width: "22%", textAlign: "center" }}>QTY</Text>
            <Text style={{ width: "22%", textAlign: "center" }}>RATE</Text>
            <Text>AMOUNT</Text>
          </View>
          <View
            style={{
              gap: 10,
              paddingBottom: 10,
            }}
          >
            {invoice?.items.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 11,
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <Text style={{ width: "45%" }}>{item.itemName}</Text>
                <Text
                  style={{ width: "22%", fontWeight: 800, textAlign: "center" }}
                >
                  {item.purchaseQty}
                </Text>
                <Text
                  style={{ width: "22%", fontWeight: 800, textAlign: "center" }}
                >
                  {item.sellingPrice}
                </Text>
                <Text style={{ fontWeight: 800 }}>
                  INR {item.sellingPrice * item.purchaseQty}
                </Text>
              </View>
            ))}
            <View
              style={{
                borderTop: "1px solid black",
                borderBottom: "1px solid black",
                gap: 10,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text>Sub Total</Text>
                <Text>
                  INR{" "}
                  {invoice?.items
                    ?.reduce(
                      (acc, item) => acc + item.sellingPrice * item.purchaseQty,
                      0,
                    )
                    .toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text>Discount ({invoice?.discount}%)</Text>
                <Text>
                  INR{" "}
                  {(
                    ((invoice?.items ?? []).reduce(
                      (acc, item) => acc + item.sellingPrice * item.purchaseQty,
                      0,
                    ) *
                      parseFloat(invoice?.discount ?? "0")) /
                    100
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              fontSize: 11,
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: 800, color: "#4CAF7A" }}>
                Total INR {invoice?.total.toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>
                Payment Details
              </Text>
              <Image src={qrImg} style={{ width: 80, height: 80 }} />
            </View>
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>
                Invoice Status:
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                {invoice?.status}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            borderTop: "2px solid black",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: 250, height: 80 }}>
            <Image src={logo} style={{ objectFit: "cover" }} />
          </View>
          <View
            style={{
              color: "#6F6F84",
              gap: 10,
            }}
          >
            <Text>{settings?.website}</Text>
            <Text>{settings?.email}</Text>
            <Text>{settings?.contactNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
