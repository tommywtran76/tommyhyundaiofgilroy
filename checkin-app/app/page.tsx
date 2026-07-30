import { redirect } from "next/navigation";

// The root of the app is the guest kiosk. Staff reach the dashboard at /admin.
export default function Home() {
  redirect("/kiosk");
}
