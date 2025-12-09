import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Star, Code, Layout, Grid, Columns, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewsWidgetsTabProps {
  listingId: string;
  businessName: string;
}

type LayoutType = 'list' | 'grid' | 'masonry' | 'carousel' | 'slider';

export default function ReviewsWidgetsTab({ listingId, businessName }: ReviewsWidgetsTabProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Widget configuration
  const [layout, setLayout] = useState<LayoutType>('list');
  const [maxReviews, setMaxReviews] = useState([5]);
  const [minRating, setMinRating] = useState([4]);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#1f2937');

  const widgetUrl = `${window.location.origin}/widget/reviews/${listingId}?layout=${layout}&max=${maxReviews[0]}&minRating=${minRating[0]}&primary=${encodeURIComponent(primaryColor)}&bg=${encodeURIComponent(backgroundColor)}&text=${encodeURIComponent(textColor)}`;

  const embedCode = `<iframe 
  src="${widgetUrl}"
  width="100%"
  height="${layout === 'list' ? '600' : '400'}"
  frameborder="0"
  style="border-radius: 8px; max-width: 100%;"
  title="${businessName} Reviews"
></iframe>`;

  const scriptCode = `<div id="reviews-widget-${listingId}"></div>
<script src="${window.location.origin}/widget/reviews.js" 
  data-business-id="${listingId}"
  data-layout="${layout}"
  data-max="${maxReviews[0]}"
  data-min-rating="${minRating[0]}"
  data-primary="${primaryColor}"
  data-bg="${backgroundColor}"
  data-text="${textColor}">
</script>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const layoutOptions: { value: LayoutType; label: string; icon: React.ReactNode }[] = [
    { value: 'list', label: 'List', icon: <Layout className="h-4 w-4" /> },
    { value: 'grid', label: 'Grid', icon: <Grid className="h-4 w-4" /> },
    { value: 'masonry', label: 'Masonry', icon: <Columns className="h-4 w-4" /> },
    { value: 'carousel', label: 'Carousel', icon: <Play className="h-4 w-4" /> },
    { value: 'slider', label: 'Slider', icon: <Play className="h-4 w-4 rotate-90" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Widget Builder</CardTitle>
            <CardDescription>
              Customize how your reviews widget looks on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layout Selection */}
            <div className="space-y-3">
              <Label>Layout Style</Label>
              <div className="grid grid-cols-5 gap-2">
                {layoutOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={layout === option.value ? 'default' : 'outline'}
                    size="sm"
                    className="flex flex-col h-auto py-3 gap-1"
                    onClick={() => setLayout(option.value)}
                  >
                    {option.icon}
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Max Reviews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max Reviews to Show</Label>
                <Badge variant="secondary">{maxReviews[0]}</Badge>
              </div>
              <Slider
                value={maxReviews}
                onValueChange={setMaxReviews}
                min={1}
                max={20}
                step={1}
              />
            </div>

            {/* Min Rating */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Minimum Star Rating</Label>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">{minRating[0]}</Badge>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <Slider
                value={minRating}
                onValueChange={setMinRating}
                min={1}
                max={5}
                step={1}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code and paste it into your website HTML
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={embedCode}
              readOnly
              rows={8}
              className="font-mono text-xs bg-muted"
            />
            <Button onClick={handleCopyEmbed} className="w-full">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card className="h-fit sticky top-4">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your widget will look on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg overflow-hidden border border-border"
            style={{ backgroundColor }}
          >
            <div className="p-4">
              {/* Mock Preview */}
              <div className="space-y-4">
                <h3 
                  className="font-semibold text-lg"
                  style={{ color: textColor }}
                >
                  Customer Reviews
                </h3>
                
                {layout === 'grid' || layout === 'masonry' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(Math.min(4, maxReviews[0]))].map((_, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg border"
                        style={{ borderColor: primaryColor + '30' }}
                      >
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, s) => (
                            <Star 
                              key={s} 
                              className="h-3 w-3"
                              style={{ 
                                color: s < 5 - i % 2 ? '#facc15' : '#e5e7eb',
                                fill: s < 5 - i % 2 ? '#facc15' : 'transparent'
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: textColor + 'cc' }}>
                          Great service and quality equipment...
                        </p>
                        <p className="text-xs mt-2 font-medium" style={{ color: textColor }}>
                          - Customer {i + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : layout === 'carousel' || layout === 'slider' ? (
                  <div 
                    className="p-4 rounded-lg border text-center"
                    style={{ borderColor: primaryColor + '30' }}
                  >
                    <div className="flex justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, s) => (
                        <Star 
                          key={s} 
                          className="h-5 w-5"
                          style={{ 
                            color: '#facc15',
                            fill: '#facc15'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm" style={{ color: textColor + 'cc' }}>
                      "Excellent rental experience. Would definitely recommend!"
                    </p>
                    <p className="text-sm mt-3 font-medium" style={{ color: textColor }}>
                      - Happy Customer
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      {[...Array(Math.min(5, maxReviews[0]))].map((_, i) => (
                        <div 
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: i === 0 ? primaryColor : primaryColor + '40'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...Array(Math.min(3, maxReviews[0]))].map((_, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg border"
                        style={{ borderColor: primaryColor + '30' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm" style={{ color: textColor }}>
                            Customer {i + 1}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <Star 
                                key={s} 
                                className="h-3 w-3"
                                style={{ 
                                  color: s < 5 - i % 2 ? '#facc15' : '#e5e7eb',
                                  fill: s < 5 - i % 2 ? '#facc15' : 'transparent'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: textColor + 'cc' }}>
                          Amazing experience! The equipment was in perfect condition and the staff was very helpful.
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  size="sm" 
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  View All Reviews
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
