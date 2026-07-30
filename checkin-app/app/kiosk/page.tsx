import type { Metadata } from "next";
import KioskApp from "@/components/kiosk/KioskApp";

export const metadata: Metadata = {
  title: "Check In — Aileen’s Beauty",
};

export default function KioskPage() {
  return <KioskApp />;
}
