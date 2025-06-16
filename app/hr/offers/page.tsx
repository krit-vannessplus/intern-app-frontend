import { Navbar } from "@/components/navbar";
import OfferList from "@/components/offerList";
import { ReturnButton } from "@/components/returnButton";

export default function OffersPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-5 w-full">
        <ReturnButton />
        <OfferList />
      </div>
    </div>
  );
}
