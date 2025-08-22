
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

const STANDARD_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
  '#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFE6CC', '#CCFFCC',
  '#E6E6FA', '#F0E68C', '#DDA0DD', '#98FB98', '#F5DEB3', '#D2B48C', '#BC8F8F', '#CD853F'
];

const THEME_COLORS = [
  '#00C73D', '#00C83C', '#02B1FF', '#FE9200', '#404040', '#52FFD9', 
  '#45E39E', '#FFAE08', '#8FE000', '#45AD00', '#00F0E0', 
];

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('#000000');
  const [rgbR, setRgbR] = useState(0);
  const [rgbG, setRgbG] = useState(0);
  const [rgbB, setRgbB] = useState(0);

  const handleRgbChange = () => {
    const hexColor = `#${rgbR.toString(16).padStart(2, '0')}${rgbG.toString(16).padStart(2, '0')}${rgbB.toString(16).padStart(2, '0')}`;
    setCustomColor(hexColor);
    onColorSelect(hexColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Colores del tema</Label>
            <div className="grid grid-cols-6 gap-1 mt-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Colores estándar</Label>
            <div className="grid grid-cols-8 gap-1 mt-2">
              {STANDARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Color personalizado</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onColorSelect(e.target.value);
                }}
                className="w-12 h-8 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onColorSelect(e.target.value);
                }}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
            
            {/*<div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">R</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbR}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRgbR(Math.min(255, Math.max(0, value)));
                    handleRgbChange();
                  }}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">G</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbG}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRgbG(Math.min(255, Math.max(0, value)));
                    handleRgbChange();
                  }}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">B</Label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbB}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRgbB(Math.min(255, Math.max(0, value)));
                    handleRgbChange();
                  }}
                  className="text-xs"
                />
              </div>
            </div>*/}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
