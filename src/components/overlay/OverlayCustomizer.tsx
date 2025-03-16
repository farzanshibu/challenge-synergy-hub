
import { useState, useEffect } from 'react';
import { useOverlaySettingsStore } from '@/store/overlaySettingsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import OverlayPreview from './OverlayPreview';
import AudioUploader from './AudioUploader';
import { Loader2, Save, RotateCcw } from 'lucide-react';

export default function OverlayCustomizer() {
  const { toast } = useToast();
  const { settings, loading, fetchSettings, saveSettings, resetToDefaults } = useOverlaySettingsStore();
  
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiType, setConfettiType] = useState('default');
  
  // Load settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setPosition({ x: settings.position_x, y: settings.position_y });
      setSize({ width: settings.width, height: settings.height });
      setHtmlTemplate(settings.html_template);
      setCssCode(settings.css_code);
      setJsCode(settings.js_code);
      setConfettiEnabled(settings.confetti_enabled);
      setSoundEnabled(settings.sound_enabled);
      setConfettiType(settings.confetti_type);
    }
  }, [settings]);
  
  const handleSave = async () => {
    try {
      await saveSettings({
        position_x: position.x,
        position_y: position.y,
        width: size.width,
        height: size.height,
        html_template: htmlTemplate,
        css_code: cssCode,
        js_code: jsCode,
        confetti_enabled: confettiEnabled,
        sound_enabled: soundEnabled,
        confetti_type: confettiType
      });
      
      toast({
        title: "Settings saved",
        description: "Your overlay customizations have been saved"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };
  
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all settings to default values? This cannot be undone.")) {
      await resetToDefaults();
    }
  };
  
  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-zinc-800 border-zinc-900">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-zinc-100">Overlay Customization</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={handleReset} 
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="position">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="position">Position & Size</TabsTrigger>
                <TabsTrigger value="template">HTML Template</TabsTrigger>
                <TabsTrigger value="styling">CSS Styling</TabsTrigger>
                <TabsTrigger value="animations">Animations & Audio</TabsTrigger>
              </TabsList>
              
              <TabsContent value="position" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-100">Horizontal Position (X)</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[position.x]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setPosition({ ...position, x: value[0] })}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        value={position.x}
                        onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-zinc-900 border-zinc-700 text-zinc-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-100">Vertical Position (Y)</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[position.y]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setPosition({ ...position, y: value[0] })}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        value={position.y}
                        onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-zinc-900 border-zinc-700 text-zinc-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-100">Width</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[size.width]}
                        min={100}
                        max={800}
                        step={10}
                        onValueChange={(value) => setSize({ ...size, width: value[0] })}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        value={size.width}
                        onChange={(e) => setSize({ ...size, width: parseInt(e.target.value) || 300 })}
                        className="w-20 bg-zinc-900 border-zinc-700 text-zinc-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-100">Height</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[size.height]}
                        min={50}
                        max={500}
                        step={10}
                        onValueChange={(value) => setSize({ ...size, height: value[0] })}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        value={size.height}
                        onChange={(e) => setSize({ ...size, height: parseInt(e.target.value) || 200 })}
                        className="w-20 bg-zinc-900 border-zinc-700 text-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="template" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-100">HTML Template</Label>
                  <div className="text-xs text-zinc-400 mb-2">
                    Use these variables in your template:<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{title}}</code> - Challenge title<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{currentValue}}</code> - Current progress<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{maxValue}}</code> - Target value<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{progressPercent}}</code> - Progress percentage<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{hasEndDate}}</code> - "true" or "false"<br />
                    <code className="bg-zinc-900 px-1 py-0.5 rounded">{{timeLeft}}</code> - Remaining time text
                  </div>
                  <Textarea 
                    value={htmlTemplate}
                    onChange={(e) => setHtmlTemplate(e.target.value)}
                    className="h-64 font-mono text-sm bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="styling" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-100">CSS Styling</Label>
                  <Textarea 
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="h-64 font-mono text-sm bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="animations" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-zinc-100">Enable Confetti</Label>
                      <p className="text-xs text-zinc-400">Show confetti animation on milestone achievements</p>
                    </div>
                    <Switch 
                      checked={confettiEnabled}
                      onCheckedChange={setConfettiEnabled}
                    />
                  </div>
                  
                  {confettiEnabled && (
                    <div className="space-y-2">
                      <Label className="text-zinc-100">Confetti Type</Label>
                      <select 
                        value={confettiType}
                        onChange={(e) => setConfettiType(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-md p-2"
                      >
                        <option value="default">Default</option>
                        <option value="fireworks">Fireworks</option>
                        <option value="stars">Stars</option>
                        <option value="emoji">Emoji</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-zinc-100">Enable Sound Effects</Label>
                      <p className="text-xs text-zinc-400">Play sounds on challenge interactions</p>
                    </div>
                    <Switch 
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                  
                  {soundEnabled && (
                    <div className="space-y-6">
                      <AudioUploader type="increment" />
                      <AudioUploader type="decrement" />
                      <AudioUploader type="reset" />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="col-span-1">
        <Card className="bg-zinc-800 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <OverlayPreview 
              position={position}
              size={size}
              htmlTemplate={htmlTemplate}
              cssCode={cssCode}
              jsCode={jsCode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
