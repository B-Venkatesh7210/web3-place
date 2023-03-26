import React from "react";
import Image from "next/image";
import Logo from "../assets/logos/Logo.png";
import LogoText from "../assets/logos/LogoText.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-between items-start py-4 px-6">
      <Image
        alt="logo"
        src={Logo}
        height={80}
        className="cursor-pointer"
        onClick={() => {
          router.push("/");
        }}
      ></Image>
      <Image alt="logo" src={LogoText} height={120}></Image>
      <div className="mt-10">
        <ConnectButton></ConnectButton>
      </div>
    </div>
  );
};

export default Navbar;
