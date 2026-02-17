import { NotesShell } from "./components/notes-shell";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotesShell>{children}</NotesShell>;
}
