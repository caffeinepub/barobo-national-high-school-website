import BannerManager from '@/components/BannerManager';
import PageHeader from '@/components/PageHeader';

export default function BannerManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <PageHeader
        title="Banner Management"
        description="Upload and manage the school website banner"
      />
      <BannerManager />
    </div>
  );
}
