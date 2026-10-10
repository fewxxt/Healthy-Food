export default function Stars({ n }: { n: number }) {
  return <span className="stars" aria-label={`${n} ดาว`}>{"★".repeat(n)}<i>{"★".repeat(5 - n)}</i></span>;
}
