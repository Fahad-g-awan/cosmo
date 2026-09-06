"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cosmediate/ui/components/tabs";
import { cn } from "@cosmediate/ui/lib/utils";

import SearchCardContent from "./components/SearchCardContent";

import { BiClinic, BiInjection } from "react-icons/bi";
import { User } from "lucide-react";

const TAB_KEYS = ["treatments", "clinics", "specialists"] as const;

const TAB_ICONS = {
  treatments: <BiInjection />,
  clinics: <BiClinic />,
  specialists: <User />,
} as const;

const SearchCard: React.FC = () => {
  const search = useTranslations("marketing").home.search;
  const [activeTab, setActiveTab] = React.useState<string>("treatments");

  return (
    <Tabs
      defaultValue="treatments"
      className={cn(
        "w-full rounded-3xl p-2 max-sm:rounded-none gap-0",
        "bg-gray-400/10 bg-clip-padding backdrop-filter backdrop-blur-lg",
      )}
    >
      <TabsList className="w-full h-full flex items-center justify-between p-0 bg-opacity-80">
        {TAB_KEYS.map((key) => (
          <TabsTrigger
            key={key}
            value={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "rounded-t-2xl rounded-b-none flex gap-2 max-sm:flex-col h-[70px] max-xl:h-[50px] max-lg:h-[70px] max-xl:text-xs max-lg:text-sm py-0 cursor-pointer hover:bg-cloud/40",
              activeTab === key ? "text-primary-accent" : "text-700",
            )}
          >
            {TAB_ICONS[key]}
            <span className="capitalize">{search.tabs[key]}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="w-full">
        <TabsContent value="treatments" key="treatments">
          <SearchCardContent
            activeTab={activeTab}
            path="/treatments"
            className="rounded-b-2xl rounded-tr-2xl"
            placeholder={search.placeholders.treatments}
            disableLocation
          />
        </TabsContent>
        <TabsContent value="clinics" key="clinics">
          <SearchCardContent
            activeTab={activeTab}
            path="/home/clinics"
            className="rounded-b-2xl rounded-t-2xl"
            placeholder={search.placeholders.clinics}
          />
        </TabsContent>
        <TabsContent value="specialists" key="specialists">
          <SearchCardContent
            activeTab={activeTab}
            path="/home/specialists"
            className="rounded-b-2xl rounded-tl-2xl"
            placeholder={search.placeholders.specialists}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default SearchCard;
