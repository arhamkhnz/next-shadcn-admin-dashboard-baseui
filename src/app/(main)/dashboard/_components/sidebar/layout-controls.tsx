"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import type { ContentLayout, NavbarStyle, SidebarCollapsible, SidebarVariant } from "@/lib/preferences/layout";
import {
  applyContentLayout,
  applyFont,
  applyNavbarStyle,
  applySidebarCollapsible,
  applySidebarVariant,
} from "@/lib/preferences/layout-utils";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function LayoutControls() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const resolvedThemeMode = usePreferencesStore((s) => s.resolvedThemeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const themePreset = usePreferencesStore((s) => s.themePreset);
  const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
  const contentLayout = usePreferencesStore((s) => s.contentLayout);
  const setContentLayout = usePreferencesStore((s) => s.setContentLayout);
  const navbarStyle = usePreferencesStore((s) => s.navbarStyle);
  const setNavbarStyle = usePreferencesStore((s) => s.setNavbarStyle);
  const variant = usePreferencesStore((s) => s.sidebarVariant);
  const setSidebarVariant = usePreferencesStore((s) => s.setSidebarVariant);
  const collapsible = usePreferencesStore((s) => s.sidebarCollapsible);
  const setSidebarCollapsible = usePreferencesStore((s) => s.setSidebarCollapsible);
  const font = usePreferencesStore((s) => s.font);
  const setFont = usePreferencesStore((s) => s.setFont);
  const themePresetItems = THEME_PRESET_OPTIONS.map((preset) => ({
    value: preset.value,
    label: (
      <span className="flex items-center gap-1.5">
        <span
          className="size-2.5 rounded-full"
          style={{
            backgroundColor: (resolvedThemeMode ?? "light") === "dark" ? preset.primary.dark : preset.primary.light,
          }}
        />
        {preset.label}
      </span>
    ),
  }));
  const fontItems = fontOptions.map((option) => ({
    value: option.key,
    label: option.label,
  }));

  const getSingleToggleValue = <T extends string>(groupValue: string[]) => groupValue[0] as T | undefined;

  const onThemePresetChange = async (preset: ThemePreset) => {
    applyThemePreset(preset);
    setThemePreset(preset);
    persistPreference("theme_preset", preset);
  };

  const onThemeModeChange = async (mode: ThemeMode) => {
    setThemeMode(mode);
    persistPreference("theme_mode", mode);
  };

  const onContentLayoutChange = async (layout: ContentLayout) => {
    applyContentLayout(layout);
    setContentLayout(layout);
    persistPreference("content_layout", layout);
  };

  const onNavbarStyleChange = async (style: NavbarStyle) => {
    applyNavbarStyle(style);
    setNavbarStyle(style);
    persistPreference("navbar_style", style);
  };

  const onSidebarStyleChange = async (value: SidebarVariant) => {
    setSidebarVariant(value);
    applySidebarVariant(value);
    persistPreference("sidebar_variant", value);
  };

  const onSidebarCollapseModeChange = async (value: SidebarCollapsible) => {
    setSidebarCollapsible(value);
    applySidebarCollapsible(value);
    persistPreference("sidebar_collapsible", value);
  };

  const onFontChange = async (value: FontKey) => {
    applyFont(value);
    setFont(value);
    persistPreference("font", value);
  };

  const handleRestore = () => {
    onThemePresetChange(PREFERENCE_DEFAULTS.theme_preset);
    onThemeModeChange(PREFERENCE_DEFAULTS.theme_mode);
    onContentLayoutChange(PREFERENCE_DEFAULTS.content_layout);
    onNavbarStyleChange(PREFERENCE_DEFAULTS.navbar_style);
    onSidebarStyleChange(PREFERENCE_DEFAULTS.sidebar_variant);
    onSidebarCollapseModeChange(PREFERENCE_DEFAULTS.sidebar_collapsible);
    onFontChange(PREFERENCE_DEFAULTS.font);
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button size="icon" />}>
        <Settings />
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <h4 className="font-medium text-sm leading-none">Preferences</h4>
            <p className="text-muted-foreground text-xs">Customize your dashboard layout preferences.</p>
          </div>
          <div className="space-y-3 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
            <div className="space-y-1">
              <Label className="font-medium text-xs">Theme Preset</Label>
              <Select
                items={themePresetItems}
                value={themePreset}
                onValueChange={(value) => {
                  if (!value) return;
                  void onThemePresetChange(value as ThemePreset);
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue className="items-center" placeholder="Preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {THEME_PRESET_OPTIONS.map((preset) => (
                      <SelectItem key={preset.value} className="text-xs" value={preset.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                (resolvedThemeMode ?? "light") === "dark" ? preset.primary.dark : preset.primary.light,
                            }}
                          />
                          {preset.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Fonts</Label>
              <Select
                items={fontItems}
                value={font}
                onValueChange={(value) => {
                  if (!value) return;
                  void onFontChange(value as FontKey);
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.key} className="text-xs" value={font.key}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Theme Mode</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                value={[themeMode]}
                onValueChange={(value) => {
                  const mode = getSingleToggleValue<ThemeMode>(value);
                  if (!mode) return;
                  void onThemeModeChange(mode);
                }}
              >
                <ToggleGroupItem value="light" aria-label="Toggle light">
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Toggle dark">
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="Toggle system">
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Page Layout</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                value={[contentLayout]}
                onValueChange={(value) => {
                  const layout = getSingleToggleValue<ContentLayout>(value);
                  if (!layout) return;
                  void onContentLayoutChange(layout);
                }}
              >
                <ToggleGroupItem value="centered" aria-label="Toggle centered">
                  Centered
                </ToggleGroupItem>
                <ToggleGroupItem value="full-width" aria-label="Toggle full-width">
                  Full Width
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Navbar Behavior</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                value={[navbarStyle]}
                onValueChange={(value) => {
                  const style = getSingleToggleValue<NavbarStyle>(value);
                  if (!style) return;
                  void onNavbarStyleChange(style);
                }}
              >
                <ToggleGroupItem value="sticky" aria-label="Toggle sticky">
                  Sticky
                </ToggleGroupItem>
                <ToggleGroupItem value="scroll" aria-label="Toggle scroll">
                  Scroll
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Sidebar Style</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                value={[variant]}
                onValueChange={(value) => {
                  const nextVariant = getSingleToggleValue<SidebarVariant>(value);
                  if (!nextVariant) return;
                  void onSidebarStyleChange(nextVariant);
                }}
              >
                <ToggleGroupItem value="inset" aria-label="Toggle inset">
                  Inset
                </ToggleGroupItem>
                <ToggleGroupItem value="sidebar" aria-label="Toggle sidebar">
                  Sidebar
                </ToggleGroupItem>
                <ToggleGroupItem value="floating" aria-label="Toggle floating">
                  Floating
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Sidebar Collapse Mode</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                value={[collapsible]}
                onValueChange={(value) => {
                  const nextCollapsible = getSingleToggleValue<SidebarCollapsible>(value);
                  if (!nextCollapsible) return;
                  void onSidebarCollapseModeChange(nextCollapsible);
                }}
              >
                <ToggleGroupItem value="icon" aria-label="Toggle icon">
                  Icon
                </ToggleGroupItem>
                <ToggleGroupItem value="offcanvas" aria-label="Toggle offcanvas">
                  OffCanvas
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button type="button" size="sm" variant="outline" className="w-full text-xs" onClick={handleRestore}>
              Restore Defaults
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
