import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { QuoteInputs } from "./QuotationList";
import { SettingsInputs } from "../settings/Settings";
import logo from "@/assets/logobillsoft.png";

export default function QuoteTemplate({
  quote,
  settings,
}: {
  quote?: QuoteInputs;
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
          position: "relative",
          justifyContent: "space-between",
          height: "100%",
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
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>Quote</Text>
            <Text style={{ fontSize: 20 }}>{quote?.quoteId}</Text>
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
            <View>
              <Text>TO:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                {quote?.Client.name}
              </Text>
              <Text>GSTIN: {quote?.Client.GSTIN}</Text>
              <Text>{quote?.Client.address}</Text>
            </View>
            <View>
              <Text>FROM:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                Asian Best Eco Traders
              </Text>
              <Text>GSTIN: {settings?.GSTIN}</Text>
              <Text>{settings?.address}</Text>
              <Text>Contact: {settings?.contactNumber}</Text>
            </View>
            <View>
              <Text>INFO:</Text>
              <Text style={{ fontSize: 12, fontWeight: 800 }}>
                Amount: INR {quote?.amount.toFixed(2)}
              </Text>
              <Text>
                Date: {new Date(quote?.date ?? "").toLocaleDateString()}
              </Text>
              <Text>
                Due Date: {new Date(quote?.dueDate ?? "").toLocaleDateString()}
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
            <Text style={{ width: "22%" }}>QTY</Text>
            <Text style={{ width: "22%" }}>RATE</Text>
            <Text>AMOUNT</Text>
          </View>
          <View
            style={{
              gap: 10,
              borderBottom: "1px solid black",
              paddingBottom: 10,
            }}
          >
            {quote?.items.map((item, i) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                }}
                key={i}
              >
                <Text style={{ width: "45%" }}>{item.itemName}</Text>
                <Text style={{ width: "22%", fontWeight: 800 }}>
                  {item.purchaseQty}
                </Text>
                <Text style={{ width: "22%", fontWeight: 800 }}>
                  {item.sellingPrice}
                </Text>
                <Text style={{ fontWeight: 800 }}>
                  INR {item.sellingPrice * item.purchaseQty}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              fontSize: 11,
            }}
          >
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Text style={{ fontWeight: 800 }}>Total</Text>
              <Text>(INR)</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: 800, color: "#4CAF7A" }}>
                INR {quote?.amount.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={{ gap: 5 }}>
            <Text style={{ fontSize: 11 }}>Note</Text>
            <Text style={{ fontWeight: 800, fontSize: 12 }}>
              Looking forward for the business
            </Text>
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
