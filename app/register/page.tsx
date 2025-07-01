import { RegisterBox } from "@/components/registerBox";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

export default function RegisterPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen flex flex-col h-full">
      <Navbar token={null} />
      <div className="justify-center m-auto pt-14 flex-1 w-9/12 max-w-[450px]">
        <RegisterBox />
      </div>
      <Footer />
    </div>
  );
}
