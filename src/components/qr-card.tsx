import QRCode from "react-qr-code";

type QrCardProps = {
  value?: string;
  label?: string;
};

export function QrCard({ value = "https://scopenod.vercel.app", label }: QrCardProps) {
  return (
    <div className="mx-auto grid w-fit gap-3 rounded-2xl border border-white/10 bg-white p-4 shadow-phone">
      <QRCode value={value} size={148} bgColor="#ffffff" fgColor="#0b0e12" />
      {label ? (
        <p className="max-w-[148px] truncate text-center text-xs font-semibold text-graphite-950">
          {label}
        </p>
      ) : null}
    </div>
  );
}
