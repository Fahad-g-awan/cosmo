"use client";

import { useState } from "react";

import ProfileButton from "./components/ProfileButton";
import ProfileDropdown from "./views/ProfileDropdown";
import ProfileDrawer from "./views/ProfileDrawer";

export const ProfileCard = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex-1">
      {/* For Desktop View */}
      <div className="max-sm:hidden">
        <ProfileDropdown isOpen={isDropdownOpen} onOpenChange={setDropdownOpen}>
          <ProfileButton isDropdownOpen={isDropdownOpen} />
        </ProfileDropdown>
      </div>

      {/* For Mobile View */}
      <div className="hidden max-sm:block">
        <ProfileDrawer isOpen={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <ProfileButton isDropdownOpen={isDrawerOpen} />
        </ProfileDrawer>
      </div>
    </div>
  );
};
