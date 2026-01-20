import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="PhotoGift Pro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@photogift.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" placeholder="29XXXXX1234X1ZX" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Main Street, City, State - 123456" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Configure invoice generation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input id="invoicePrefix" placeholder="INV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" placeholder="18" />
            </div>
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
