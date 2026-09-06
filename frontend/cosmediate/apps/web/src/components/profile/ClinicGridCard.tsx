// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// import { Button } from "@cosmediate/ui/components/button";
// import { Clinic } from "@cosmediate/type-utils";
// import { cn } from "@cosmediate/ui/lib/utils";

// import { FaRegComments } from "react-icons/fa6";
// import { FaStar } from "react-icons/fa6";

// const ClinicGridCard = ({ clinic }: { clinic: Clinic }) => {
//   const handleTruncateText = (text: string) => {
//     if (!text) return "";
//     return text.length > 30 ? text.substring(0, 30) + "..." : text;
//   };

//   const getTreatmentCategories = () => {
//     if (!clinic?.metadata?.treatments) return [];

//     const names = clinic.metadata.treatments
//       .map(
//         (treatment) =>
//           treatment?.metadata?.subcategory?.metadata?.category?.name
//       )
//       .filter(Boolean);

//     return Array.from(new Set(names));
//   };

//   return (
//     <Link
//       href={`/clinics/${clinic.id}`}
//       className={cn(
//         "w-full h-full flex items-start justify-between gap-6 max-sm:flex-col max-sm:items-center"
//       )}
//     >
//       <div
//         className={cn(
//           "w-[30%] h-[170px] max-sm:w-full flex items-center justify-center relative rounded-xl"
//         )}
//       >
//         {clinic?.metadata?.images.length > 0 && (
//           <Image
//             src={(clinic?.metadata?.images?.[0] as string) || "/image"}
//             alt={(clinic?.metadata?.name as string) || "clinic image"}
//             width={500}
//             height={500}
//             quality={100}
//             className="w-full h-full rounded-xl object-cover"
//           />
//         )}
//         {clinic?.metadata?.images.length === 0 && (
//           <div className="w-full h-full rounded-xl bg-100" />
//         )}
//         <div className="w-[80px] h-[50px] bg-white p-2 rounded-lg absolute top-2 right-2 flex items-center justify-center">
//           <Image
//             src={(clinic?.metadata?.logo as string) || "/image"}
//             alt={`${(clinic?.metadata?.name as string) || "clinic logo"}`}
//             width={100}
//             height={100}
//             quality={100}
//             className="w-[80%] h-full object-cover rounded-lg"
//           />
//         </div>
//       </div>

//       <div
//         className={cn(
//           "w-[70%] max-sm:w-full flex items-center justify-between max-sm:flex-col"
//         )}
//       >
//         <div className="w-full flex flex-col gap-4 max-sm:items-center">
//           <h1
//             className={cn(
//               "w-full capitalize items-center justify-start font-semibold text-2xl max-sm:text-[20px] leading-8 max-sm:leading-[26px] text-900 text-wrap"
//             )}
//           >
//             {(clinic?.metadata?.name as string) || "Clinic Name"}
//           </h1>

//           <div className={cn("w-full flex items-center justify-start gap-6")}>
//             <div className={cn("flex items-center justify-center gap-1")}>
//               <FaStar className={cn("text-primary-accent size-4")} />
//               <span className={cn("font-medium text-sm leading-5 text-500")}>
//                 {(clinic?.metadata?.averageRating as number) || 0}
//               </span>
//             </div>

//             <div className={cn("flex items-center justify-center gap-1")}>
//               <FaRegComments className={cn("text-[#D9C560] size-4")} />
//               <span className={cn("font-medium text-sm leading-5 text-500")}>
//                 {(clinic?.metadata?.reviews?.length as number) || 0}
//               </span>
//             </div>

//             <span className={cn("font-medium text-xs leading-4 text-500")}>
//               {handleTruncateText(
//                 clinic?.metadata?.location?.completeAddress as string
//               )}
//             </span>
//           </div>

//           <div className="flex items-center justify-start flex-wrap gap-2">
//             {getTreatmentCategories().map((category, index) => (
//               <div
//                 key={index}
//                 className="font-medium text-700 text-xs leading-4 py-1 px-3 border border-stroke rounded-lg"
//               >
//                 {category}
//               </div>
//             ))}
//           </div>
//         </div>

//         <Button
//           variant={"outline"}
//           className={cn(
//             "min-w-24 max-sm:w-full max-sm:mt-4 flex border-2 font-bold text-primary-accent rounded-xl"
//           )}
//           onClick={(e) => {
//             e.stopPropagation();
//           }}
//         >
//           Book
//         </Button>
//       </div>
//     </Link>
//   );
// };

// export default ClinicGridCard;
