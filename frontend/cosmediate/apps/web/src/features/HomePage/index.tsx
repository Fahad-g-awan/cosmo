"use client";

import { Separator, MissionSection } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import PopularTreatments from "./components/PopularTreatments";
import FeaturesSection from "./components/FeaturesSection";
import ServicesSection from "./components/ServicesSection";
import PopularClinics from "./components/PopularClinics";
import Testimonials from "./components/Testimonials";
import BlogSection from "./components/BlogSection";
import Hero from "./components/HeroSecion";

import { useHomePageData } from "./hooks/useHomePageData";
import Loader from "./components/Loader";

import "./styles/homepage.styles.css";
import "./styles/loader.styles.css";

const HomePage = () => {
  const {
    clinics,
    treatments,
    reviews,
    blogs,
    isLoading,
    isClinicsLoading,
    isTreatmentsLoading,
    isReviewsLoading,
    isBlogsLoading,
  } = useHomePageData();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start gap-14 max-lg:gap-10"
      )}
    >
      <Hero />
      <PopularClinics clinics={clinics} isLoading={isClinicsLoading} />
      <FeaturesSection />
      <Separator className="w-[93%] bg-200/50" />
      <PopularTreatments
        treatments={treatments}
        isLoading={isTreatmentsLoading}
      />
      <ServicesSection />
      <Testimonials reviews={reviews} isLoading={isReviewsLoading} />
      <BlogSection blogs={blogs} isLoading={isBlogsLoading} />
      <Separator className="w-[93%] bg-200/50" />
      <MissionSection />
    </div>
  );
};

export default HomePage;
