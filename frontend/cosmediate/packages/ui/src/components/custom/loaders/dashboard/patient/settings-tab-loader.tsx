import { ProfileLoader, SectionLayoutMenuLoader } from "@cosmediate/ui";

export const SettingsTabLoader = () => {
  return (
    <div className="container w-full grid grid-cols-3 max-sm:grid-cols-1 items-start justify-center gap-5">
      <div className="w-full col-span-1 max-sm:hidden">
        <SectionLayoutMenuLoader />
      </div>
      <div className="w-full col-span-2 max-sm:col-span-1">
        <ProfileLoader />
      </div>
    </div>
  );
};
