export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-full gap-12 items-center">{children}</div>
  );
}
