interface LoadingSpinnerProps {
  size?: "sm" | "md";
  label?: string;
}

const LoadingSpinner = ({ size = "md", label }: LoadingSpinnerProps) => {
  const spinnerSize = size === "sm" ? "h-3.5 w-3.5 border-2" : "h-5 w-5 border-2";

  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      <span
        className={`${spinnerSize} inline-block animate-spin rounded-full border-blue-300 border-t-blue-600`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm text-slate-700">{label}</span> : null}
    </span>
  );
};

export default LoadingSpinner;
