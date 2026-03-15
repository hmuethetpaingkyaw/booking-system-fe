interface AlertProps {
  type: "error" | "success";
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  if (!message) return null;

  const style =
    type === "error"
      ? "mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
      : "mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800";

  return <div className={style}>{message}</div>;
};

export default Alert;
