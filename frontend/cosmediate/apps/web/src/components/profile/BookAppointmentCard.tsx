"use client";

import React, { useState, useEffect, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cosmediate/ui/components/select";
import { Clinic, Specialist, Treatment } from "@cosmediate/type-utils";
import { ScrollArea } from "@cosmediate/ui/components/scroll-area";
import { useTranslations } from "@cosmediate/i18n/client";
import { Button } from "@cosmediate/ui/components/button";
import { Input } from "@cosmediate/ui/components/input";
import { Label } from "@cosmediate/ui/components/label";
import { cn } from "@cosmediate/ui/lib/utils";
import { DatePicker } from "@cosmediate/ui";

export const BookAppointmentCard = () => {
  const [treatmentsOptions, setTreatmentsOptions] = useState<string[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [formData, setFormData] = useState({
    treatment: "",
    date: "",
    time: "",
    comment: "",
  });

  // useEffect(() => {

  //     const uniqueCategories = Array.from(
  //       new Set(
  //         (bookingEntity?.data as Clinic | Specialist)?.metadata?.treatments
  //           ?.map(
  //             (treatment) =>
  //               treatment?.metadata?.subcategory?.metadata?.category?.name || ""
  //           )
  //           .filter(Boolean)
  //       )
  //     );

  //     setTreatmentsOptions(uniqueCategories);
  //     setTreatments(
  //       (bookingEntity?.data as Clinic | Specialist)?.metadata?.treatments?.map(
  //         (treatment) => treatment?.metadata?.subcategory
  //       ) || []
  //     );
  // }, []);

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooking = () => {
    console.log(formData);

    setFormData({
      treatment: "",
      date: "",
      time: "",
      comment: "",
    });
  };

  return (
    <div className="w-full lg:mb-10">
      <DesktopViewCard
        handleFormDataChange={handleFormDataChange}
        handleBooking={handleBooking}
        treatmentsOptions={treatmentsOptions}
        formData={formData}
      />
      <MobileViewDrawer
        handleFormDataChange={handleFormDataChange}
        handleBooking={handleBooking}
        treatmentsOptions={treatmentsOptions}
        formData={formData}
      />
    </div>
  );
};

const DesktopViewCard = ({
  handleFormDataChange,
  handleBooking,
  treatmentsOptions,
  formData,
}: {
  handleFormDataChange: (field: string, value: string) => void;
  handleBooking: () => void;
  treatmentsOptions: string[];
  formData: { treatment: string; date: string; time: string; comment: string };
}) => {
  return (
    <div
      className={cn(
        "w-full bg-900 rounded-3xl flex flex-col items-center justify-start gap-6 z-40",
        "p-8 max-xl:p-6",
        "max-lg:hidden",
      )}
    >
      <Header />
      <BookAppointmentContent
        treatmentsOptions={treatmentsOptions}
        handleFormDataChange={handleFormDataChange}
        formData={formData}
      />
      <ActionButton handleBooking={handleBooking} />
    </div>
  );
};

const MobileViewDrawer = ({
  handleFormDataChange,
  handleBooking,
  treatmentsOptions,
  formData,
}: {
  handleFormDataChange: (field: string, value: string) => void;
  handleBooking: () => void;
  treatmentsOptions: string[];
  formData: { treatment: string; date: string; time: string; comment: string };
}) => {
  const [drawerHeight, setDrawerHeight] = useState("17vh");
  const [isExpanded, setIsExpanded] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentHeight = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setDrawerHeight(isExpanded ? "90vh" : "17vh");
  }, [isExpanded]);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "auto";

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    dragStartY.current = e?.touches?.[0]?.clientY || 0;
    currentHeight.current = drawerRef.current?.offsetHeight || 0;
    isDragging.current = true;
    setIsExpanded(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    // Prevent default to stop body scrolling during drawer drag
    e?.preventDefault();
    e?.stopPropagation();

    const currentY = e?.touches?.[0]?.clientY || 0;
    const deltaY = currentY - dragStartY.current;

    // Calculate new height (deltaY is positive when dragging down)
    const windowHeight = window.innerHeight;
    const minHeight = windowHeight * 0.17; // 17vh
    const maxHeight = windowHeight * 0.9; // 90vh

    let newHeight = currentHeight.current - deltaY;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    if (drawerRef.current) {
      drawerRef.current.style.height = `${newHeight}px`;
      drawerRef.current.style.transition = "none";
    }

    // Make sure body doesn't scroll during drag
    document.body.style.overflow = "hidden";
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e?.preventDefault();
    e?.stopPropagation();
    isDragging.current = false;

    const windowHeight = window.innerHeight;
    const currentHeightPx = drawerRef.current?.offsetHeight || 0;
    const currentHeightPercentage = (currentHeightPx / windowHeight) * 100;

    if (drawerRef.current) {
      drawerRef.current.style.transition = "height 300ms ease-in-out";
    }

    // If dragged more than halfway, expand fully, otherwise collapse
    if (currentHeightPercentage > 50) {
      setIsExpanded(true);
      setDrawerHeight("90vh");
      // Keep body overflow hidden when expanded
      document.body.style.overflow = "hidden";
    } else {
      setIsExpanded(false);
      setDrawerHeight("17vh");
      // Restore scrolling when collapsed
      document.body.style.overflow = "auto";
    }
  };

  return (
    <div className="w-full hidden max-lg:block transition-all duration-300 ease-in-out">
      <div
        ref={drawerRef}
        className={cn(
          "w-full hidden max-lg:block",
          "fixed bottom-0 left-0 right-0 z-40 bg-900 rounded-t-xl shadow-lg transition-all duration-300 ease-in-out",
          "flex flex-col items-center",
          "px-8 max-sm:px-6 pt-4",
          !isExpanded ? "pb-0" : "pb-8",
        )}
        style={{ height: drawerHeight }}
      >
        <div
          className="w-full flex justify-center items-center cursor-grab active:cursor-grabbing py-2 touch-none mb-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          // onClick={() => {
          //   if (!isDragging.current) {
          //     setIsExpanded(!isExpanded);
          //   }
          // }}
        >
          <div className="w-[65px] h-1.5 bg-300 rounded-full mx-auto" />
        </div>

        <Header />

        <div
          className={cn(
            "w-full overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 h-full" : "opacity-0 h-0",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ScrollArea className="w-full h-[calc(90vh-10rem)]">
            <BookAppointmentContent
              handleFormDataChange={handleFormDataChange}
              treatmentsOptions={treatmentsOptions}
              formData={formData}
            />
          </ScrollArea>

          <div className="w-full">
            <ActionButton handleBooking={handleBooking} />
          </div>
        </div>
      </div>
    </div>
  );
};

const BookAppointmentContent = ({
  handleFormDataChange,
  treatmentsOptions,
  formData,
}: {
  handleFormDataChange: (field: string, value: string) => void;
  treatmentsOptions: string[];
  formData: { treatment: string; date: string; time: string; comment: string };
}) => {
  const profile = useTranslations("profile");

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start gap-6 max-lg:my-5 pointer-events-none opacity-50",
      )}
    >
      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <Label className="text-sm text-100 leading-[21px]">
          {profile.bookAppointment.treatment}
        </Label>

        <TreatmentSelect
          options={treatmentsOptions}
          onChange={(value) => handleFormDataChange("treatment", value)}
          formData={formData}
        />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <Label className="text-sm text-100 leading-[21px]">
          {profile.bookAppointment.date}
        </Label>

        <DatePicker
          value={formData.date ? new Date(formData.date) : undefined}
          onChange={(date) =>
            handleFormDataChange("date", date?.toISOString() ?? "")
          }
          placeholder={profile.bookAppointment.selectDate}
          triggerClasses="w-full rounded-xl border-none bg-700 hover:bg-700/75 px-4 py-5.5 text-300 data-[date-selected=true]:text-100"
        />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <Label className="text-sm text-100 leading-[21px]">
          {profile.bookAppointment.time}
        </Label>

        <div className="w-full flex flex-wrap items-center justify-start gap-2">
          {[
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
            "19:00",
          ].map((slot, index) => (
            <span
              key={index}
              onClick={() => handleFormDataChange("time", slot)}
              className={cn(
                "p-4 py-2 rounded-xl !border border-600 text-xs text-100 font-medium tracking-[0.22px] leading-[17px] hover:bg-700 cursor-pointer transition-all duration-100 ease-in-out",
                formData.time === slot && "bg-700",
              )}
            >
              {slot}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full flex items-center justify-start">
        <Input
          value={formData.comment}
          onChange={(e) => handleFormDataChange("comment", e.target.value)}
          className={cn(
            "w-full border-none rounded-xl bg-700 px-4 py-5.5 text-sm leading-[18px] placeholder:text-300 text-100",
          )}
          placeholder={profile.bookAppointment.commentPlaceholder}
        />
      </div>
    </div>
  );
};

const ActionButton = ({ handleBooking }: { handleBooking: () => void }) => {
  const profile = useTranslations("profile");

  return (
    <Button
      disabled
      type="button"
      className="w-full py-5.5"
      onClick={handleBooking}
    >
      {profile.bookAppointment.bookNow}
    </Button>
  );
};

const Header = () => {
  const profile = useTranslations("profile");

  return (
    <div className="w-full flex flex-col items-start justify-start max-lg:items-center gap-1">
      <div className="w-full text-xl max-xl:text-lg text-100 font-bold leading-6 text-center lg:text-left">
        {profile.bookAppointment.title}
      </div>
      <div className="text-sm text-center lg:text-left text-400">
        {profile.bookAppointment.comingSoon}
      </div>
    </div>
  );
};

const TreatmentSelect = ({
  options,
  onChange,
  formData,
}: {
  options: string[];
  onChange: (value: string) => void;
  formData: { treatment: string; date: string; time: string; comment: string };
}) => {
  const profile = useTranslations("profile");

  return (
    <Select value={formData.treatment} onValueChange={onChange}>
      <SelectTrigger
        // iconClasses="size-5 text-300"
        className={cn(
          "w-full border-none rounded-xl !bg-700 [&:hover]:!bg-700/75 !px-4 !py-5.5 !text-sm !leading-[18px] cursor-pointer",
          formData.treatment ? "!text-100" : "!text-300",
        )}
      >
        <SelectValue placeholder={profile.bookAppointment.select} />
      </SelectTrigger>

      <SelectContent className="z-40">
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="cursor-pointer py-3"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
