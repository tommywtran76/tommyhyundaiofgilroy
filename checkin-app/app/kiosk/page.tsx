import type { Metadata } from "next";
import KioskApp from "@/components/kiosk/KioskApp";
import RegisterSW from "@/components/kiosk/RegisterSW";

export const metadata: Metadata = {
  title: "Check In — Aileen’s Beauty",
};

export default function KioskPage() {
  return (
    <>
      <RegisterSW />
      <KioskApp />
    </>
  );
}
