export function QrCard() {
  const cells = Array.from({ length: 49 }, (_, index) => {
    const fixed =
      index === 0 ||
      index === 1 ||
      index === 7 ||
      index === 8 ||
      index === 40 ||
      index === 48 ||
      index % 5 === 0 ||
      index % 7 === 3;
    return (
      <span
        key={index}
        className={fixed ? "rounded-[2px] bg-white" : "rounded-[2px] bg-white/15"}
      />
    );
  });

  return (
    <div className="mx-auto grid h-40 w-40 grid-cols-7 gap-1 rounded-2xl border border-white/10 bg-black p-4 shadow-phone">
      {cells}
    </div>
  );
}
