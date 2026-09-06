"use client";

import React from "react";

import { MobileBottomNav } from "./MobileBottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

import "./styles/index.css";

export const Navigation = () => {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
};
