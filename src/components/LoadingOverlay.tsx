import LoadingSpinner from "./LoadingSpinner";

interface LoadingOverlayProps {
  show: boolean;
  label?: string;
}

const LoadingOverlay = ({ show, label = "Loading..." }: LoadingOverlayProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/70 backdrop-blur-[1px]">
      <LoadingSpinner label={label} />
    </div>
  );
};

export default LoadingOverlay;
