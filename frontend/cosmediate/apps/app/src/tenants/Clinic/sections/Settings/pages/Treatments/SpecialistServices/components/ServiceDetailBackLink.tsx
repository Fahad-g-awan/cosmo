interface ServiceDetailBackLinkProps {
  onBack: () => void;
}

export const ServiceDetailBackLink = ({
  onBack,
}: ServiceDetailBackLinkProps) => {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-sm text-primary-accent w-fit"
    >
      ← Back to services
    </button>
  );
};
