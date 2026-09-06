"use client";

import { useState } from "react";

import ProfileButton from "./components/ProfileButton";
import ProfileDropdown from "./views/ProfileDropdown";
import ProfileDrawer from "./views/ProfileDrawer";

const UserProfileCard = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex-1">
      {/* For Desktop View */}
      <div className="max-sm:hidden w-full flex items-center justify-end">
        <ProfileDropdown isOpen={isDropdownOpen} onOpenChange={setDropdownOpen}>
          <ProfileButton isDropdownOpen={isDropdownOpen} />
        </ProfileDropdown>
      </div>

      {/* For Mobile View */}
      <div className="hidden w-full max-sm:flex items-center justify-end">
        <ProfileDrawer isOpen={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <ProfileButton isDropdownOpen={isDrawerOpen} />
        </ProfileDrawer>
      </div>
    </div>
  );
};

export default UserProfileCard;
