"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";

import NextImage from "next/image";
import { RxLineHeight } from "react-icons/rx";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  UploadCloud,
  Undo,
  Redo,
  MinusSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Strikethrough,
  PaintBucket,
  Type,
  TextQuote,
  Code,
  Image as ImageIcon,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cosmediate/ui/components/tooltip";
import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";
import { Input } from "@cosmediate/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cosmediate/ui/components/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@cosmediate/ui/components/dialog";
import { Label } from "@cosmediate/ui/components/label";

import { LineHeight } from "../extensions/lineHeight";
import { FontSize } from "../extensions/fontSize";
import { ImageAttributes } from "../extensions/imageAttributes";

import { imageUploadApi } from "@cosmediate/api";

// Keep your image attrs
type ExtendedImageAttributes = {
  src: string;
  alt?: string;
  title?: string;
  width?: string | null;
  height?: string | null;
  alignment?: string | null;
};

interface HtmlEditorProps {
  content?: JSONContent;
  setContent: (content: JSONContent) => void;
  containerClass?: string;

  /**
   * OPTIONAL: if you want to store HTML cache alongside JSON
   * call this on update or only on save; your choice.
   */
  setHtmlCache?: (html: string) => void;
}

export default function HtmlEditor({
  content,
  setContent,
  setHtmlCache,
  containerClass,
}: HtmlEditorProps) {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    width?: string;
    height?: string;
    alignment?: string;
    isEditing?: boolean;
  }>({ src: "" });

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),

      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-primary underline",
        },
        validate: (href) => !!href,
      }),

      Placeholder.configure({ placeholder: "Start typing here..." }),

      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: "editor-image" },
      }),

      ImageAttributes,

      LineHeight.configure({
        types: ["heading", "paragraph"],
        defaultLineHeight: "1.5",
        lineHeights: ["1", "1.15", "1.5", "2", "2.5", "3"],
      }),
    ],

    content: content,
    immediatelyRender: false,

    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none max-w-full w-full",
      },
    },

    // ✅ NO stringify, NO debounce, NO diffing
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);

      if (setHtmlCache) {
        // if this feels too frequent, call setHtmlCache only when user hits "Save"
        setHtmlCache(editor.getHTML());
      }
    },
  });

  // ✅ External content updates (no loops)
  useEffect(() => {
    if (!editor || !content) return;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  if (!editor) return null;

  const EditorButton = ({
    onClick,
    icon: Icon,
    tooltip,
    isActive = false,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    tooltip: string;
    isActive?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // prevents losing selection/focus
              editor.commands.focus();
              onClick();
            }}
            className={cn("h-8 w-8 p-0", isActive && "bg-muted text-primary")}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const handleLinkSubmit = () => {
    if (linkUrl) {
      const url = /^https?:\/\//.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().toggleLink({ href: url }).run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  const validateSizeValue = (
    value?: string,
    isWidth = false
  ): string | undefined => {
    if (!value || value === "auto") return "auto";

    // Accept px/%/em/rem/vh/vw and raw numbers
    const match = value.match(/^(\d+(\.\d+)?)(%|px|em|rem|vh|vw)?$/);
    if (!match) return "auto";

    const num = parseFloat(match[1] as string);
    const unit = match[3] || "px";

    if (isWidth && unit === "px" && num > 600) return "600px";
    return `${num}${unit}`;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("upload", file);

    const response = await imageUploadApi(formData);

    setSelectedImage({
      src: response.upload as string,
      width: "300px",
      height: "auto",
      alignment: "center",
      isEditing: false,
    });
    setIsImageDialogOpen(true);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageInsertOrSave = () => {
    if (!selectedImage.src) return;

    const validWidth = validateSizeValue(selectedImage.width, true);
    const validHeight = validateSizeValue(selectedImage.height);

    const attrs: ExtendedImageAttributes = {
      src: selectedImage.src,
      width: validWidth ?? null,
      height: validHeight ?? null,
      alignment: selectedImage.alignment ?? "center",
    };

    // If editing existing image: update node attrs
    const { state } = editor;
    const node = state.doc.nodeAt(state.selection.from);
    if (selectedImage.isEditing && node?.type.name === "image") {
      editor.chain().focus().updateAttributes("image", attrs).run();
    } else {
      editor
        .chain()
        .focus()
        .setImage(attrs as { src: string })
        .run();
    }

    setIsImageDialogOpen(false);
    setSelectedImage({ src: "" });
  };

  const handleImageEdit = () => {
    const { state } = editor;
    const node = state.doc.nodeAt(state.selection.from);
    if (!node || node.type.name !== "image") {
      alert("Please select an image first to edit its properties");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs = node.attrs as any;
    setSelectedImage({
      src: attrs.src,
      width: attrs.width || "300px",
      height: attrs.height || "auto",
      alignment: attrs.alignment || attrs["data-alignment"] || "center",
      isEditing: true,
    });
    setIsImageDialogOpen(true);
  };

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const fontSizes = [
    { label: "Small", value: "12px" },
    { label: "Normal", value: "16px" },
    { label: "Medium", value: "20px" },
    { label: "Large", value: "24px" },
    { label: "Huge", value: "32px" },
  ];

  const lineHeights = [
    { label: "Single", value: "1" },
    { label: "Tight", value: "1.15" },
    { label: "Normal", value: "1.5" },
    { label: "Relaxed", value: "2" },
    { label: "Double", value: "2.5" },
    { label: "Triple", value: "3" },
  ];

  const colorOptions = [
    { label: "Primary", value: "#6968ec" },
    { label: "Primary Dark", value: "#6262df" },
    { label: "Primary Light", value: "#f2f5ff" },
    { label: "Primary Soft", value: "#ebeeff" },
    { label: "Ghost White", value: "#f3f6ff" },
    { label: "Ghost Blue", value: "#f9faff" },
    { label: "Error", value: "#f88080" },
    { label: "Stroke", value: "#dadafc" },
    { label: "Black", value: "#000000" },
    { label: "Red", value: "#ff0000" },
    { label: "Blue", value: "#0000ff" },
    { label: "Green", value: "#00ff00" },
  ];

  return (
    <div
      className={cn(
        "w-full border border-stroke p-4 rounded-xl bg-card",
        containerClass
      )}
    >
      <div className="w-full flex flex-wrap gap-1 mb-3 p-1 border rounded-lg bg-muted/30">
        <EditorButton
          onClick={() => editor.chain().toggleBold().run()}
          icon={Bold}
          tooltip="Bold"
          isActive={editor.isActive("bold")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleItalic().run()}
          icon={Italic}
          tooltip="Italic"
          isActive={editor.isActive("italic")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleUnderline().run()}
          icon={UnderlineIcon}
          tooltip="Underline"
          isActive={editor.isActive("underline")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleStrike().run()}
          icon={Strikethrough}
          tooltip="Strikethrough"
          isActive={editor.isActive("strike")}
        />

        <div className="w-px h-6 bg-border self-center mx-1" />

        <EditorButton
          onClick={() => editor.chain().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          tooltip="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
        />
        <EditorButton
          onClick={() => editor.chain().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          tooltip="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
        />
        <EditorButton
          onClick={() => editor.chain().toggleHeading({ level: 3 }).run()}
          icon={Heading3}
          tooltip="Heading 3"
          isActive={editor.isActive("heading", { level: 3 })}
        />

        <div className="w-px h-6 bg-border self-center mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 px-2"
              type="button"
            >
              <Type className="h-4 w-4 mr-1" />
              <span className="text-xs">Size</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onSelect={(e) => {
                  e.preventDefault();
                  editor
                    .chain()
                    .focus()
                    .setMark("textStyle", { fontSize: size.value })
                    .run();
                }}
              >
                <span style={{ fontSize: size.value }}>{size.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              type="button"
            >
              <PaintBucket className="h-4 w-4 mr-1" />
              <span className="text-xs">Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="grid grid-cols-7 gap-1">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className="h-6 w-6 p-0 rounded-full"
                  style={{ backgroundColor: color.value }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.commands.focus();
                    handleColorChange(color.value);
                  }}
                  type="button"
                />
              ))}
            </div>
            <div className="flex items-center mt-2">
              <input
                type="color"
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer"
              />
              <span className="ml-2 text-xs">Custom color</span>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border self-center mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 px-2"
              type="button"
            >
              <RxLineHeight
                className="size-5 text-gray-800"
                title="Line Height"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {lineHeights.map((height) => (
              <DropdownMenuItem
                key={height.value}
                onSelect={(e) => {
                  e.preventDefault();
                  editor.commands.setLineHeight(height.value);
                }}
              >
                <div className="flex items-center">
                  <span>{height.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {height.value}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border self-center mx-1" />

        <EditorButton
          onClick={() => editor.chain().setTextAlign("left").run()}
          icon={AlignLeft}
          tooltip="Align Left"
          isActive={editor.isActive({ textAlign: "left" })}
        />
        <EditorButton
          onClick={() => editor.chain().setTextAlign("center").run()}
          icon={AlignCenter}
          tooltip="Align Center"
          isActive={editor.isActive({ textAlign: "center" })}
        />
        <EditorButton
          onClick={() => editor.chain().setTextAlign("right").run()}
          icon={AlignRight}
          tooltip="Align Right"
          isActive={editor.isActive({ textAlign: "right" })}
        />

        <div className="w-px h-6 bg-border self-center mx-1" />

        <EditorButton
          onClick={() => editor.chain().toggleBulletList().run()}
          icon={List}
          tooltip="Bullet List"
          isActive={editor.isActive("bulletList")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleOrderedList().run()}
          icon={ListOrdered}
          tooltip="Numbered List"
          isActive={editor.isActive("orderedList")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleBlockquote().run()}
          icon={TextQuote}
          tooltip="Blockquote"
          isActive={editor.isActive("blockquote")}
        />
        <EditorButton
          onClick={() => editor.chain().toggleCodeBlock().run()}
          icon={Code}
          tooltip="Code Block"
          isActive={editor.isActive("codeBlock")}
        />

        <div className="w-px h-6 bg-border self-center mx-1" />

        <EditorButton
          onClick={() => editor.chain().setHorizontalRule().run()}
          icon={MinusSquare}
          tooltip="Horizontal Rule"
        />

        <EditorButton
          onClick={() => {
            const { from, to } = editor.state.selection;
            if (from !== to) setIsLinkDialogOpen(true);
            else alert("Please select some text first to create a link");
          }}
          icon={LinkIcon}
          tooltip="Add Link"
          isActive={editor.isActive("link")}
        />

        <EditorButton
          onClick={() => fileInputRef.current?.click()}
          icon={UploadCloud}
          tooltip="Upload Image"
        />

        <EditorButton
          onClick={handleImageEdit}
          icon={ImageIcon}
          tooltip="Edit Selected Image"
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="w-px h-6 bg-border self-center mx-1" />

        <EditorButton
          onClick={() => editor.chain().undo().run()}
          icon={Undo}
          tooltip="Undo"
        />
        <EditorButton
          onClick={() => editor.chain().redo().run()}
          icon={Redo}
          tooltip="Redo"
        />
      </div>

      <div className="w-full editor-container">
        <EditorContent
          editor={editor}
          className="min-w-full prose prose-sm dark:prose-invert text-gray-800 border border-stroke rounded-lg p-3 min-h-[200px] focus-within:border-300 overflow-auto"
        />
      </div>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link">URL</Label>
              <Input
                id="link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleLinkSubmit} type="button">
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Properties Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Properties</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {selectedImage.src && (
              <div className="flex justify-center">
                <div
                  className="w-full overflow-hidden border rounded"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div className="overflow-hidden flex justify-center items-center max-h-[180px]">
                    <NextImage
                      height={200}
                      width={200}
                      src={selectedImage.src}
                      alt="Preview"
                      className="object-contain max-h-[180px] w-[300px]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Width</Label>
                <div className="relative">
                  <Input
                    id="width"
                    type="text"
                    inputMode="numeric"
                    value={
                      selectedImage.width === "auto"
                        ? ""
                        : selectedImage.width?.replace(/[^0-9]/g, "")
                    }
                    onChange={(e) => {
                      const n = e.target.value.replace(/[^0-9]/g, "");
                      if (!n)
                        setSelectedImage({ ...selectedImage, width: "auto" });
                      else
                        setSelectedImage({
                          ...selectedImage,
                          width: `${Math.min(+n, 600)}px`,
                        });
                    }}
                    placeholder="300"
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    px
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Leave empty for auto (max 600px)
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="height">Height</Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="text"
                    inputMode="numeric"
                    value={
                      selectedImage.height === "auto"
                        ? ""
                        : selectedImage.height?.replace(/[^0-9]/g, "")
                    }
                    onChange={(e) => {
                      const n = e.target.value.replace(/[^0-9]/g, "");
                      if (!n)
                        setSelectedImage({ ...selectedImage, height: "auto" });
                      else
                        setSelectedImage({
                          ...selectedImage,
                          height: `${n}px`,
                        });
                    }}
                    placeholder="auto"
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    px
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Leave empty for auto
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Alignment</Label>
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant={
                    selectedImage.alignment === "left" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() =>
                    setSelectedImage({ ...selectedImage, alignment: "left" })
                  }
                >
                  <AlignLeft className="h-4 w-4 mr-2" /> Left
                </Button>

                <Button
                  type="button"
                  variant={
                    selectedImage.alignment === "center" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() =>
                    setSelectedImage({ ...selectedImage, alignment: "center" })
                  }
                >
                  <AlignCenter className="h-4 w-4 mr-2" /> Center
                </Button>

                <Button
                  type="button"
                  variant={
                    selectedImage.alignment === "right" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() =>
                    setSelectedImage({ ...selectedImage, alignment: "right" })
                  }
                >
                  <AlignRight className="h-4 w-4 mr-2" /> Right
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsImageDialogOpen(false);
                setSelectedImage({ src: "" });
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleImageInsertOrSave} type="button">
              {selectedImage.isEditing ? "Save Changes" : "Insert Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
