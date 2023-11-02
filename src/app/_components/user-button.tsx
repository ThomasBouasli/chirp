"use client";

import { UserButton as Button } from "@clerk/nextjs";
import { useMediaQuery } from "react-responsive";
import { dark } from "@clerk/themes";

const UserButton = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 640px)",
  });

  return (
    <Button
      appearance={{ baseTheme: dark }}
      showName={!isMobile}
      afterSignOutUrl="/"
    />
  );
};

export default UserButton;
