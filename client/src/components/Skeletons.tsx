export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div className="glass-card skeleton" style={{ height, width: '100%' }} />
  );
}

export function SkeletonText({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8 }}
    />
  );
}

export function SportCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 20, minWidth: 200 }}>
      <SkeletonCard height={100} />
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonText width="60%" height={18} />
        <SkeletonText width="80%" height={14} />
        <SkeletonText width="40%" height={14} />
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12 }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonText width="50%" height={16} />
        <SkeletonText width="70%" height={14} />
        <SkeletonText width="40%" height={12} />
      </div>
    </div>
  );
}
