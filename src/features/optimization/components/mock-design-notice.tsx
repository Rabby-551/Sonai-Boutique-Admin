export function MockDesignNotice({ children }: { children: string }) {
  return (
    <div className="notice" role="note">
      <strong>Fictional design data.</strong> {children}
    </div>
  );
}
