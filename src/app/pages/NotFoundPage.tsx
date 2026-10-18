import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PackageX, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center">
        <PackageX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#17251F]">Page Not Found</h1>
      <p className="text-sm text-[#64736B] max-w-md">
        The wholesale page or inventory batch you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link to="/marketplace">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}
